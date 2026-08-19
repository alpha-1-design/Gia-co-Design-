/**
 * Gia-co-Design — Environment-Aware API Client
 *
 * The app works fully standalone — all design features (AI generation,
 * canvas, exports) work on GitHub Pages, Android APK, and local dev
 * without any backend server.
 *
 * OPTIONAL: Detects the gia-cli companion running on localhost:4000.
 * When found, unlocks terminal features (exec, package install, file storage).
 * When not found, these features are simply unavailable — no errors on startup.
 */

// ---------------------------------------------------------------------------
// Companion detection
// ---------------------------------------------------------------------------

let _companionAvailable: boolean | null = null;
let _companionType: string | null = null;

const COMPANION_URL = 'http://localhost:4000';

async function detectCompanion(): Promise<boolean> {
  if (_companionAvailable !== null) return _companionAvailable;
  try {
    const res = await fetch(`${COMPANION_URL}/api/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      _companionType = data.type || 'unknown';
      _companionAvailable = true;
    } else {
      _companionAvailable = false;
    }
  } catch {
    _companionAvailable = false;
  }
  return _companionAvailable;
}

/** Force re-check (e.g., after user runs `gia start`). */
export async function checkCompanion(): Promise<boolean> {
  _companionAvailable = null;
  _companionType = null;
  return detectCompanion();
}

/** Whether the gia-cli companion is reachable. */
export async function isCompanionAvailable(): Promise<boolean> {
  return detectCompanion();
}

/** Get the companion type (e.g., 'gia-cli'). */
export async function getCompanionType(): Promise<string | null> {
  await detectCompanion();
  return _companionType;
}

// ---------------------------------------------------------------------------
// Provider config (for direct browser→provider calls)
// ---------------------------------------------------------------------------

const PROVIDER_CONFIG: Record<string, { baseUrl: string; defaultModel: string }> = {
  gemini:      { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-2.5-flash' },
  openai:      { baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  anthropic:   { baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-sonnet-4-20250514' },
  openrouter:  { baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'anthropic/claude-sonnet-4' },
  groq:        { baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
  deepseek:    { baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  mistral:     { baseUrl: 'https://api.mistral.ai/v1', defaultModel: 'mistral-large-latest' },
  together:    { baseUrl: 'https://api.together.xyz/v1', defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' },
  xai:         { baseUrl: 'https://api.x.ai/v1', defaultModel: 'grok-2' },
  ollama:      { baseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3.2' },
};

function cleanApiKey(key: string | undefined): string {
  if (!key) return '';
  return key.replace(/^['"]|['"]$/g, '').trim();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AICallRequest {
  provider: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  prompt: string;
  systemPrompt?: string;
  images?: Array<{ mimeType?: string; base64?: string; url?: string }>;
  temperature?: number;
  origin?: string;
}

export interface AICallResponse {
  text: string;
  tokensEstimate: number;
}

export interface ModelInfo {
  value: string;
  label: string;
}

// ---------------------------------------------------------------------------
// AI — Always direct browser→provider calls
//
// AI generation works everywhere — no companion needed.
// Keys are stored in localStorage, calls go direct to providers.
// ---------------------------------------------------------------------------

export async function callAI(req: AICallRequest): Promise<AICallResponse> {
  const pDef = PROVIDER_CONFIG[req.provider];
  if (!pDef) throw new Error(`Unknown provider: ${req.provider}`);

  const model = req.model || pDef.defaultModel;
  const key = cleanApiKey(req.apiKey);
  const baseUrl = (req.baseUrl || pDef.baseUrl).replace(/\/+$/, '');

  const userContent: any[] = [];
  if (req.prompt) userContent.push({ type: 'text', text: req.prompt });
  if (req.images) {
    for (const img of req.images) {
      if (img.url) {
        userContent.push({ type: 'image_url', image_url: { url: img.url } });
      } else if (img.base64) {
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${img.mimeType || 'image/png'};base64,${img.base64}` },
        });
      }
    }
  }

  let rawText = '';

  if (req.provider === 'gemini') {
    if (!key) throw new Error('Gemini API key not set. Open Settings and enter your key.');

    const contents: any[] = [];
    const parts: any[] = [];
    for (const item of userContent) {
      if (item.type === 'text') parts.push({ text: item.text });
      if (item.type === 'image_url') {
        const url = item.image_url.url;
        if (url.startsWith('data:')) {
          const [header, b64] = url.split(',');
          const mimeMatch = header.match(/data:([^;]+)/);
          parts.push({ inlineData: { mimeType: mimeMatch?.[1] || 'image/png', data: b64 } });
        }
      }
    }
    if (req.systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: req.systemPrompt + '\n\n' + (userContent[0]?.text || '') }] });
    } else {
      contents.push({ role: 'user', parts });
    }

    const res = await fetch(
      `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini API (${res.status}): ${err?.error?.message || res.statusText}`);
    }
    const data = await res.json();
    rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else if (req.provider === 'anthropic') {
    if (!key) throw new Error('Anthropic API key not set. Open Settings and enter your key.');

    const content = userContent.map((item) => {
      if (item.type === 'text') return { type: 'text', text: item.text };
      if (item.type === 'image_url') {
        const url = item.image_url.url;
        if (url.startsWith('data:')) {
          const [header, b64] = url.split(',');
          const mimeMatch = header.match(/data:([^;]+)/);
          return { type: 'image', source: { type: 'base64', media_type: mimeMatch?.[1] || 'image/png', data: b64 } };
        }
      }
      return null;
    }).filter(Boolean);

    const res = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model, max_tokens: 4096, system: req.systemPrompt || '',
        messages: [{ role: 'user', content }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic API (${res.status}): ${err?.error?.message || res.statusText}`);
    }
    const data = await res.json();
    rawText = data.content?.[0]?.text || '';

  } else {
    // OpenAI-compatible
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (key && key !== 'ollama') headers['Authorization'] = `Bearer ${key}`;
    if (req.provider === 'openrouter') {
      headers['HTTP-Referer'] = req.origin || window.location.origin;
      headers['X-Title'] = 'Gia-co-Design';
    }

    const messages: any[] = [];
    if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
    messages.push({ role: 'user', content: userContent });

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST', headers,
      body: JSON.stringify({ model, messages, temperature: req.temperature ?? 0.7 }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`${req.provider.toUpperCase()} API (${res.status}): ${err?.error?.message || err?.detail || res.statusText}`);
    }
    const data = await res.json();
    rawText = data.choices?.[0]?.message?.content || '';
  }

  const tokensEstimate = Math.round((req.prompt?.length || 0) / 4 + rawText.length / 4);
  return { text: rawText, tokensEstimate };
}

// ---------------------------------------------------------------------------
// AI Streaming — token-by-token delivery via callback
//
// Works for OpenAI-compatible providers (stream: true).
// Gemini uses streamGenerateContent.
// Falls back to non-streaming if the provider doesn't support it.
// ---------------------------------------------------------------------------

export type StreamChunk = { token: string } | { done: true; fullText: string; tokensEstimate: number };

export async function callAIStream(
  req: AICallRequest,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  const pDef = PROVIDER_CONFIG[req.provider];
  if (!pDef) throw new Error(`Unknown provider: ${req.provider}`);

  const model = req.model || pDef.defaultModel;
  const key = cleanApiKey(req.apiKey);
  const baseUrl = (req.baseUrl || pDef.baseUrl).replace(/\/+$/, '');

  const userContent: any[] = [];
  if (req.prompt) userContent.push({ type: 'text', text: req.prompt });
  if (req.images) {
    for (const img of req.images) {
      if (img.url) userContent.push({ type: 'image_url', image_url: { url: img.url } });
      else if (img.base64) userContent.push({ type: 'image_url', image_url: { url: `data:${img.mimeType || 'image/png'};base64,${img.base64}` } });
    }
  }

  let fullText = '';

  // Try streaming for OpenAI-compatible and Gemini
  try {
    if (req.provider === 'gemini') {
      if (!key) throw new Error('Gemini API key not set.');
      const parts: any[] = [];
      for (const item of userContent) {
        if (item.type === 'text') parts.push({ text: item.text });
      }
      const contents = [{ role: 'user', parts }];
      const res = await fetch(
        `${baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
      );
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const token = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (token) { fullText += token; onChunk({ token }); }
          } catch {}
        }
      }
    } else if (req.provider === 'anthropic') {
      if (!key) throw new Error('Anthropic API key not set.');
      const content = userContent.map((item) => {
        if (item.type === 'text') return { type: 'text', text: item.text };
        if (item.type === 'image_url') {
          const url = item.image_url.url;
          if (url.startsWith('data:')) {
            const [header, b64] = url.split(',');
            const mimeMatch = header.match(/data:([^;]+)/);
            return { type: 'image', source: { type: 'base64', media_type: mimeMatch?.[1] || 'image/png', data: b64 } };
          }
        }
        return null;
      }).filter(Boolean);
      const res = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 8192, stream: true, system: req.systemPrompt || '', messages: [{ role: 'user', content }] }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'content_block_delta' && data.delta?.text) {
              fullText += data.delta.text;
              onChunk({ token: data.delta.text });
            }
          } catch {}
        }
      }
    } else {
      // OpenAI-compatible streaming
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (key && key !== 'ollama') headers['Authorization'] = `Bearer ${key}`;
      if (req.provider === 'openrouter') {
        headers['HTTP-Referer'] = req.origin || window.location.origin;
        headers['X-Title'] = 'Gia-co-Design';
      }
      const messages: any[] = [];
      if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
      messages.push({ role: 'user', content: userContent });
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST', headers,
        body: JSON.stringify({ model, messages, temperature: req.temperature ?? 0.7, stream: true }),
      });
      if (!res.ok) throw new Error(`${req.provider} ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const token = data.choices?.[0]?.delta?.content || '';
            if (token) { fullText += token; onChunk({ token }); }
          } catch {}
        }
      }
    }
  } catch {
    // Streaming failed — fall back to non-streaming
    const result = await callAI(req);
    fullText = result.text;
    onChunk({ token: result.text });
  }

  const tokensEstimate = Math.round((req.prompt?.length || 0) / 4 + fullText.length / 4);
  onChunk({ done: true, fullText, tokensEstimate });
}

// ---------------------------------------------------------------------------
// Model fetching — always direct from browser
// ---------------------------------------------------------------------------

export async function fetchLiveModels(
  provider: string,
  apiKey?: string,
  baseUrl?: string
): Promise<ModelInfo[]> {
  const key = cleanApiKey(apiKey);
  const pDef = PROVIDER_CONFIG[provider];
  const url = (baseUrl || pDef?.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');

  try {
    if (provider === 'gemini') {
      if (!key) return [];
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
      if (!r.ok) return [];
      const d = await r.json();
      return (d.models || [])
        .filter((m: any) => m.name && (!m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent')))
        .map((m: any) => {
          const id = m.name.replace(/^models\//, '');
          return { value: id, label: m.displayName ? `${m.displayName} (${id})` : id };
        });
    }

    if (provider === 'anthropic') {
      if (!key) return [];
      const r = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      });
      if (!r.ok) return [];
      const d = await r.json();
      return (d.data || []).map((m: any) => ({ value: m.id, label: m.display_name || m.id }));
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (key && provider !== 'ollama') headers['Authorization'] = `Bearer ${key}`;
    const r = await fetch(`${url}/models`, { headers });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).map((m: any) => ({ value: m.id || m.name, label: m.id || m.name })).slice(0, 100);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Companion-only features (require gia-cli running)
// ---------------------------------------------------------------------------

async function viaCompanion<T>(path: string, body?: any, method = 'POST'): Promise<T> {
  const available = await detectCompanion();
  if (!available) {
    throw new Error(
      'Terminal features require the Gia companion CLI.\n' +
      'Install: npm install -g gia-cli\n' +
      'Start: gia start'
    );
  }
  const res = await fetch(`${COMPANION_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------

export interface AssetMeta {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  createdAt: number;
}

export async function uploadAsset(name: string, base64: string, mimeType?: string): Promise<AssetMeta & { url: string }> {
  return viaCompanion('/assets/upload', { name, content: base64, mimeType });
}

export async function listAssets(): Promise<AssetMeta[]> {
  const res = await viaCompanion<{ assets: AssetMeta[] }>('/assets', undefined, 'GET');
  return res.assets || [];
}

export async function deleteAsset(id: string): Promise<void> {
  await viaCompanion(`/assets/${id}`, undefined, 'DELETE');
}

export async function saveProject(projectId: string, data: any): Promise<void> {
  await viaCompanion('/projects/save', { projectId, data });
}

export async function loadProject(projectId: string): Promise<any | null> {
  try {
    const res = await viaCompanion<{ project: any }>(`/projects/${projectId}`, undefined, 'GET');
    return res.project;
  } catch {
    return null;
  }
}

export async function listProjects(): Promise<any[]> {
  const res = await viaCompanion<{ projects: any[] }>('/projects', undefined, 'GET');
  return res.projects || [];
}

export async function deleteProject(projectId: string): Promise<void> {
  await viaCompanion(`/projects/${projectId}`, undefined, 'DELETE');
}

export async function saveScreenshot(screenId: string, dataUrl: string): Promise<void> {
  await viaCompanion('/screenshots/save', { screenId, dataUrl });
}

// Terminal / Exec — companion-only
export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function execCommand(command: string, cwd?: string, timeout?: number): Promise<ExecResult> {
  return viaCompanion('/exec', { command, cwd, timeout });
}

export async function installPackage(packageName: string, cwd?: string): Promise<ExecResult> {
  return viaCompanion('/packages/install', { packageName, cwd });
}

export interface SystemInfo {
  nodeVersion: string | null;
  npmVersion: string | null;
  bunVersion: string | null;
  pythonVersion: string | null;
  disk: { total: string; used: string; available: string } | null;
  platform: string;
  arch: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return viaCompanion('/system', undefined, 'GET');
}

export async function checkHealth(): Promise<{ status: string; version: string }> {
  const available = await detectCompanion();
  if (!available) return { status: 'standalone', version: __APP_VERSION__ || '1.0.0' };
  return viaCompanion('/health', undefined, 'GET');
}
