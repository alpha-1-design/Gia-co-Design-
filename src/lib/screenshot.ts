import { PreviewDevice } from '../types';

const DEVICE_VIEWPORTS: Record<PreviewDevice, { width: number; height: number }> = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1280, height: 800 },
};

function corsPatchHtml(html: string): string {
  return html.replace(/<img(?![^>]*\bcrossorigin=)[^>]*>/gi, (tag) =>
    tag.replace(/^\s*<img/i, '<img crossorigin="anonymous"')
  );
}

export async function captureDesignPng(codeHtml: string, device: PreviewDevice): Promise<Blob> {
  const { width, height } = DEVICE_VIEWPORTS[device] || DEVICE_VIEWPORTS.desktop;
  const scale = Math.min(window.devicePixelRatio || 1, 2);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.border = 'none';
  iframe.sandbox = 'allow-scripts allow-same-origin';
  iframe.srcdoc = corsPatchHtml(codeHtml);

  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error('Could not access preview document.');

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          const fonts = (doc as any).fonts?.ready;
          if (fonts && typeof fonts.then === 'function') {
            Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => resolve());
          } else {
            resolve();
          }
        } catch {
          resolve();
        }
      }, 250);
    });

    await new Promise<void>((resolve) => {
      const images = Array.from(doc.images || []);
      if (images.length === 0) {
        setTimeout(resolve, 100);
        return;
      }
      let pending = images.length;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        setTimeout(resolve, 120);
      };
      images.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) pending -= 1;
        else {
          img.addEventListener('load', () => { pending -= 1; if (pending <= 0) finish(); }, { once: true });
          img.addEventListener('error', () => { pending -= 1; if (pending <= 0) finish(); }, { once: true });
        }
      });
      if (pending <= 0) finish();
      setTimeout(finish, 4000);
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(iframe as unknown as CanvasImageSource, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG encoding failed.');
    return blob;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/tainted|SecurityError/i.test(msg)) {
      throw new Error('Screenshot blocked: the design loads images from a server that does not allow capture. Use Export → HTML instead.');
    }
    throw e;
  } finally {
    iframe.remove();
  }
}
