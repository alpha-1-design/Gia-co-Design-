#!/usr/bin/env node

/**
 * gia-cli — Gia-co-Design Companion CLI
 *
 * Provides terminal access, package installation, and heavy processing
 * for the Gia-co-Design design app. The app auto-detects this CLI
 * and unlocks terminal features when it's running.
 *
 * Usage:
 *   gia start    — Start the companion server
 *   gia stop     — Stop the running companion
 *   gia status   — Check if companion is running
 *   gia --help   — Show help
 */

import { spawn, execSync, ChildProcess } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.GIA_PORT || '4000', 10);
const PID_FILE = join(homedir(), '.gia-cli.pid');
const LOG_FILE = join(homedir(), '.gia-cli.log');

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const command = process.argv[2];

switch (command) {
  case 'start':
    startServer();
    break;
  case 'stop':
    stopServer();
    break;
  case 'status':
    checkStatus();
    break;
  default:
    printHelp();
    break;
}

// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------

function startServer() {
  // Check if already running
  if (isRunning()) {
    const pid = readFileSync(PID_FILE, 'utf-8').trim();
    console.log(`\n  ✅ Gia companion already running (PID ${pid})`);
    console.log(`  🌐 http://localhost:${PORT}`);
    console.log(`  📁 Data: ${join(homedir(), '.gia-data')}\n`);
    return;
  }

  console.log(`\n  🎨 Starting Gia companion server...`);

  // Find the server script — relative to this CLI package
  const serverPath = join(import.meta.dirname || __dirname, 'server.js');

  const child = spawn(process.execPath, [serverPath], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT) },
  });

  child.unref();

  // Write PID file
  mkdirSync(join(homedir()), { recursive: true });
  writeFileSync(PID_FILE, String(child.pid));

  // Wait a moment for server to start
  setTimeout(async () => {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/health`);
      if (res.ok) {
        console.log(`  ✅ Companion running (PID ${child.pid})`);
        console.log(`  🌐 http://localhost:${PORT}`);
        console.log(`  📁 Data: ${join(homedir(), '.gia-data')}`);
        console.log(`\n  Open Gia-co-Design in your browser — terminal features are now available.\n`);
      }
    } catch {
      console.log(`  ⚠️  Server started but health check failed. Check logs: ${LOG_FILE}`);
    }
  }, 2000);
}

// ---------------------------------------------------------------------------
// stop
// ---------------------------------------------------------------------------

function stopServer() {
  if (!isRunning()) {
    console.log(`\n  ℹ️  No companion server running.\n`);
    return;
  }

  const pid = readFileSync(PID_FILE, 'utf-8').trim();
  try {
    process.kill(parseInt(pid, 10), 'SIGTERM');
    console.log(`\n  ✅ Stopped companion (PID ${pid})\n`);
  } catch {
    console.log(`\n  ⚠️  Process ${pid} already stopped.\n`);
  }

  try {
    const { unlinkSync } = require('fs');
    unlinkSync(PID_FILE);
  } catch {}
}

// ---------------------------------------------------------------------------
// status
// ---------------------------------------------------------------------------

function checkStatus() {
  if (!isRunning()) {
    console.log(`\n  ℹ️  No companion server running.`);
    console.log(`  Run 'gia start' to enable terminal features.\n`);
    return;
  }

  const pid = readFileSync(PID_FILE, 'utf-8').trim();
  console.log(`\n  ✅ Companion running (PID ${pid})`);
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  📁 Data: ${join(homedir(), '.gia-data')}\n`);
}

// ---------------------------------------------------------------------------
// help
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
  🎨 Gia-co-Design Companion CLI

  Usage:
    gia start     Start the companion server
    gia stop      Stop the running companion
    gia status    Check if companion is running
    gia --help    Show this help

  The companion server enables terminal features in Gia-co-Design:
    • Run shell commands from the design app
    • Install npm/pip/cargo packages
    • Heavy processing (rendering, deps, exports)
    • Project file storage (beyond localStorage)

  The app auto-detects the companion — just start it and open the app.
  No configuration needed.

  Environment:
    GIA_PORT     Server port (default: 4000)
  `);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRunning(): boolean {
  if (!existsSync(PID_FILE)) return false;
  const pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10);
  if (isNaN(pid)) return false;
  try {
    process.kill(pid, 0); // Signal 0 = check if process exists
    return true;
  } catch {
    // Stale PID file
    try {
      const { unlinkSync } = require('fs');
      unlinkSync(PID_FILE);
    } catch {}
    return false;
  }
}
