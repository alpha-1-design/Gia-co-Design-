import { DesignSession, DesignScreen } from '../types';

const HASH_PREFIX = '#s=';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64ToBytes(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export function buildSharePayload(screen: DesignScreen, sessionTitle: string): string {
  return JSON.stringify({
    v: 2,
    title: sessionTitle,
    screenName: screen.name,
    createdAt: screen.createdAt,
    updatedAt: Date.now(),
    activeTurnIndex: screen.activeTurnIndex,
    turns: screen.turns.map((t) => ({
      id: t.id,
      role: t.role,
      prompt: t.prompt,
      codeHtml: t.codeHtml,
      directions: t.directions,
      activeDirection: t.activeDirection,
      timestamp: t.timestamp,
      modelUsed: t.modelUsed,
      tokensCost: t.tokensCost,
      pins: t.pins,
    })),
  });
}

export async function encodeShareLink(screen: DesignScreen, sessionTitle: string): Promise<string> {
  const payload = buildSharePayload(screen, sessionTitle);
  const compressed = await gzip(new TextEncoder().encode(payload));
  const hash = `${HASH_PREFIX}${bytesToBase64(compressed)}`;
  // A bare hash fragment isn't a usable link on its own - nothing to copy
  // and paste without the scheme/host/path in front of it. Build the real,
  // absolute, clickable URL the person actually asked to share.
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

export function parseShareHash(hash: string): { ok: true; payload: string } | { ok: false; error: string } {
  if (!hash.startsWith(HASH_PREFIX)) return { ok: false, error: 'Not a shared design link.' };
  try {
    const b64 = hash.slice(HASH_PREFIX.length);
    if (!b64 || b64.length < 8) return { ok: false, error: 'Shared design data is empty or truncated.' };
    return { ok: true, payload: b64 };
  } catch (e) {
    return { ok: false, error: 'Could not decode shared design.' };
  }
}

export async function decodeShareHash(hash: string): Promise<DesignSession | null> {
  const parsed = parseShareHash(hash);
  if (!parsed.ok) return null;
  try {
    const decompressed = await gunzip(base64ToBytes(parsed.payload));
    const json = JSON.parse(new TextDecoder().decode(decompressed));
    if (!Array.isArray(json?.turns) || json.turns.length === 0) return null;
    const turns = json.turns.map((t: any) => ({
      id: t.id || `turn-${Date.now()}`,
      role: t.role === 'user' ? 'user' : 'assistant',
      prompt: String(t.prompt || ''),
      codeHtml: String(t.codeHtml || ''),
      directions: Array.isArray(t.directions) ? t.directions.map(String) : undefined,
      activeDirection: typeof t.activeDirection === 'number' ? t.activeDirection : 0,
      timestamp: typeof t.timestamp === 'number' ? t.timestamp : Date.now(),
      modelUsed: String(t.modelUsed || 'shared'),
      tokensCost: typeof t.tokensCost === 'number' ? t.tokensCost : undefined,
      pins: Array.isArray(t.pins) ? t.pins : undefined,
    }));
    const screen: DesignScreen = {
      id: `shared-screen-${Date.now()}`,
      name: String(json.screenName || 'Shared Screen'),
      kind: 'other',
      turns,
      activeTurnIndex: Math.min(Math.max(Number(json.activeTurnIndex) || 0, 0), turns.length - 1),
      createdAt: typeof json.createdAt === 'number' ? json.createdAt : Date.now(),
    };
    return {
      id: `shared-${Date.now()}`,
      title: String(json.title || 'Shared Design'),
      createdAt: typeof json.createdAt === 'number' ? json.createdAt : Date.now(),
      updatedAt: typeof json.updatedAt === 'number' ? json.updatedAt : Date.now(),
      screens: [screen],
      activeScreenId: screen.id,
    };
  } catch (e) {
    console.error('Failed to decode shared design:', e);
    return null;
  }
}

export function clearShareHash() {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
