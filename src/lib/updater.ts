import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export interface AppRelease {
  version: string;
  tagName: string;
  publishedAt: string;
  body: string;
  apkUrl: string | null;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export function getCurrentAppVersion(): string {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
}

export function getAppRepo(): string {
  return typeof __APP_REPO__ !== 'undefined' ? __APP_REPO__ : 'alpha-1-design/Gia-co-Design-';
}

export async function fetchLatestRelease(repo: string = getAppRepo()): Promise<AppRelease | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const assets: any[] = Array.isArray(data.assets) ? data.assets : [];
    const apkAsset =
      assets.find((a) => a.name && a.name.endsWith('-release.apk')) ||
      assets.find((a) => a.name && a.name.endsWith('.apk')) ||
      null;
    return {
      version: String(data.tag_name || '').replace(/^v/, ''),
      tagName: String(data.tag_name || ''),
      publishedAt: typeof data.published_at === 'string' ? data.published_at : '',
      body: typeof data.body === 'string' ? data.body : '',
      apkUrl: apkAsset ? apkAsset.browser_download_url : null,
    };
  } catch (e) {
    console.warn('Update check failed:', e);
    return null;
  }
}

export function hasUpdate(current: string, latest: string): boolean {
  if (!latest) return false;
  return compareVersions(latest, current) > 0;
}

export async function openReleaseDownload(apkUrl: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url: apkUrl });
      return;
    } catch (e) {
      console.warn('Browser.open failed, falling back to window.open', e);
    }
  }
  window.open(apkUrl, '_blank', 'noopener,noreferrer');
}
