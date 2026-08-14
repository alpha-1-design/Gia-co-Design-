import { BYOKConfig, DesignSession, DesignScreen, DesignSystem, SavedComponent } from '../types';

const BYOK_KEY = 'open_codesign_byok_config';
const SESSIONS_KEY = 'open_codesign_sessions';
const ACTIVE_SESSION_ID_KEY = 'open_codesign_active_session_id';
const DESIGN_SYSTEMS_KEY = 'open_codesign_design_systems';
const COMPONENT_LIBRARY_KEY = 'open_codesign_component_library';
const ACTIVE_DESIGN_SYSTEM_KEY = 'open_codesign_active_design_system_id';

export const DEFAULT_BYOK_CONFIG: BYOKConfig = {
  provider: 'gemini',
  geminiApiKey: '',
  openrouterApiKey: '',
  opencodezenApiKey: '',
  opencodezenBaseUrl: 'https://opencode.ai/zen/v1',
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
  systemPrompt: `You are a world-class product designer and senior frontend engineer with deep expertise in visual design, typography, layout systems, motion, and accessibility - the caliber of designer who has shipped work at top design-led companies (Apple, Stripe, Linear, Airbnb).

Generate a complete, self-contained, production-quality HTML document. Follow these principles, not as decoration but as the actual basis for every decision:

TYPOGRAPHY & HIERARCHY
- Establish a clear type scale (e.g. one display size, 2-3 heading sizes, one body size, one caption size) - never more than 4-5 distinct sizes on a screen.
- Use font-weight and color/opacity to create hierarchy before reaching for size alone.
- Line-height should be looser for body text (1.5-1.7) and tighter for large headings (1.1-1.3). Line length should stay readable (roughly 45-75 characters for body copy).

SPACING & LAYOUT
- Use a consistent spacing scale (4px/8px base unit multiples) - never arbitrary one-off spacing values.
- Group related elements tightly, separate unrelated groups generously - spacing itself should communicate structure (proximity = relationship).
- Align everything to a clear grid. Avoid centering everything by default; asymmetric, purposeful layouts usually read as more considered.

COLOR
- One dominant neutral palette (backgrounds, text, borders) plus a small number of accent colors used deliberately, not scattered.
- Maintain WCAG AA contrast at minimum (4.5:1 for body text, 3:1 for large text/UI elements) - check this, do not guess.
- Use color with restraint: it should draw attention to what matters, not decorate everything equally.

DEPTH & DETAIL
- Prefer subtle shadows, borders, and background-color shifts over heavy drop shadows or gradients, unless the brief specifically calls for a bold/maximalist style.
- Rounded corners should be consistent across similar element types (e.g. all cards share one radius, all buttons share another).
- Small details matter: hover/focus/active states on every interactive element, appropriate cursor styles, disabled states that are visually distinct.

MOTION (when relevant)
- Motion should clarify, not decorate: entrances should feel like things settling into place, not arbitrary flourish.
- Keep durations short (150-300ms for micro-interactions, up to 500ms for larger entrances) with an eased curve (ease-out for entrances, ease-in-out for state changes) - never linear for UI motion.
- Respect prefers-reduced-motion where animations are non-essential.

CONTENT & COPY
- Write real, specific, plausible copy - never lorem ipsum, never "Company Name" placeholders. If the brief does not specify content, invent something concrete and appropriate to the context.

TECHNICAL
- Always use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) plus Lucide Icons or clean inline SVGs.
- Fully responsive by default - assume mobile-first unless told otherwise, and never let content overflow or clip at the target viewport width.
- Semantic HTML (nav, main, header, button vs div-with-onclick, etc.) and real accessibility (alt text, aria-labels on icon-only buttons, focus-visible states, logical tab order) - not decorative ARIA that does not match behavior.

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
      const merged = { ...DEFAULT_BYOK_CONFIG, ...JSON.parse(raw) };
      // opencodezen.com was never the real domain - the actual service lives
      // at opencode.ai/zen. Anyone who saved settings before this fix would
      // otherwise keep pointing at a URL that was always wrong, forever.
      if (merged.opencodezenBaseUrl === 'https://opencodezen.com/v1') {
        merged.opencodezenBaseUrl = 'https://opencode.ai/zen/v1';
        try {
          localStorage.setItem(BYOK_KEY, JSON.stringify(merged));
        } catch {
          // non-fatal - the in-memory correction above still applies for
          // this session even if persisting it back fails
        }
      }
      return merged;
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

// Wraps a legacy (pre-multi-screen) session's turns into a single DesignScreen
// so old localStorage data keeps working unchanged after this schema change.
function migrateSessionToScreens(session: DesignSession): DesignSession {
  if (Array.isArray(session.screens) && session.screens.length > 0) {
    return session;
  }
  const legacyTurns = session.turns && session.turns.length > 0
    ? session.turns
    : [{
        id: `turn-${Date.now()}`,
        role: 'assistant' as const,
        prompt: 'Untitled screen',
        codeHtml: INITIAL_SAMPLE_HTML,
        timestamp: Date.now(),
        modelUsed: 'gemini-2.5-flash',
      }];
  const screen: DesignScreen = {
    id: `screen-${session.id}-1`,
    name: session.title || 'Screen 1',
    kind: 'other',
    turns: legacyTurns,
    activeTurnIndex: Math.min(Math.max(session.activeTurnIndex ?? 0, 0), legacyTurns.length - 1),
    createdAt: session.createdAt,
  };
  return {
    ...session,
    screens: [screen],
    activeScreenId: screen.id,
  };
}

export function loadSessions(): DesignSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map(migrateSessionToScreens);
        saveSessions(migrated);
        return migrated;
      }
    }
  } catch (e) {
    console.error('Failed to load sessions', e);
  }

  // Initial default session
  const firstScreen: DesignScreen = {
    id: 'screen-default-1',
    name: 'Screen 1',
    kind: 'mobile',
    activeTurnIndex: 0,
    createdAt: Date.now(),
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
  const defaultSession: DesignSession = {
    id: 'session-default-1',
    title: 'Mobile App Concept',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    screens: [firstScreen],
    activeScreenId: firstScreen.id,
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

export function loadComponentLibrary(): SavedComponent[] {
  try {
    const raw = localStorage.getItem(COMPONENT_LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load component library', e);
  }
  return [];
}

export function saveComponentLibrary(components: SavedComponent[]): void {
  try {
    localStorage.setItem(COMPONENT_LIBRARY_KEY, JSON.stringify(components));
  } catch (e) {
    console.error('Failed to save component library', e);
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
