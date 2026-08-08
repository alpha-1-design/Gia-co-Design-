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
  vercelToken: string;
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

export interface VersionSnapshot {
  id: string;
  turnIndex: number;
  codeHtml: string;
  timestamp: number;
  label?: string;
  isBookmarked: boolean;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'navigation' | 'form' | 'card' | 'hero' | 'footer' | 'modal' | 'other';
  codeHtml: string;
  thumbnail?: string;
  tags: string[];
  createdAt: number;
  usageCount: number;
}

export interface PrototypeNode {
  id: string;
  turnId: string;
  x: number;
  y: number;
  label: string;
}

export interface PrototypeLink {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  triggerArea?: { x: number; y: number; width: number; height: number };
  label?: string;
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
  versionSnapshots?: VersionSnapshot[];
  prototypeNodes?: PrototypeNode[];
  prototypeLinks?: PrototypeLink[];
  autoLayoutConfig?: AutoLayoutConfig;
  constraintConfig?: ConstraintConfig;
  interactiveHotspots?: InteractiveHotspot[];
  animationPresets?: AnimationPreset[];
  componentVariants?: ComponentVariant[];
  accessibilityReport?: AccessibilityReport;
  designTokens?: DesignToken[];
}

export interface DesignScreen {
  id: string;
  name: string;
  kind: 'website' | 'mobile' | 'dashboard' | 'landing' | 'component' | 'other';
  turns: DesignTurn[];
  activeTurnIndex: number;
  createdAt: number;
}

export interface DesignSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  screens: DesignScreen[];
  activeScreenId: string;
  /** @deprecated pre-multi-screen data, kept only so old localStorage sessions can be migrated on load */
  turns?: DesignTurn[];
  /** @deprecated see turns */
  activeTurnIndex?: number;
  uiKit?: UIKitDecomposition;
  branches?: string[]; // IDs of branched sessions
  parentSessionId?: string;
  parentTurnIndex?: number;
  templateId?: string;
}

export interface AssetFile {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  size: number;
  uploadedAt: number;
  optimizedDataUrl?: string;
}

export interface TemplateGalleryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  previewHtml: string;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export interface DesignSystem {
  id: string;
  name: string;
  sourceHtml: string;
  createdAt: number;
  updatedAt: number;
}

export interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'border' | 'shadow' | 'breakpoint';
  category: string;
  description?: string;
}

export interface ExportPreset {
  id: string;
  name: string;
  platform: 'react-native' | 'flutter' | 'swiftui' | 'jetpack-compose' | 'web' | 'vue' | 'svelte' | 'angular';
  framework?: string;
  stylingApproach: 'tailwind' | 'styled-components' | 'css-modules' | 'inline' | 'native-styles' | 'tokens';
  componentFormat: 'tsx' | 'jsx' | 'ts' | 'dart' | 'swift' | 'kt' | 'vue' | 'svelte';
  includeTokens: boolean;
  includeResponsiveVariants: boolean;
  includeDarkMode: boolean;
  outputStructure: 'flat' | 'component-folders' | 'atomic-design';
}

export interface AutoLayoutConfig {
  enabled: boolean;
  direction: 'horizontal' | 'vertical';
  alignItems: 'start' | 'center' | 'end' | 'stretch';
  justifyContent: 'start' | 'center' | 'end' | 'between' | 'around';
  gap: number;
  padding: { top: number; right: number; bottom: number; left: number };
  wrap: boolean;
}

export interface ConstraintConfig {
  horizontal: 'left' | 'right' | 'leftRight' | 'scale' | 'center';
  vertical: 'top' | 'bottom' | 'topBottom' | 'scale' | 'center';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  previewWidth: number;
}

export interface ComponentVariant {
  id: string;
  name: string;
  codeHtml: string;
  isActive: boolean;
  properties: Record<string, any>;
}

export interface InteractiveHotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetScreenId?: string;
  action: 'navigate' | 'open-modal' | 'trigger-animation' | 'external-link';
  url?: string;
  animation?: string;
  label?: string;
}

export interface AnimationPreset {
  id: string;
  name: string;
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'pulse' | 'shake';
  duration: number;
  delay?: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  iterations?: number;
  trigger: 'on-load' | 'on-hover' | 'on-click' | 'on-scroll';
}

export interface AccessibilityReport {
  wcagLevel: 'A' | 'AA' | 'AAA';
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: string[];
}

export interface AccessibilityIssue {
  id: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  rule: string;
  element: string;
  description: string;
  suggestion: string;
  wcagCriteria: string;
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
