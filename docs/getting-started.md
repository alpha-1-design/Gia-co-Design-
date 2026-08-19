# Getting Started with Gia-co-Design

Gia-co-Design is a standalone AI design studio. No backend, no accounts — just your browser and an API key from a supported provider.

---

## Quickest Way: Web App

Open it in your browser — no install needed:

**→ [https://alpha-1-design.github.io/Gia-co-Design-/](https://alpha-1-design.github.io/Gia-co-Design-/)**

Start designing immediately. Works on desktop, tablet, and phone.

---

## Install on Android

1. Go to [Releases](https://github.com/alpha-1-design/Gia-co-Design-/releases/latest)
2. Download the APK
3. Open it on your Android device (enable "Install from unknown sources" if prompted)
4. The app auto-checks for updates on launch

---

## Run Locally (Full Power)

### Prerequisites

- **Node.js** v22 or higher
- **npm** v10+

### Install

```bash
git clone https://github.com/alpha-1-design/Gia-co-Design-.git
cd Gia-co-Design
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

> **Termux (Android):** Install Node first: `pkg install nodejs`, then run the same commands.

---

## Step 1: Configure an API Key

On first launch, the **Settings** panel opens automatically. Choose a provider and paste your API key:

| Provider | Get a Key |
|----------|-----------|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/) |
| OpenAI | [platform.openai.com](https://platform.openai.com/) |
| Anthropic | [console.anthropic.com](https://console.anthropic.com/) |
| OpenRouter (100+ models) | [openrouter.ai](https://openrouter.ai/) |
| Groq | [console.groq.com](https://console.groq.com/) |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/) |
| Mistral | [console.mistral.ai](https://console.mistral.ai/) |
| Together | [api.together.xyz](https://api.together.xyz/) |
| xAI | [console.x.ai](https://console.x.ai/) |
| Ollama (local) | [ollama.com](https://ollama.com/) |

Keys are stored in your browser's local storage and never leave your machine.

---

## Step 2: Start Designing

1. **Type a prompt** in the Agent Prompt panel (e.g., "Create a mobile dashboard with charts and a floating action button")
2. **Hit Generate** — the AI produces a live HTML design in the preview pane
3. **Switch to Canvas view** to see all your screens as draggable nodes on a spatial canvas
4. **Direct Edit** — click elements on the preview to drag, resize, and tweak colors
5. **Multiple Directions** — generate 1–3 variants side-by-side and pick the best one
6. **Wireframe Attachment** — upload a screenshot so the AI matches your reference layout
7. **Design System** — paste HTML/CSS to create a brand system; the AI matches it on every generation
8. **Critique** — run an AI accessibility and design-quality audit, then auto-fix issues
9. **Plan App** — describe a full app and the AI generates all screens with navigation flow

---

## Step 3: Share & Export

- **Share** — generate a portable URL that encodes the full session. Anyone with the link sees it.
- **Export HTML** — download a self-contained, zero-dependency file
- **Export ZIP** — full UI Kit with components, tokens, and manifest
- **Export PNG** — screenshot at the active device size
- **Export JSON** — complete session backup

---

## Step 4 (Optional): Install the Companion CLI

The **gia-cli** unlocks terminal access from within the design app — run shell commands, install packages, and access your filesystem.

```bash
npm install -g gia-cli
gia start
```

Then use the Terminal panel in the app (Header → ⋯ → Terminal). The app auto-detects the companion — no configuration needed.

| Feature | Without CLI | With CLI |
|---------|------------|----------|
| AI generation | ✅ | ✅ |
| Canvas, screens, exports | ✅ | ✅ |
| Terminal panel | Hidden | Full shell access |
| Package install | N/A | npm/pip/cargo |
| Disk storage | localStorage | Server-side |

---

## Step 5: Build the Android APK (Optional)

Requires Java 21, Android SDK, and Gradle.

```bash
npm run android:sync
cd android && ./gradlew assembleDebug
```

APK is at: `android/app/build/outputs/apk/debug/app-debug.apk`

See [Android Build Guide](./android-build.md) for signed release builds.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App won't load | Make sure Node.js v22+ is installed (`node -v`) |
| Port 3000 in use | Vite will auto-pick the next port — check terminal output |
| AI generation fails | Check your API key in Settings → make sure you have credits |
| Terminal panel not visible | Install and start gia-cli (`gia start`) |
| Android APK install blocked | Enable "Install from unknown sources" in Android Settings |
