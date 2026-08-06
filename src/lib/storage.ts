import { BYOKConfig, DesignSession, DesignSystem } from '../types';

const BYOK_KEY = 'open_codesign_byok_config';
const SESSIONS_KEY = 'open_codesign_sessions';
const ACTIVE_SESSION_ID_KEY = 'open_codesign_active_session_id';
const DESIGN_SYSTEMS_KEY = 'open_codesign_design_systems';
const ACTIVE_DESIGN_SYSTEM_KEY = 'open_codesign_active_design_system_id';

export const DEFAULT_BYOK_CONFIG: BYOKConfig = {
  provider: 'gemini',
  geminiApiKey: '',
  openrouterApiKey: '',
  opencodezenApiKey: '',
  opencodezenBaseUrl: 'https://opencodezen.com/v1',
  openaiApiKey: '',
  anthropicApiKey: '',
  groqApiKey: '',
  deepseekApiKey: '',
  mistralApiKey: '',
  togetherApiKey: '',
  xaiApiKey: '',
  ollamaBaseUrl: 'http://localhost:11434/v1',
  customApiKey: '',
  customBaseUrl: 'https://api.openai.com/v1',
  vercelToken: '',
  selectedModel: 'gemini-2.5-flash',
  systemPrompt: `You are an expert AI UI/UX designer and frontend engineer. 
Your task is to generate complete, modern, beautifully styled, responsive HTML/CSS/JS components or web applications.
Always use Tailwind CSS (via CDN <script src="https://cdn.tailwindcss.com"></script>) and Lucide Icons or standard SVG icons.
Make the layout highly polished, touch-friendly, accessible, and clean. 
Return ONLY the full self-contained valid HTML document inside a markdown code block starting with \`\`\`html and ending with \`\`\`.`,
};

export const INITIAL_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gia-co-Design Sample</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-600/30">
        Gia
      </div>
      <div>
        <h2 class="text-lg font-bold text-white">Gia-co-Design</h2>
        <p class="text-xs text-slate-400">Standalone Client-Side BYOK AI Studio</p>
      </div>
    </div>
    <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
      <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Ready to Design</span>
      <p class="text-sm text-slate-300">Configure your favorite AI provider (Gemini, OpenAI, Anthropic, Groq, DeepSeek, Mistral, Together, xAI, Ollama) in Settings and start building!</p>
    </div>
    <button onclick="alert('Gia-co-Design standalone mode active!')" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/25 active:scale-98">
      Test Interactive Button
    </button>
  </div>
</body>
</html>`;

export function loadBYOKConfig(): BYOKConfig {
  try {
    const raw = localStorage.getItem(BYOK_KEY);
    if (raw) {
      return { ...DEFAULT_BYOK_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load BYOK config', e);
  }
  return DEFAULT_BYOK_CONFIG;
}

export function saveBYOKConfig(config: BYOKConfig): void {
  try {
    localStorage.setItem(BYOK_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save BYOK config', e);
  }
}

export function loadSessions(): DesignSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load sessions', e);
  }

  // Initial default session
  const defaultSession: DesignSession = {
    id: 'session-default-1',
    title: 'Mobile App Concept',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeTurnIndex: 0,
    turns: [
      {
        id: 'turn-initial-1',
        role: 'assistant',
        prompt: 'Initial Open CoDesign Sample Canvas',
        codeHtml: INITIAL_SAMPLE_HTML,
        timestamp: Date.now(),
        modelUsed: 'gemini-2.5-flash',
        tokensCost: 420,
      },
    ],
  };
  saveSessions([defaultSession]);
  return [defaultSession];
}

export function saveSessions(sessions: DesignSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

export function getActiveSessionId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_SESSION_ID_KEY);
    if (saved) return saved;
  } catch (e) {
    console.error('Failed to load active session ID', e);
  }
  return 'session-default-1';
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  } catch (e) {
    console.error('Failed to save active session ID', e);
  }
}

export function loadDesignSystems(): DesignSystem[] {
  try {
    const raw = localStorage.getItem(DESIGN_SYSTEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load design systems', e);
  }
  return [];
}

export function saveDesignSystems(systems: DesignSystem[]): void {
  try {
    localStorage.setItem(DESIGN_SYSTEMS_KEY, JSON.stringify(systems));
  } catch (e) {
    console.error('Failed to save design systems', e);
  }
}

export function getActiveDesignSystemId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_DESIGN_SYSTEM_KEY);
  } catch (e) {
    console.error('Failed to load active design system ID', e);
    return null;
  }
}

export function setActiveDesignSystemId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_DESIGN_SYSTEM_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_DESIGN_SYSTEM_KEY);
    }
  } catch (e) {
    console.error('Failed to save active design system ID', e);
  }
}
