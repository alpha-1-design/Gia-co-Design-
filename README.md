# Gia-co-Design 🎨✨

**Gia-co-Design** is a modern, standalone, Bring-Your-Own-Key (BYOK) AI design studio and UI Kit generator workspace. It enables frontend designers and engineers to prompt, decompose, preview, and refine agentic UI components across multiple leading AI provider networks.

---

## 🌟 Key Features

- **Multi-AI Provider Support**: Seamlessly switch between:
  - **Google Gemini** (`gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`, etc.)
  - **OpenRouter** (Claude 3.5 Sonnet, DeepSeek R1, Llama 3.3, Qwen 2.5 Coder)
  - **OpenCode Zen** (`opencode-zen-1`, `opencode-coder`, Claude, DeepSeek, GPT-4o)
  - **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`)
  - **Anthropic** (`claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`)
  - **Groq**, **DeepSeek**, **Mistral**, **Together**, **xAI**, **Ollama**, & **Custom OpenAI-compatible endpoints**
- **Live Model Fetching**: Query available models directly from provider REST endpoints in real time.
- **Robust Key & Parameter Sanitization**: Automatic trimming, quote stripping, and parameter safety to prevent API 400 errors.
- **Client-Side Persistence**: Saves your provider configurations and key statuses safely in local browser storage.
- **Responsive Theme Support**: Dark and Light themes with styled Lucide vector icons and smooth motion transitions.

---

## 🚀 Quick Start

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd gia-co-design
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Scripts

- `npm run dev`: Runs Vite dev server on port `3000`.
- `npm run build`: Compiles TypeScript and builds production bundle to `dist/`.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run TypeScript type-checking (`tsc --noEmit`).

---

## 🐙 Push to GitHub

To push this codebase to a new GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Commit changes
git commit -m "feat: complete Gia-co-Design BYOK studio setup"

# 4. Set default main branch
git branch -M main

# 5. Connect your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/gia-co-design.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 License

MIT License.
