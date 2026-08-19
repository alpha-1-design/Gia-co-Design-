# gia-cli

Gia-co-Design companion CLI — enables terminal access, package installation, and heavy processing for the design app.

## What It Does

The Gia-co-Design app works fully standalone in your browser or as an Android APK. This optional CLI companion unlocks extra power when it's running:

- **Run shell commands** from the design app
- **Install npm/pip/cargo packages** on your machine
- **Heavy processing** — rendering, dependency installation, exports
- **Project file storage** — beyond localStorage limits

## Install

```bash
npm install -g gia-cli
```

## Usage

```bash
# Start the companion server
gia start

# Check if running
gia status

# Stop the companion
gia stop

# Show help
gia --help
```

## How It Works

1. Start the companion: `gia start`
2. Open Gia-co-Design in your browser
3. The app auto-detects the companion and unlocks terminal features
4. Use the terminal panel in the app to run commands on your machine

No configuration needed. The companion runs on port 4000 by default.

## Environment

- `GIA_PORT` — Server port (default: 4000)

## Requirements

- Node.js 18+
- npm (for package installation features)
