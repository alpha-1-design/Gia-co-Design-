/**
 * Gia-co-Design — Local Backend Server
 *
 * Runs on the user's machine (laptop or Termux).
 * Handles: AI API proxy, file/asset storage, terminal exec, design exports.
 * All data stays local — zero cloud dependencies.
 */

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
  unlinkSync,
  rmSync,
  copyFileSync,
  chmodSync,
  readlinkSync,
} from 'fs';
import { join, dirname, extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const execAsync = promisify(execCb);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ---------------------------------------------------------------------------
// Data directories
// ---------------------------------------------------------------------------
const DATA_DIR = join(ROOT, '.gia-data');
const ASSETS_DIR = join(DATA_DIR, 'assets');
const EXPORTS_DIR = join(DATA_DIR, 'exports');
const PROJECTS_DIR = join(DATA_DIR, 'projects');
const SCREENSHOTS_DIR = join(DATA_DIR, 'screenshots');

for (const dir of [DATA_DIR, ASSETS_DIR, EXPORTS_DIR, PROJECTS_DIR, SCREENSHOTS_DIR]) {
  mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', dataDir: DATA_DIR });
});

// ---------------------------------------------------------------------------
// AI — Single callAI endpoint
//
// The client sends { provider, byok, prompt, systemPrompt, model, images? }
// and the server makes the actual provider API call. This keeps API keys
// server-side and avoids CORS issues.
// ---------------------------------------------------------------------------

function cleanApiKey(key) {
  if (!key) return '';
  return key.replace(/^['"]|['"]$/g, '').trim();
}

app.post('/api/ai/call', async (req, res) => {
  try {
    const { provider, model, prompt, systemPrompt, images, temperature } = req.body;

    if (!provider || !prompt) {
      return res.status(400).json({ error: 'provider and prompt are required' });
    }

    // Provider runtime config — mirrors src/lib/providers.ts
    const providers = {
      gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.5-flash',
      },
      openai: {
        baseUrl: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o',
      },
      anthropic: {
        baseUrl: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-20250514',
      },
      openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultModel: 'anthropic/claude-sonnet-4',
      },
      groq: {
        baseUrl: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.3-70b-versatile',
      },
      deepseek: {
        baseUrl: 'https://api.deepseek.com/v1',
        defaultModel: 'deepseek-chat',
      },
      mistral: {
        baseUrl: 'https://api.mistral.ai/v1',
        defaultModel: 'mistral-large-latest',
      },
      together: {
        baseUrl: 'https://api.together.xyz/v1',
        defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      },
      xai: {
        baseUrl: 'https://api.x.ai/v1',
        defaultModel: 'grok-2',
      },
      ollama: {
        baseUrl: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/v1',
        defaultModel: 'llama3.2',
      },
    };

    const pDef = providers[provider];
    if (!pDef) {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    const modelToUse = model || pDef.defaultModel;
    const userTemp = typeof temperature === 'number' ? temperature : 0.7;

    // Build user content with optional images
    const userContent = [];
    if (prompt) {
      userContent.push({ type: 'text', text: prompt });
    }
    if (Array.isArray(images)) {
      for (const img of images) {
        // img should be { mimeType, base64 } or { url }
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

    if (provider === 'gemini') {
      // Gemini uses its own SDK-like REST
      const key = cleanApiKey(process.env.GEMINI_API_KEY || req.body.apiKey || '');
      if (!key) throw new Error('Gemini API key not set. Set GEMINI_API_KEY or configure in Settings.');

      const contents = [];
      const parts = [];
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
      if (systemPrompt) contents.push({ role: 'user', parts: [{ text: systemPrompt + '\n\n' + (userContent[0]?.text || '') }] });
      else contents.push({ role: 'user', parts });

      const res = await fetch(
        `${pDef.baseUrl}/models/${modelToUse}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Gemini API (${res.status}): ${err?.error?.message || res.statusText}`);
      }
      const data = await res.json();
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else if (provider === 'anthropic') {
      const key = cleanApiKey(process.env.ANTHROPIC_API_KEY || req.body.apiKey || '');
      if (!key) throw new Error('Anthropic API key not set. Set ANTHROPIC_API_KEY or configure in Settings.');

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
        return { type: 'text', text: '' };
      }).filter(Boolean);

      const res = await fetch(`${pDef.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelToUse,
          max_tokens: 4096,
          system: systemPrompt || '',
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
      // OpenAI-compatible endpoint (OpenAI, OpenRouter, Groq, DeepSeek, Mistral, Together, xAI, Ollama)
      const apiKey = req.body.apiKey || '';
      const envKeyMap = {
        openai: 'OPENAI_API_KEY',
        openrouter: 'OPENROUTER_API_KEY',
        groq: 'GROQ_API_KEY',
        deepseek: 'DEEPSEEK_API_KEY',
        mistral: 'MISTRAL_API_KEY',
        together: 'TOGETHER_API_KEY',
        xai: 'XAI_API_KEY',
        ollama: 'OLLAMA_API_KEY',
      };
      const key = cleanApiKey(process.env[envKeyMap[provider]] || apiKey);
      const baseUrl = (req.body.baseUrl || pDef.baseUrl).replace(/\/+$/, '');

      const headers = { 'Content-Type': 'application/json' };
      if (key && key !== 'ollama') {
        headers['Authorization'] = `Bearer ${key}`;
      }
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = req.body.origin || 'http://localhost:3000';
        headers['X-Title'] = 'Gia-co-Design';
      }

      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: userContent });

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: userTemp,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`${provider.toUpperCase()} API (${res.status}): ${err?.error?.message || err?.detail || res.statusText}`);
      }
      const data = await res.json();
      rawText = data.choices?.[0]?.message?.content || '';
    }

    const tokensEstimate = Math.round((prompt?.length || 0) / 4 + rawText.length / 4);
    res.json({ text: rawText, tokensEstimate });
  } catch (err) {
    console.error('[AI Call Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI — Fetch live models for a provider
// ---------------------------------------------------------------------------
app.post('/api/ai/models', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    const key = cleanApiKey(apiKey || '');

    if (provider === 'gemini') {
      const geminiKey = cleanApiKey(process.env.GEMINI_API_KEY || key);
      if (!geminiKey) throw new Error('Gemini API key missing');
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`);
      if (!r.ok) throw new Error(`Gemini ${r.status}`);
      const d = await r.json();
      const models = (d.models || [])
        .filter((m) => m.name && (!m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent')))
        .map((m) => {
          const id = m.name.replace(/^models\//, '');
          return { value: id, label: m.displayName ? `${m.displayName} (${id})` : id };
        });
      res.json({ models });
    } else if (provider === 'anthropic') {
      const antKey = cleanApiKey(process.env.ANTHROPIC_API_KEY || key);
      if (!antKey) throw new Error('Anthropic API key missing');
      const r = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': antKey, 'anthropic-version': '2023-06-01' },
      });
      if (!r.ok) throw new Error(`Anthropic ${r.status}`);
      const d = await r.json();
      const models = (d.data || []).map((m) => ({ value: m.id, label: m.display_name || m.id }));
      res.json({ models });
    } else {
      // OpenAI-compatible
      const envKeyMap = {
        openai: 'OPENAI_API_KEY', openrouter: 'OPENROUTER_API_KEY',
        groq: 'GROQ_API_KEY', deepseek: 'DEEPSEEK_API_KEY',
        mistral: 'MISTRAL_API_KEY', together: 'TOGETHER_API_KEY',
        xai: 'XAI_API_KEY', ollama: 'OLLAMA_API_KEY',
      };
      const pDef = {
        openai: 'https://api.openai.com/v1', openrouter: 'https://openrouter.ai/api/v1',
        groq: 'https://api.groq.com/openai/v1', deepseek: 'https://api.deepseek.com/v1',
        mistral: 'https://api.mistral.ai/v1', together: 'https://api.together.xyz/v1',
        xai: 'https://api.x.ai/v1', ollama: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/v1',
      };
      const k = cleanApiKey(process.env[envKeyMap[provider]] || key);
      const baseUrl = (req.body.baseUrl || pDef[provider] || 'https://api.openai.com/v1').replace(/\/+$/, '');
      const headers = { 'Content-Type': 'application/json' };
      if (k && k !== 'ollama') headers['Authorization'] = `Bearer ${k}`;
      const r = await fetch(`${baseUrl}/models`, { headers });
      if (!r.ok) throw new Error(`${provider} ${r.status}`);
      const d = await r.json();
      const models = (d.data || []).map((m) => ({ value: m.id || m.name, label: m.id || m.name })).slice(0, 100);
      res.json({ models });
    }
  } catch (err) {
    console.error('[Models Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// File / Asset Storage
// ---------------------------------------------------------------------------

// Upload an asset (image, font, etc.)
app.post('/api/assets/upload', async (req, res) => {
  try {
    const { name, content, mimeType } = req.body; // content = base64
    if (!name || !content) {
      return res.status(400).json({ error: 'name and content (base64) required' });
    }
    const id = randomUUID();
    const ext = extname(name) || '.bin';
    const fileName = `${id}${ext}`;
    const filePath = join(ASSETS_DIR, fileName);
    writeFileSync(filePath, Buffer.from(content, 'base64'));

    // Store metadata
    const meta = { id, name, fileName, mimeType: mimeType || 'application/octet-stream', createdAt: Date.now() };
    writeFileSync(join(ASSETS_DIR, `${id}.meta.json`), JSON.stringify(meta));

    res.json({ id, name, url: `/api/assets/${id}`, ...meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get an asset file
app.get('/api/assets/:id', (req, res) => {
  try {
    const id = req.params.id;
    // Try to find the file
    const files = readdirSync(ASSETS_DIR);
    const assetFile = files.find((f) => f.startsWith(id) && !f.endsWith('.meta.json'));
    if (!assetFile) return res.status(404).json({ error: 'Asset not found' });

    const metaFile = join(ASSETS_DIR, `${id}.meta.json`);
    const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf-8')) : {};
    const content = readFileSync(join(ASSETS_DIR, assetFile));
    res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all assets
app.get('/api/assets', (_req, res) => {
  try {
    const files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.meta.json'));
    const assets = files.map((f) => JSON.parse(readFileSync(join(ASSETS_DIR, f), 'utf-8')));
    res.json({ assets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an asset
app.delete('/api/assets/:id', (req, res) => {
  try {
    const id = req.params.id;
    const files = readdirSync(ASSETS_DIR);
    for (const f of files) {
      if (f.startsWith(id)) unlinkSync(join(ASSETS_DIR, f));
    }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Project Storage — save/load full design projects
// ---------------------------------------------------------------------------
app.post('/api/projects/save', (req, res) => {
  try {
    const { projectId, data } = req.body;
    if (!projectId || !data) return res.status(400).json({ error: 'projectId and data required' });
    const projectDir = join(PROJECTS_DIR, projectId);
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'project.json'), JSON.stringify(data, null, 2));
    res.json({ saved: true, projectId, path: projectDir });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const filePath = join(PROJECTS_DIR, req.params.id, 'project.json');
    if (!existsSync(filePath)) return res.status(404).json({ error: 'Project not found' });
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    res.json({ project: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects', (_req, res) => {
  try {
    const dirs = readdirSync(PROJECTS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
    const projects = dirs.map((d) => {
      const metaFile = join(PROJECTS_DIR, d.name, 'project.json');
      if (!existsSync(metaFile)) return null;
      const data = JSON.parse(readFileSync(metaFile, 'utf-8'));
      return { id: d.name, ...data, updatedAt: statSync(metaFile).mtimeMs };
    }).filter(Boolean);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const dir = join(PROJECTS_DIR, req.params.id);
    if (existsSync(dir)) rmSync(dir, { recursive: true });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Screenshot storage
// ---------------------------------------------------------------------------
app.post('/api/screenshots/save', (req, res) => {
  try {
    const { screenId, dataUrl } = req.body;
    if (!screenId || !dataUrl) return res.status(400).json({ error: 'screenId and dataUrl required' });
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const filePath = join(SCREENSHOTS_DIR, `${screenId}.png`);
    writeFileSync(filePath, Buffer.from(base64, 'base64'));
    res.json({ saved: true, path: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Terminal / Shell Execution
// Allows the app to run shell commands on the user's machine for heavy
// operations: installing dependencies, running build tools, etc.
// ---------------------------------------------------------------------------
app.post('/api/exec', async (req, res) => {
  try {
    const { command, cwd, timeout } = req.body;
    if (!command) return res.status(400).json({ error: 'command is required' });

    // Safety: block obviously dangerous commands
    const blocked = ['rm -rf /', 'mkfs', 'dd if=', ':(){', 'shutdown', 'reboot', 'halt', 'init 0', 'init 6'];
    if (blocked.some((b) => command.toLowerCase().includes(b))) {
      return res.status(403).json({ error: 'This command is blocked for safety.' });
    }

    const workingDir = cwd || ROOT;
    const timeoutMs = Math.min(timeout || 60000, 120000); // max 2 min

    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDir,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      env: { ...process.env, FORCE_COLOR: '0' },
    });

    res.json({ stdout: stdout || '', stderr: stderr || '', exitCode: 0 });
  } catch (err) {
    res.status(200).json({
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: err.code || 1,
    });
  }
});

// ---------------------------------------------------------------------------
// Design Export — server-side file assembly
// ---------------------------------------------------------------------------
app.post('/api/export/zip', async (req, res) => {
  try {
    const { files, projectName } = req.body;
    // files: Array<{ path: string, content: string }>
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'files array required' });
    }

    const exportId = randomUUID();
    const exportDir = join(EXPORTS_DIR, exportId);
    mkdirSync(exportDir, { recursive: true });

    // Write all files to the export directory
    for (const file of files) {
      const filePath = join(exportDir, file.path);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, file.content);
    }

    // Create zip using system zip command (works on Linux, macOS, Termux)
    const zipPath = join(EXPORTS_DIR, `${exportId}.zip`);
    try {
      await execAsync(`cd "${exportDir}" && zip -r "${zipPath}" .`, { timeout: 30000 });
    } catch {
      // Fallback: if zip not available, just return the directory
      return res.json({ exportId, path: exportDir, message: 'Exported as directory (zip not available)' });
    }

    const zipContent = readFileSync(zipPath);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName || 'gia-export'}.zip"`);
    res.send(zipContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Package install — install npm packages on user's machine
// ---------------------------------------------------------------------------
app.post('/api/packages/install', async (req, res) => {
  try {
    const { packageName, cwd } = req.body;
    if (!packageName) return res.status(400).json({ error: 'packageName required' });

    const workingDir = cwd || ROOT;
    const { stdout, stderr } = await execAsync(`npm install ${packageName} --save`, {
      cwd: workingDir,
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({ installed: true, package: packageName, stdout: stdout || '', stderr: stderr || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// System info — detect what's available on the user's machine
// ---------------------------------------------------------------------------
app.get('/api/system', async (_req, res) => {
  try {
    const info = {};

    // Node version
    try {
      const { stdout } = await execAsync('node --version', { timeout: 5000 });
      info.nodeVersion = stdout.trim();
    } catch { info.nodeVersion = null; }

    // npm version
    try {
      const { stdout } = await execAsync('npm --version', { timeout: 5000 });
      info.npmVersion = stdout.trim();
    } catch { info.npmVersion = null; }

    // Bun version
    try {
      const { stdout } = await execAsync('bun --version', { timeout: 5000 });
      info.bunVersion = stdout.trim();
    } catch { info.bunVersion = null; }

    // Python version
    try {
      const { stdout } = await execAsync('python3 --version', { timeout: 5000 });
      info.pythonVersion = stdout.trim();
    } catch {
      try {
        const { stdout } = await execAsync('python --version', { timeout: 5000 });
        info.pythonVersion = stdout.trim();
      } catch { info.pythonVersion = null; }
    }

    // Available disk space
    try {
      const { stdout } = await execAsync('df -h .', { timeout: 5000 });
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        info.disk = { total: parts[1], used: parts[2], available: parts[3] };
      }
    } catch { info.disk = null; }

    // Platform
    info.platform = process.platform;
    info.arch = process.arch;

    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🎨 Gia-co-Design server running at http://localhost:${PORT}`);
  console.log(`  📁 Data directory: ${DATA_DIR}`);
  console.log(`  🔧 System: ${process.platform} ${process.arch}\n`);
});
