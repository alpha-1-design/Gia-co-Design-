# Gia-co-Design 🎨✨

<p align="center">
  <img src="./assets/icon/icon-1024.png" alt="Gia-co-Design app icon" width="128" height="128" />
</p>

**Gia-co-Design** is a standalone AI design studio that runs in your browser or as an Android app. Design anything — charts, motion graphics, mockups, dashboards, websites, mobile apps — using any AI provider you choose. No accounts, no cloud dependency, no vendor lock-in.

---

## 🌟 What You Can Design

- **Websites & Landing Pages** — full responsive layouts
- **Mobile App Screens** — iOS/Android UI with native device frames
- **Dashboards** — data-rich panels with charts and metrics
- **Charts & Data Visualizations** — bar, line, pie, area charts
- **Motion Graphics** — animated transitions and micro-interactions
- **Presentations** — slide decks with consistent branding
- **UI Components** — buttons, cards, modals, navigation patterns
- **Design Systems** — extract and apply tokens, colors, typography

---

## 🚀 How to Get It

### Option 1: Web App (Instant — No Install)

Open the hosted web version directly in your browser:

**→ [https://alpha-1-design.github.io/Gia-co-Design-/](https://alpha-1-design.github.io/Gia-co-Design-/)**

That's it. No download, no installation. Just open and start designing. Works on any device with a browser — desktop, tablet, or phone.

### Option 2: Android APK (Install on Your Phone)

1. Go to [Releases](https://github.com/alpha-1-design/Gia-co-Design-/releases/latest)
2. Download the APK file
3. Open it on your Android device (enable "Install from unknown sources" if prompted)
4. The app installs like any other app
5. **Auto-updates**: on launch, the app checks for new versions and prompts you to update

### Option 3: Run Locally (Full Power + Terminal Access)

```bash
git clone https://github.com/alpha-1-design/Gia-co-Design-.git
cd Gia-co-Design
npm install
npm run dev
```

Open **http://localhost:3000** and you're designing.

> **Termux (Android):** Same commands work. Install Node.js first: `pkg install nodejs`

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Gia-co-Design (the app)                                │
│                                                         │
│  Works EVERYWHERE — no backend needed:                  │
│                                                         │
│  ✅ 10 AI providers (Gemini, OpenAI, Anthropic, etc.)   │
│  ✅ Infinite canvas with screen connections             │
│  ✅ Live preview with device frames                     │
│  ✅ Direct element editing on canvas                    │
│  ✅ AI design critique & auto-fix                       │
│  ✅ UI Kit decomposition into multi-file packages       │
│  ✅ Design system creation & activation                 │
│  ✅ Portable share links (no server needed)             │
│  ✅ Export: HTML, ZIP, JSON, PNG                         │
│  ✅ localStorage persistence                            │
│                                                         │
│  Optional: auto-detects gia-cli companion ──► terminal  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  gia-cli (optional companion)                           │
│  npm install -g gia-cli                                 │
│                                                         │
│  Unlocks when detected on localhost:4000:               │
│  • Run shell commands from the design app               │
│  • Install npm/pip/cargo packages                       │
│  • Heavy processing (rendering, dependencies)           │
│  • Project file storage beyond localStorage             │
└─────────────────────────────────────────────────────────┘
```

**Key point:** The app never requires a backend. The CLI companion is 100% optional — it just unlocks extra power when you're running locally.

---

## 🤖 AI Providers (BYOK)

Gia-co-Design is provider-agnostic. Bring your own API key — stored locally in your browser, never transmitted anywhere.

| Provider | Models | Get a Key |
|----------|--------|-----------|
| **Google Gemini** | Gemini 2.5 Flash, 2.0 Flash, 1.5 Pro | [Google AI Studio](https://aistudio.google.com/) |
| **OpenAI** | GPT-4o, GPT-4o-mini, o1, o3-mini | [platform.openai.com](https://platform.openai.com/) |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3.5 Haiku | [console.anthropic.com](https://console.anthropic.com/) |
| **OpenRouter** | Claude, DeepSeek, Llama, Qwen, 100+ models | [openrouter.ai](https://openrouter.ai/) |
| **Groq** | Llama 3.3, Mixtral | [console.groq.com](https://console.groq.com/) |
| **DeepSeek** | DeepSeek V3, DeepSeek Coder | [platform.deepseek.com](https://platform.deepseek.com/) |
| **Mistral** | Mistral Large, Codestral | [console.mistral.ai](https://console.mistral.ai/) |
| **Together** | Llama, Mixtral, Qwen | [api.together.xyz](https://api.together.xyz/) |
| **xAI** | Grok-2, Grok-2 Mini | [console.x.ai](https://console.x.ai/) |
| **Ollama** | Any local model | [ollama.com](https://ollama.com/) (runs on your machine) |
| **Custom** | Any OpenAI-compatible endpoint | Self-hosted models |

---

## ✨ Core Features

### Infinite Canvas
All your screens live as draggable nodes on a spatial canvas. Connect screens to map user flows. Zoom, pan, minimap — like Figma but focused on AI-generated designs.

### Live Preview with Device Frames
See your design rendered in real-time inside realistic device frames — iPhone, Android, tablet, desktop browser chrome.

### Direct Element Editing
Click any element on the preview to select it. Drag to reposition. Use the property panel to adjust padding, font-size, border-radius, colors. Click **Sync to Code** to push changes back.

### AI Design Critique
One-click audit checks accessibility (contrast, ARIA, semantic HTML), visual hierarchy, spacing, color usage, typography, and responsiveness. Get severity-tagged findings with fix recommendations — then apply fixes with AI.

### UI Kit Decomposition
Split a generated design into reusable multi-file packages: HTML, CSS, JavaScript, tokens, manifest, README. Perfect for component libraries.

### Design System Management
Create design systems from HTML/CSS brand references. Activate a system to have the AI match your colors, fonts, and patterns on every generation. Export as **DESIGN.md** for agent-readable portability.

### Sharing
Generate a URL that encodes your full design session (all turns, directions, pins, code). Anyone with the link sees it in read-only mode — no backend, no account needed.

### Export
- **HTML** — self-contained, zero-dependency
- **ZIP** — full UI Kit with components, tokens, manifest
- **JSON** — complete session backup
- **PNG** — screenshot at the active device size

### Multi-Screen App Planning
AI plans a full multi-screen app from a description. Generates screen list, navigation flow, and creates all screens at once.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port `3000` |
| `npm run build` | Production bundle to `dist/` |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run preview` | Preview production build locally |
| `npm run android:sync` | Build web + sync Capacitor Android |
| `npm run android:build` | Build debug APK |
| `npm run android:release` | Build signed release APK |
| `npm run bump:patch` | `1.0.0` → `1.0.1` |
| `npm run bump:minor` | `1.0.0` → `1.1.0` |
| `npm run bump:major` | `1.0.0` → `2.0.0` |
| `npm run release` | Bump patch + build |

---

## 🖥️ Companion CLI (Optional)

The **gia-cli** unlocks terminal access from within the design app — run commands, install packages, access your filesystem.

### Install

```bash
npm install -g gia-cli
```

### Usage

```bash
gia start      # Start the companion server (port 4000)
gia status     # Check if running
gia stop       # Stop the companion
gia --help     # Show all commands
```

### What It Unlocks

| Feature | Without CLI | With CLI |
|---------|------------|----------|
| AI generation | ✅ Works | ✅ Works |
| Canvas, screens, exports | ✅ Works | ✅ Works |
| Terminal panel | ❌ Hidden | ✅ Full shell access |
| Package installation | ❌ N/A | ✅ npm/pip/cargo |
| System info | ❌ N/A | ✅ Detects Node, Python, etc. |
| File/project storage | localStorage | ✅ Disk storage |

The app auto-detects the companion — no configuration needed. If it's not running, everything else still works perfectly.

---

## 📱 Android Auto-Update

When installed as an APK, the app checks GitHub Releases on launch. If a newer version exists, an **"Update Available"** banner appears with a Download button.

---

## 📂 Project Structure

```
src/
  App.tsx                    # Root — state machine, view modes, modals
  main.tsx                   # React 19 entry point
  types.ts                   # All TypeScript interfaces
  index.css                  # Tailwind v4 + Claude-inspired design tokens
  components/
    InfiniteCanvas.tsx       # React Flow spatial canvas with screen nodes
    PreviewCanvas.tsx        # Live iframe preview + direct edit mode
    PromptSidebar.tsx        # Agent prompt, directions, image attachment
    Header.tsx               # Provider/model/theme/share/terminal controls
    TerminalPanel.tsx        # Shell access (requires gia-cli)
    ScreensRail.tsx          # Multi-screen navigation rail
    SettingsModal.tsx        # API key configuration
    DesignSystemModal.tsx    # Create/edit/activate design systems
    CritiqueModal.tsx        # AI design audit results
    ExportModal.tsx          # HTML/ZIP/JSON/PNG export
    ShareModal.tsx           # Portable share link generator
    DecomposeModal.tsx       # UI Kit decomposition
    AddScreenModal.tsx       # Add new screens
    PlanAppModal.tsx         # AI-powered multi-screen planning
    ...
  lib/
    ai.ts                    # AI calls — environment-aware (direct or CLI-proxied)
    api.ts                   # Backend detection + HTTP client
    providers.ts             # Provider registry + live model fetching
    designMd.ts              # DESIGN.md export (Stitch-compatible)
    share.ts                 # Share link encoding/decoding
    storage.ts               # localStorage + optional server persistence
    updater.ts               # GitHub Releases auto-update check
    screenshot.ts            # Canvas-based PNG capture
    deviceViewports.ts       # Device frame dimensions
gia-cli/
  src/
    index.ts                 # CLI entry point (gia start/stop/status)
    server.ts                # Express server — exec, packages, assets, system
  package.json               # Published as "gia-cli" on npm
.github/
  workflows/
    ci.yml                   # Lint + build on push/PR
    build-apk.yml            # APK build + GitHub Release on tag
    deploy-pages.yml         # Deploy to GitHub Pages
docs/
  getting-started.md         # New user onboarding
  android-build.md           # Android build guide
  release.md                 # Release process guide
```

---

## 🔄 Distribution Channels

| Channel | How to Get It | Auto-Updates |
|---------|--------------|--------------|
| **Web** | [alpha-1-design.github.io](https://alpha-1-design.github.io/Gia-co-Design-/) | Always latest (push to main) |
| **Android APK** | [GitHub Releases](https://github.com/alpha-1-design/Gia-co-Design-/releases/latest) | ✅ In-app prompt |
| **Local dev** | `git clone` + `npm run dev` | Manual (git pull) |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and coding conventions.

## 🔒 Security

API keys are stored in your browser's local storage and never transmitted to any server. The app runs entirely client-side. See [SECURITY.md](./SECURITY.md) for responsible disclosure guidelines.

## 📄 License

MIT License.
