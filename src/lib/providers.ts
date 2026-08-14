import { AIProvider, BYOKConfig } from '../types';

export interface ProviderModel {
  value: string;
  label: string;
}

export interface ProviderDefinition {
  id: AIProvider;
  label: string;
  tag: string;
  defaultModel: string;
  keyField?: keyof BYOKConfig;
  keyRequired: boolean;
  keyPlaceholder: string;
  baseUrl: string;
  getBaseUrl?: (cfg: BYOKConfig) => string;
  modelsKind: 'gemini' | 'anthropic' | 'openai';
  note?: string;
  curatedModels: ProviderModel[];
}

export const PROVIDERS: Record<AIProvider, ProviderDefinition> = {
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    tag: 'Google AI',
    defaultModel: 'gemini-2.5-flash',
    keyField: 'geminiApiKey',
    keyRequired: true,
    keyPlaceholder: 'AIzaSy...',
    baseUrl: 'https://generativelanguage.googleapis.com',
    modelsKind: 'gemini',
    curatedModels: [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Reasoning)' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    ],
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    tag: 'GPT',
    defaultModel: 'gpt-4o',
    keyField: 'openaiApiKey',
    keyRequired: true,
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.openai.com/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      { value: 'o3', label: 'O3 (Reasoning)' },
      { value: 'o4-mini', label: 'O4 mini (Reasoning)' },
    ],
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic',
    tag: 'Claude',
    defaultModel: 'claude-sonnet-4-5',
    keyField: 'anthropicApiKey',
    keyRequired: true,
    keyPlaceholder: 'sk-ant-...',
    baseUrl: 'https://api.anthropic.com',
    modelsKind: 'anthropic',
    curatedModels: [
      { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
      { value: 'claude-opus-4-1', label: 'Claude Opus 4.1' },
      { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { value: 'claude-3-7-sonnet-latest', label: 'Claude 3.7 Sonnet' },
      { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
    ],
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    tag: 'Multi-Model',
    defaultModel: 'anthropic/claude-sonnet-4-5',
    keyField: 'openrouterApiKey',
    keyRequired: true,
    keyPlaceholder: 'sk-or-v1-...',
    baseUrl: 'https://openrouter.ai/api/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (OpenRouter)' },
      { value: 'anthropic/claude-opus-4-1', label: 'Claude Opus 4.1 (OpenRouter)' },
      { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (OpenRouter)' },
      { value: 'openai/gpt-4o', label: 'GPT-4o (OpenRouter)' },
      { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (OpenRouter)' },
    ],
  },
  opencodezen: {
    id: 'opencodezen',
    label: 'OpenCode Zen',
    tag: 'OpenCode',
    defaultModel: 'deepseek-v4-flash-free',
    keyField: 'opencodezenApiKey',
    keyRequired: true,
    keyPlaceholder: 'API key from opencode.ai/auth',
    baseUrl: 'https://opencode.ai/zen/v1',
    getBaseUrl: (cfg) => cfg.opencodezenBaseUrl || 'https://opencode.ai/zen/v1',
    modelsKind: 'openai',
    note: 'Only models on the /chat/completions endpoint work here (DeepSeek, MiniMax, GLM, Kimi, and the free models below) - OpenCode Zen serves its GPT and Claude models through different, incompatible API formats this app does not speak.',
    curatedModels: [
      { value: 'deepseek-v4-flash-free', label: 'DeepSeek V4 Flash (Free)' },
      { value: 'big-pickle', label: 'Big Pickle (Free)' },
      { value: 'mimo-v2.5-free', label: 'MiMo V2.5 (Free)' },
      { value: 'hy3-free', label: 'Hy3 (Free)' },
      { value: 'laguna-s-2.1-free', label: 'Laguna S 2.1 (Free)' },
      { value: 'ling-3.0-tiny-free', label: 'Ling 3.0 Tiny (Free)' },
      { value: 'nemotron-3-ultra-free', label: 'Nemotron 3 Ultra (Free)' },
      { value: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
      { value: 'glm-5.2', label: 'GLM 5.2' },
      { value: 'kimi-k3', label: 'Kimi K3' },
      { value: 'minimax-m3', label: 'MiniMax M3' },
    ],
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    tag: 'Ultra-Fast',
    defaultModel: 'llama-3.3-70b-versatile',
    keyField: 'groqApiKey',
    keyRequired: true,
    keyPlaceholder: 'gsk_...',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)' },
      { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B (Groq)' },
      { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    ],
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    tag: 'V3 / R1',
    defaultModel: 'deepseek-chat',
    keyField: 'deepseekApiKey',
    keyRequired: true,
    keyPlaceholder: 'sk-...',
    baseUrl: 'https://api.deepseek.com/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'deepseek-chat', label: 'DeepSeek-V3 (deepseek-chat)' },
      { value: 'deepseek-reasoner', label: 'DeepSeek-R1 (deepseek-reasoner)' },
    ],
  },
  mistral: {
    id: 'mistral',
    label: 'Mistral',
    tag: 'Codestral',
    defaultModel: 'mistral-large-latest',
    keyField: 'mistralApiKey',
    keyRequired: true,
    keyPlaceholder: 'api-key-...',
    baseUrl: 'https://api.mistral.ai/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'mistral-large-latest', label: 'Mistral Large' },
      { value: 'codestral-latest', label: 'Codestral (Coding)' },
      { value: 'pixtral-large-latest', label: 'Pixtral Large (Vision)' },
      { value: 'mistral-small-latest', label: 'Mistral Small' },
    ],
  },
  together: {
    id: 'together',
    label: 'Together',
    tag: 'Llama 3.3',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    keyField: 'togetherApiKey',
    keyRequired: true,
    keyPlaceholder: 'together-api-key-...',
    baseUrl: 'https://api.together.xyz/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo' },
      { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1 (Together)' },
      { value: 'Qwen/Qwen2.5-72B-Instruct-Turbo', label: 'Qwen 2.5 72B Turbo' },
    ],
  },
  xai: {
    id: 'xai',
    label: 'xAI',
    tag: 'Grok',
    defaultModel: 'grok-3',
    keyField: 'xaiApiKey',
    keyRequired: true,
    keyPlaceholder: 'xai-...',
    baseUrl: 'https://api.x.ai/v1',
    modelsKind: 'openai',
    curatedModels: [
      { value: 'grok-3', label: 'Grok 3' },
      { value: 'grok-3-mini', label: 'Grok 3 Mini' },
      { value: 'grok-2-latest', label: 'Grok 2' },
    ],
  },
  ollama: {
    id: 'ollama',
    label: 'Ollama',
    tag: 'Local AI',
    defaultModel: 'llama3.2',
    keyRequired: false,
    keyPlaceholder: '',
    baseUrl: 'http://localhost:11434/v1',
    getBaseUrl: (cfg) => cfg.ollamaBaseUrl || 'http://localhost:11434/v1',
    modelsKind: 'openai',
    note: 'Local endpoint, no API key required.',
    curatedModels: [
      { value: 'llama3.2', label: 'Llama 3.2 (Local)' },
      { value: 'llama3.1', label: 'Llama 3.1 (Local)' },
      { value: 'qwen2.5', label: 'Qwen 2.5 (Local)' },
      { value: 'deepseek-r1', label: 'DeepSeek R1 (Local)' },
      { value: 'mistral', label: 'Mistral (Local)' },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    tag: 'OpenAI API',
    defaultModel: 'gpt-4o-mini',
    keyField: 'customApiKey',
    keyRequired: false,
    keyPlaceholder: 'sk-custom...',
    baseUrl: 'https://api.openai.com/v1',
    getBaseUrl: (cfg) => cfg.customBaseUrl || 'https://api.openai.com/v1',
    modelsKind: 'openai',
    note: 'Any OpenAI-compatible endpoint. Model name is freeform.',
    curatedModels: [
      { value: 'gpt-4o-mini', label: 'gpt-4o-mini (example)' },
      { value: 'gpt-4o', label: 'gpt-4o (example)' },
    ],
  },
};

export const PROVIDER_LIST: ProviderDefinition[] = [
  PROVIDERS.gemini,
  PROVIDERS.openrouter,
  PROVIDERS.opencodezen,
  PROVIDERS.openai,
  PROVIDERS.anthropic,
  PROVIDERS.groq,
  PROVIDERS.deepseek,
  PROVIDERS.mistral,
  PROVIDERS.together,
  PROVIDERS.xai,
  PROVIDERS.ollama,
  PROVIDERS.custom,
];

export interface ProviderRuntime {
  provider: AIProvider;
  key: string;
  baseUrl: string;
  defaultModel: string;
}

export function cleanApiKey(key: string | undefined): string {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '').trim();
}

export function getProviderDefinition(provider: AIProvider): ProviderDefinition {
  return PROVIDERS[provider] || PROVIDERS.gemini;
}

export function getProviderRuntime(byok: BYOKConfig): ProviderRuntime {
  const def = getProviderDefinition(byok.provider);
  const key = def.keyField ? cleanApiKey(String((byok as unknown as Record<string, unknown>)[def.keyField] ?? '')) : '';
  const baseUrl = def.getBaseUrl ? def.getBaseUrl(byok) : def.baseUrl;
  return { provider: def.id, key, baseUrl, defaultModel: def.defaultModel };
}

export function getCuratedModels(provider: AIProvider): ProviderModel[] {
  return getProviderDefinition(provider).curatedModels;
}

export function isKeyConfigured(byok: BYOKConfig, provider: AIProvider): boolean {
  const def = getProviderDefinition(provider);
  if (!def.keyRequired) return true;
  if (!def.keyField) return false;
  const key = cleanApiKey(String((byok as unknown as Record<string, unknown>)[def.keyField] ?? ''));
  return key.length > 0;
}

const liveModelCache = new Map<string, ProviderModel[]>();

export function cacheKeyFor(byok: BYOKConfig, provider: AIProvider = byok.provider): string {
  const runtime = getProviderRuntime({ ...byok, provider });
  return `${provider}:${runtime.baseUrl}`;
}

export function getCachedModels(byok: BYOKConfig, provider: AIProvider = byok.provider): ProviderModel[] | undefined {
  return liveModelCache.get(cacheKeyFor(byok, provider));
}

export function cacheModels(byok: BYOKConfig, models: ProviderModel[], provider: AIProvider = byok.provider): void {
  if (models.length > 0) {
    liveModelCache.set(cacheKeyFor(byok, provider), models);
  }
}

export function availableModels(byok: BYOKConfig, provider: AIProvider = byok.provider): ProviderModel[] {
  return getCachedModels(byok, provider) || getCuratedModels(provider);
}
