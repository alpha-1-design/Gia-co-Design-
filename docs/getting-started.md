# Getting Started with Gia-co-Design

Gia-co-Design is a standalone, client-side AI design studio. No backend, no accounts — just your browser and an API key from a supported provider.

## 1. Install

```bash
git clone https://github.com/alpha-1-design/Gia-co-Design-.git
cd Gia-co-Design
npm ci
```

## 2. Configure an API Key

Open the app and click the **Settings** gear icon. Choose a provider and paste your API key:

- **Google Gemini** — [Google AI Studio](https://aistudio.google.com/)
- **OpenRouter** — [openrouter.ai](https://openrouter.ai/)
- **Anthropic** — [console.anthropic.com](https://console.anthropic.com/)
- **OpenAI** — [platform.openai.com](https://platform.openai.com/)
- **Groq, DeepSeek, Mistral, Together, xAI, Ollama, Custom** — see Settings

Keys are stored in your browser's local storage and never leave your machine.

## 3. Start Designing

1. Type a prompt in the **Agent Prompt** panel (e.g., "Create a mobile dashboard with a floating action button").
2. Hit **Generate** — the AI produces a live HTML design in the preview pane.
3. Use **Direct Edit** to drag, resize, and tweak colors on the canvas; click **Sync to Code** to push changes back.
4. Generate **multiple directions** (1–3 variants) to explore alternatives.
5. Attach a **wireframe screenshot** (click the image icon) so the AI matches your reference.
6. Import a **Design System** (HTML/CSS paste or file upload) so outputs match your brand.
7. Run **Critique** for an AI accessibility and design-quality audit, then **Fix with AI**.

## 4. Share & Export

- **Share** — generate a portable link that encodes the full design session in the URL. Anyone with the link sees it in read-only mode.
- **Export** — download as a single HTML file, ZIP bundle (with UI Kit), JSON session backup, or PNG screenshot.

## 5. Android App

To install as an Android app:

```bash
npm run android:sync
cd android && ./gradlew assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.

When installed, the app checks GitHub Releases on launch and prompts you to update automatically when a new version is available.

## 6. Version Bumps

```bash
npm run bump:patch   # 1.0.0 → 1.0.1
npm run bump:minor   # 1.0.0 → 1.1.0
npm run bump:major   # 1.0.0 → 2.0.0
git add -A && git commit -m "chore: release v1.0.1"
git tag v1.0.1 && git push origin main --tags
```
