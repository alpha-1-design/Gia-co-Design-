# Gia-co-Design 🎨✨

<p align="center">
  <img src="./assets/icon/icon-1024.png" alt="Gia-co-Design app icon" width="128" height="128" />
</p>

**Gia-co-Design** is a modern, standalone, Bring-Your-Own-Key (BYOK) AI design studio and UI Kit generator workspace. It enables frontend designers and engineers to prompt, decompose, preview, critique, and refine agentic UI components across multiple leading AI provider networks — all running 100% client-side in the browser.

---

## 🌟 Key Features

### AI-Powered Design Generation
- **Multi-AI Provider Support**: Seamlessly switch between:
  - **Google Gemini** (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, etc.)
  - **OpenRouter** (Claude 3.5 Sonnet, DeepSeek R1, Llama 3.3, Qwen 2.5 Coder)
  - **OpenCode Zen** (`opencode-zen-1`, `opencode-coder`, Claude, DeepSeek, GPT-4o)
  - **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`)
  - **Anthropic** (`claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`)
  - **Groq**, **DeepSeek**, **Mistral**, **Together**, **xAI**, **Ollama**, & **Custom OpenAI-compatible endpoints**
- **Live Model Fetching**: Query available models directly from provider REST endpoints in real time.
- **Multi-Direction Generation**: Generate 1–3 design variants side-by-side and pick the best direction.
- **Design System Import**: Paste or upload an HTML/CSS brand reference; the AI matches its colors, fonts, and patterns on every generation.
- **Wireframe Attachment**: Upload or drag-and-drop a screenshot — the AI matches its layout and visual style.

### Interactive Preview & Editing
- **Live Iframe Preview**: Instant rendering of generated HTML with Tailwind CDN.
- **Direct Canvas Editing**: Click elements on the preview to select them; drag to reposition; use sliders for padding, font-size, border-radius; pick bg + text colors; click **Sync to Code** to push changes back to the source.
- **Pin Comments**: Drop pins on the canvas at specific coordinates to annotate feedback; resolve them when addressed.
- **Direction Tabs**: Switch between generated variants and compare them side-by-side.

### AI Design Critique
- **Automated Audit**: Runs an AI-powered quality check across accessibility (contrast, ARIA, semantic HTML), visual hierarchy & spacing, color usage, responsiveness, typography, and polish.
- **Severity-Tagged Findings**: Errors, warnings, and suggestions with concrete fix recommendations.
- **Fix with AI**: One-click regeneration that applies all critique findings to the current design.

### Sharing & Export
- **Portable Share Links**: Generate a URL that encodes the full design session (all turns, directions, pins, code). Anyone with the link sees it in read-only mode — no backend needed.
- **PNG Screenshot**: Export the preview as a PNG at the active device size.
- **Single HTML Export**: Download a self-contained, zero-dependency HTML file.
- **ZIP Bundle**: Export the full UI Kit (HTML, components, tokens.css, manifest.json, README).
- **JSON Session Backup**: Preserves complete prompt history and turns.

### Android App
- **Installable APK**: Wrap the web app as a native Android application via Capacitor.
- **In-App Auto-Update**: Checks GitHub Releases on launch; prompts to download and install new versions automatically.

### Appearance
- **Two Themes**: Claude Light Paper (`#faf8f5` surfaces, terracotta `#d97757` accent) and Claude Dark (`#181715` surfaces).
- **Responsive Layout**: Desktop split-pane + mobile bottom-tab navigation.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22 or higher
- **npm** v10+

### Installation

```bash
git clone https://github.com/alpha-1-design/Gia-co-Design-.git
cd Gia-co-Design
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Run

On first launch, the Settings panel opens automatically. Choose a provider, paste your API key, and pick a model. Your key is stored locally in the browser and never leaves your machine.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port `3000` |
| `npm run build` | TypeScript check + production bundle to `dist/` |
| `npm run lint` | Run `tsc --noEmit` type-checking |
| `npm run preview` | Preview the production build locally |
| `npm run clean` | Remove `dist/` and `server.js` |
| `npm run android:sync` | Build web assets + sync Capacitor Android |
| `npm run android:build` | Build debug APK |
| `npm run android:release` | Build signed release APK |
| `npm run bump:patch` | Bump patch version (`1.0.0` → `1.0.1`) |
| `npm run bump:minor` | Bump minor version (`1.0.0` → `1.1.0`) |
| `npm run bump:major` | Bump major version (`1.0.0` → `2.0.0`) |
| `npm run release` | Bump patch + build (pre-release step) |

---

## 📱 Android App

### Building the APK Locally

```bash
npm run android:sync
cd android && ./gradlew assembleDebug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

For a signed release APK, see [Android Build Guide](./docs/android-build.md).

### Auto-Update

Once installed on Android, the app queries GitHub Releases on launch. If a newer release with an APK is found, an **"Update Available"** banner appears with a **Download** button. Tapping it opens the APK in the system browser for installation.

### Releasing a New Version

```bash
npm run bump:patch
git add -A
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

The CI workflow automatically builds the APK and creates a draft GitHub Release.

---

## 📂 Project Structure

```
src/
  components/     # React UI components
    PreviewCanvas.tsx      # Live iframe preview + direct edit mode
    PromptSidebar.tsx      # Prompt input, directions, image attachment
    Header.tsx             # Top bar with provider/model/theme/share controls
    SettingsModal.tsx      # Provider & model configuration
    DesignSystemModal.tsx  # Create/edit/activate design systems
    CritiqueModal.tsx      # AI design audit results
    ShareModal.tsx         # Generate portable share links
    UpdateModal.tsx        # In-app update prompt
    ExportModal.tsx        # HTML/ZIP/JSON/PNG export
    CodeInspector.tsx      # Source code viewer
    SessionsDrawer.tsx     # Session history sidebar
    DecomposeModal.tsx     # UI Kit decomposition
    VisualLibraryPanel.tsx # Draggable UI pattern snippets
  lib/
    ai.ts                # Generation, variants, critique, live model fetching
    providers.ts         # Provider registry + model cache
    share.ts             # Share link encoding/decoding (gzip + base64)
    updater.ts           # GitHub releases check + download
    storage.ts           # LocalStorage persistence helpers
    screenshot.ts        # Canvas-based PNG capture from srcdoc iframe
  types.ts               # Shared TypeScript interfaces
  env.d.ts               # Global type declarations (__APP_VERSION__, __APP_REPO__)
  App.tsx                # Root component
  main.tsx               # Entry point
capacitor.config.ts      # Capacitor configuration
android/                 # Native Android project (Capacitor)
scripts/
  bump-version.mjs       # Version bump script
.github/
  workflows/
    ci.yml               # Lint + build on push/PR
    build-apk.yml        # Build APK + GitHub Release on tag
    deploy-pages.yml     # Deploy to GitHub Pages
docs/
  getting-started.md     # New user onboarding
  android-build.md       # Android build guide
  release.md             # Release process guide
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, coding conventions, and the release process.

---

## 📜 Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## 🔒 Security

This app runs entirely client-side. API keys are stored in your browser's local storage and never transmitted to any server. See [SECURITY.md](./SECURITY.md) for responsible disclosure guidelines.

---

## 📄 License

MIT License.
