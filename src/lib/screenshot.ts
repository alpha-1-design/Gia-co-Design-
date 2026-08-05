import { PreviewDevice } from '../types';
import { DEVICE_VIEWPORTS } from './deviceViewports';

function corsPatchHtml(html: string): string {
  return html.replace(/<img(?![^>]*\bcrossorigin=)[^>]*>/gi, (tag) =>
    tag.replace(/^\s*<img/i, '<img crossorigin="anonymous"')
  );
}

async function waitForIframeReady(doc: Document): Promise<void> {
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
}

// Canvas 2D's drawImage() has never accepted an <iframe> as a source — only
// images, canvases, video, etc. To rasterize the iframe's rendered document,
// serialize it (this preserves the <style> tag the Tailwind CDN script
// injects at runtime), wrap it in an SVG <foreignObject>, and load that SVG
// as a real Image, which drawImage *does* accept.
function serializeIframeForCapture(doc: Document, width: number, height: number): string {
  const root = doc.documentElement.cloneNode(true) as HTMLElement;
  root.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const body = root.querySelector('body');
  if (body) {
    (body as HTMLElement).style.margin = '0';
    (body as HTMLElement).style.width = `${width}px`;
    (body as HTMLElement).style.minHeight = `${height}px`;
  }
  const serialized = new XMLSerializer().serializeToString(root);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
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

    await waitForIframeReady(doc);

    const svgMarkup = serializeIframeForCapture(doc, width, height);
    const svgUrl = URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }));

    const rasterSource = new Image();
    rasterSource.width = width;
    rasterSource.height = height;

    try {
      await new Promise<void>((resolve, reject) => {
        rasterSource.onload = () => resolve();
        rasterSource.onerror = () =>
          reject(new Error('Could not rasterize the design preview. Try Export → HTML instead.'));
        rasterSource.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable.');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(rasterSource, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG encoding failed.');
      return blob;
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
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
