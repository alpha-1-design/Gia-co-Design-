/**
 * gia-cli — Companion Server
 *
 * Lightweight HTTP server that provides terminal/exec access
 * for the Gia-co-Design app. Runs on the user's machine and
 * is auto-detected by the app.
 *
 * Only handles:
 *   - Shell command execution
 *   - Package installation
 *   - System info detection
 *   - Health check
 */

import express from 'express';
import cors from 'cors';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync, unlinkSync, rmSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const execAsync = promisify(execCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.GIA_PORT || '4000', 10);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ---------------------------------------------------------------------------
// Data directories
// ---------------------------------------------------------------------------

const HOME = process.env.HOME || process.env.USERPROFILE || process.cwd();
const DATA_DIR = join(HOME, '.gia-data');
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
  res.json({
    status: 'ok',
    version: '1.0.0',
    type: 'gia-cli',
    dataDir: DATA_DIR,
    platform: process.platform,
    arch: process.arch,
  });
});

// ---------------------------------------------------------------------------
// Terminal / Shell Execution
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

    const workingDir = cwd || HOME;
    const timeoutMs = Math.min(timeout || 60000, 120000);

    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDir,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, FORCE_COLOR: '0' },
    });

    res.json({ stdout: stdout || '', stderr: stderr || '', exitCode: 0 });
  } catch (err: any) {
    res.status(200).json({
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: err.code || 1,
    });
  }
});

// ---------------------------------------------------------------------------
// Package install
// ---------------------------------------------------------------------------

app.post('/api/packages/install', async (req, res) => {
  try {
    const { packageName, cwd } = req.body;
    if (!packageName) return res.status(400).json({ error: 'packageName required' });

    const workingDir = cwd || HOME;
    const { stdout, stderr } = await execAsync(`npm install ${packageName} --save`, {
      cwd: workingDir,
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    res.json({ installed: true, package: packageName, stdout: stdout || '', stderr: stderr || '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// System info
// ---------------------------------------------------------------------------

app.get('/api/system', async (_req, res) => {
  try {
    const info: any = {};

    try {
      const { stdout } = await execAsync('node --version', { timeout: 5000 });
      info.nodeVersion = stdout.trim();
    } catch { info.nodeVersion = null; }

    try {
      const { stdout } = await execAsync('npm --version', { timeout: 5000 });
      info.npmVersion = stdout.trim();
    } catch { info.npmVersion = null; }

    try {
      const { stdout } = await execAsync('bun --version', { timeout: 5000 });
      info.bunVersion = stdout.trim();
    } catch { info.bunVersion = null; }

    try {
      const { stdout } = await execAsync('python3 --version', { timeout: 5000 });
      info.pythonVersion = stdout.trim();
    } catch {
      try {
        const { stdout } = await execAsync('python --version', { timeout: 5000 });
        info.pythonVersion = stdout.trim();
      } catch { info.pythonVersion = null; }
    }

    try {
      const { stdout } = await execAsync('df -h .', { timeout: 5000 });
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        info.disk = { total: parts[1], used: parts[2], available: parts[3] };
      }
    } catch { info.disk = null; }

    info.platform = process.platform;
    info.arch = process.arch;

    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// File / Asset Storage (local machine)
// ---------------------------------------------------------------------------

app.post('/api/assets/upload', async (req, res) => {
  try {
    const { name, content, mimeType } = req.body;
    if (!name || !content) return res.status(400).json({ error: 'name and content (base64) required' });

    const id = randomUUID();
    const ext = require('path').extname(name) || '.bin';
    const fileName = `${id}${ext}`;
    const filePath = join(ASSETS_DIR, fileName);
    writeFileSync(filePath, Buffer.from(content, 'base64'));

    const meta = { id, name, fileName, mimeType: mimeType || 'application/octet-stream', createdAt: Date.now() };
    writeFileSync(join(ASSETS_DIR, `${id}.meta.json`), JSON.stringify(meta));

    res.json({ id, name, url: `/api/assets/${id}`, ...meta });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assets/:id', (req, res) => {
  try {
    const id = req.params.id;
    const files = readdirSync(ASSETS_DIR);
    const assetFile = files.find((f) => f.startsWith(id) && !f.endsWith('.meta.json'));
    if (!assetFile) return res.status(404).json({ error: 'Asset not found' });

    const metaFile = join(ASSETS_DIR, `${id}.meta.json`);
    const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf-8')) : {};
    const content = readFileSync(join(ASSETS_DIR, assetFile));
    res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assets', (_req, res) => {
  try {
    const files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.meta.json'));
    const assets = files.map((f) => JSON.parse(readFileSync(join(ASSETS_DIR, f), 'utf-8')));
    res.json({ assets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/assets/:id', (req, res) => {
  try {
    const id = req.params.id;
    const files = readdirSync(ASSETS_DIR);
    for (const f of files) {
      if (f.startsWith(id)) unlinkSync(join(ASSETS_DIR, f));
    }
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Project Storage
// ---------------------------------------------------------------------------

app.post('/api/projects/save', (req, res) => {
  try {
    const { projectId, data } = req.body;
    if (!projectId || !data) return res.status(400).json({ error: 'projectId and data required' });
    const projectDir = join(PROJECTS_DIR, projectId);
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'project.json'), JSON.stringify(data, null, 2));
    res.json({ saved: true, projectId, path: projectDir });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const filePath = join(PROJECTS_DIR, req.params.id, 'project.json');
    if (!existsSync(filePath)) return res.status(404).json({ error: 'Project not found' });
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    res.json({ project: data });
  } catch (err: any) {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const dir = join(PROJECTS_DIR, req.params.id);
    if (existsSync(dir)) rmSync(dir, { recursive: true });
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🎨 Gia companion server running at http://localhost:${PORT}`);
  console.log(`  📁 Data directory: ${DATA_DIR}`);
  console.log(`  🔧 System: ${process.platform} ${process.arch}\n`);
});
