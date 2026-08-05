export type AIProvider = 
  | 'gemini' 
  | 'openrouter' 
  | 'opencodezen'
  | 'openai' 
  | 'anthropic' 
  | 'groq' 
  | 'deepseek' 
  | 'mistral' 
  | 'together' 
  | 'xai' 
  | 'ollama' 
  | 'custom';

export interface BYOKConfig {
  provider: AIProvider;
  geminiApiKey: string;
  openrouterApiKey: string;
  opencodezenApiKey: string;
  opencodezenBaseUrl: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  groqApiKey: string;
  deepseekApiKey: string;
  mistralApiKey: string;
  togetherApiKey: string;
  xaiApiKey: string;
  ollamaBaseUrl: string;
  customApiKey: string;
  customBaseUrl: string;
  selectedModel: string;
  systemPrompt: string;
}

export interface PinComment {
  id: string;
  x: number; // percentage
  y: number; // percentage
  elementTag?: string;
  comment: string;
  resolved: boolean;
  createdAt: number;
}

export interface UIKitFile {
  path: string;
  content: string;
  language: 'html' | 'css' | 'typescript' | 'json' | 'markdown';
}

export interface ParityCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface UIKitDecomposition {
  kitName: string;
  version: string;
  files: UIKitFile[];
  parityChecks: ParityCheck[];
  parityScore: number;
  tokensUsed: number;
  generatedAt: number;
}

export interface DesignTurn {
  id: string;
  role: 'user' | 'assistant';
  prompt: string;
  codeHtml: string;
  directions?: string[];
  activeDirection?: number;
  timestamp: number;
  modelUsed: string;
  tokensCost?: number;
  pins?: PinComment[];
}

export interface DesignSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: DesignTurn[];
  activeTurnIndex: number;
  uiKit?: UIKitDecomposition;
}

export interface DesignSystem {
  id: string;
  name: string;
  sourceHtml: string;
  createdAt: number;
  updatedAt: number;
}

export interface ImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}

export interface CritiqueFinding {
  severity: 'error' | 'warning' | 'suggestion';
  category: string;
  title: string;
  detail: string;
  fix?: string;
}

export interface DesignCritique {
  score: number;
  summary: string;
  findings: CritiqueFinding[];
  tokensUsed: number;
  generatedAt: number;
}

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
