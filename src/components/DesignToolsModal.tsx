import React, { useState } from 'react';
import {
  X,
  Wand2,
  Palette,
  ShieldCheck,
  LayoutTemplate,
  FileCode2,
  Loader2,
  Copy,
  Check,
  Plus,
  AlertTriangle,
  Rocket,
  ExternalLink,
} from 'lucide-react';
import { BYOKConfig, DesignToken, AccessibilityReport, AutoLayoutConfig, ExportPreset } from '../types';
import {
  generateComponentFromPrompt,
  extractDesignTokens,
  generateAccessibilityReport,
  generateAutoLayoutConfig,
  convertToPlatform,
} from '../lib/ai';
import { deployToVercel } from '../lib/vercelDeploy';

type Tab = 'component' | 'tokens' | 'a11y' | 'layout' | 'export' | 'deploy';

interface DesignToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceHtml: string | null;
  byok: BYOKConfig;
  designSystemHtml?: string;
  theme: 'light' | 'dark';
  onInsertComponent: (html: string, label: string) => void;
}

const PLATFORM_PRESETS: Array<{ label: string; preset: ExportPreset }> = [
  {
    label: 'React Native',
    preset: {
      id: 'rn', name: 'React Native', platform: 'react-native', stylingApproach: 'native-styles',
      componentFormat: 'tsx', includeTokens: true, includeResponsiveVariants: false, includeDarkMode: false, outputStructure: 'flat',
    },
  },
  {
    label: 'Flutter',
    preset: {
      id: 'flutter', name: 'Flutter', platform: 'flutter', stylingApproach: 'native-styles',
      componentFormat: 'dart', includeTokens: true, includeResponsiveVariants: false, includeDarkMode: false, outputStructure: 'flat',
    },
  },
  {
    label: 'SwiftUI',
    preset: {
      id: 'swiftui', name: 'SwiftUI', platform: 'swiftui', stylingApproach: 'native-styles',
      componentFormat: 'swift', includeTokens: true, includeResponsiveVariants: false, includeDarkMode: false, outputStructure: 'flat',
    },
  },
  {
    label: 'Jetpack Compose',
    preset: {
      id: 'compose', name: 'Jetpack Compose', platform: 'jetpack-compose', stylingApproach: 'native-styles',
      componentFormat: 'kt', includeTokens: true, includeResponsiveVariants: false, includeDarkMode: false, outputStructure: 'flat',
    },
  },
  {
    label: 'Vue 3',
    preset: {
      id: 'vue', name: 'Vue 3', platform: 'vue', stylingApproach: 'tailwind',
      componentFormat: 'vue', includeTokens: false, includeResponsiveVariants: true, includeDarkMode: false, outputStructure: 'flat',
    },
  },
  {
    label: 'Svelte',
    preset: {
      id: 'svelte', name: 'Svelte', platform: 'svelte', stylingApproach: 'tailwind',
      componentFormat: 'svelte', includeTokens: false, includeResponsiveVariants: true, includeDarkMode: false, outputStructure: 'flat',
    },
  },
];

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'component', label: 'Component', icon: Wand2 },
  { id: 'tokens', label: 'Tokens', icon: Palette },
  { id: 'a11y', label: 'Accessibility', icon: ShieldCheck },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'export', label: 'Export Code', icon: FileCode2 },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
];

function CopyButton({ text, isLight }: { text: string; isLight: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable, silently ignore */
        }
      }}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
        isLight ? 'bg-white hover:bg-[#f4f0e8] text-[#575249] border border-[#e2ddd3]' : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border border-[#3d3831]'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export const DesignToolsModal: React.FC<DesignToolsModalProps> = ({
  isOpen,
  onClose,
  sourceHtml,
  byok,
  designSystemHtml,
  theme,
  onInsertComponent,
}) => {
  const [tab, setTab] = useState<Tab>('component');
  const isLight = theme === 'light';

  // Component generator state
  const [componentPrompt, setComponentPrompt] = useState('');
  const [componentCategory, setComponentCategory] = useState('card');
  const [componentResult, setComponentResult] = useState<{ codeHtml: string; name: string; description: string; tags: string[] } | null>(null);
  const [componentLoading, setComponentLoading] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Tokens state
  const [tokens, setTokens] = useState<DesignToken[] | null>(null);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);

  // Accessibility state
  const [a11yReport, setA11yReport] = useState<AccessibilityReport | null>(null);
  const [a11yLoading, setA11yLoading] = useState(false);
  const [a11yError, setA11yError] = useState<string | null>(null);

  // Layout state
  const [layoutConfig, setLayoutConfig] = useState<AutoLayoutConfig | null>(null);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  // Export state
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORM_PRESETS[0]);
  const [exportResult, setExportResult] = useState<{ code: string; files: Array<{ path: string; content: string }> } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Deploy state
  const [deployTarget, setDeployTarget] = useState<'preview' | 'production'>('preview');
  const [deployResult, setDeployResult] = useState<{ url: string } | null>(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  if (!isOpen) return null;

  const noSourceMsg = 'Generate a design first, then come back here to analyze or export it.';

  const runComponentGenerate = async () => {
    if (!componentPrompt.trim()) return;
    setComponentLoading(true);
    setComponentError(null);
    setComponentResult(null);
    try {
      const result = await generateComponentFromPrompt(componentPrompt, componentCategory, byok, designSystemHtml);
      setComponentResult(result);
    } catch (e: any) {
      setComponentError(e?.message || 'Failed to generate component.');
    } finally {
      setComponentLoading(false);
    }
  };

  const runTokenExtraction = async () => {
    if (!sourceHtml) return;
    setTokensLoading(true);
    setTokensError(null);
    try {
      const result = await extractDesignTokens(sourceHtml, byok);
      setTokens(result.tokens);
    } catch (e: any) {
      setTokensError(e?.message || 'Failed to extract design tokens.');
    } finally {
      setTokensLoading(false);
    }
  };

  const runA11yAudit = async () => {
    if (!sourceHtml) return;
    setA11yLoading(true);
    setA11yError(null);
    try {
      const result = await generateAccessibilityReport(sourceHtml, byok);
      setA11yReport(result.report);
    } catch (e: any) {
      setA11yError(e?.message || 'Failed to run accessibility audit.');
    } finally {
      setA11yLoading(false);
    }
  };

  const runLayoutAnalysis = async () => {
    if (!sourceHtml) return;
    setLayoutLoading(true);
    setLayoutError(null);
    try {
      const result = await generateAutoLayoutConfig(sourceHtml, byok);
      setLayoutConfig(result.config);
    } catch (e: any) {
      setLayoutError(e?.message || 'Failed to analyze layout.');
    } finally {
      setLayoutLoading(false);
    }
  };

  const runExport = async () => {
    if (!sourceHtml) return;
    setExportLoading(true);
    setExportError(null);
    setExportResult(null);
    try {
      const result = await convertToPlatform(sourceHtml, selectedPlatform.preset, byok);
      if (!result.code && result.files.length === 0) {
        throw new Error('The model returned an empty conversion. Try again or pick a different platform.');
      }
      setExportResult(result);
    } catch (e: any) {
      setExportError(e?.message || 'Failed to convert design.');
    } finally {
      setExportLoading(false);
    }
  };

  const runDeploy = async () => {
    if (!sourceHtml) return;
    setDeployLoading(true);
    setDeployError(null);
    setDeployResult(null);
    try {
      const result = await deployToVercel(sourceHtml, 'gia-co-design-export', byok.vercelToken, deployTarget);
      setDeployResult({ url: result.url });
    } catch (e: any) {
      setDeployError(e?.message || 'Deployment failed.');
    } finally {
      setDeployLoading(false);
    }
  };

  const severityColor: Record<string, string> = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/30',
    serious: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    moderate: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
    minor: 'text-[#9e978a] bg-[#9e978a]/10 border-[#9e978a]/30',
  };

  const cardCls = `p-4 rounded-xl border ${isLight ? 'bg-white border-[#e6e1d7]' : 'bg-[#2a2723] border-[#3d3831]'}`;
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#d97757] transition-colors ${
    isLight ? 'bg-white border-[#e2ddd3] text-[#22201d]' : 'bg-[#2a2723] border-[#3d3831] text-[#f4f0ea]'
  }`;
  const primaryBtnCls = 'px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Design Tools</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1 px-3 pt-3 border-b overflow-x-auto ${isLight ? 'border-[#e6e1d7]' : 'border-[#38342e]'}`}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-colors border-b-2 ${
                  active
                    ? 'border-[#d97757] text-[#d97757]'
                    : isLight
                    ? 'border-transparent text-[#736e65] hover:text-[#22201d]'
                    : 'border-transparent text-[#9e978a] hover:text-[#f4f0ea]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          {tab === 'component' && (
            <>
              <p className="text-xs opacity-70">
                Generate a single, reusable, copy-pasteable component — separate from your main design canvas.
              </p>
              <div className="flex gap-2">
                <select value={componentCategory} onChange={(e) => setComponentCategory(e.target.value)} className={`${inputCls} w-36 shrink-0`}>
                  {['card', 'button', 'form', 'navigation', 'modal', 'hero', 'footer', 'other'].map((c) => (
                    <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <input
                  value={componentPrompt}
                  onChange={(e) => setComponentPrompt(e.target.value)}
                  placeholder="e.g. Pricing card with a highlighted 'popular' tier"
                  className={inputCls}
                  onKeyDown={(e) => { if (e.key === 'Enter') runComponentGenerate(); }}
                />
              </div>
              <button onClick={runComponentGenerate} disabled={componentLoading || !componentPrompt.trim()} className={primaryBtnCls}>
                {componentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Generate Component
              </button>
              {componentError && (
                <div className={`${cardCls} text-xs text-red-500 flex items-start gap-2`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {componentError}
                </div>
              )}
              {componentResult && (
                <div className={cardCls}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold">{componentResult.name}</p>
                      <p className="text-xs opacity-70">{componentResult.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {componentResult.tags.map((tg) => (
                      <span key={tg} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${isLight ? 'bg-[#f4f0e8] border-[#e2ddd3]' : 'bg-[#1b1a17] border-[#3d3831]'}`}>{tg}</span>
                    ))}
                  </div>
                  <div className={`rounded-lg overflow-hidden border ${isLight ? 'border-[#e2ddd3]' : 'border-[#3d3831]'}`}>
                    <iframe
                      title="component-preview"
                      srcDoc={componentResult.codeHtml}
                      sandbox="allow-scripts"
                      className="w-full h-56 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <CopyButton text={componentResult.codeHtml} isLight={isLight} />
                    <button
                      onClick={() => onInsertComponent(componentResult.codeHtml, componentResult.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isLight ? 'bg-[#d97757]/10 hover:bg-[#d97757]/20 text-[#a94a2e] border border-[#d97757]/30' : 'bg-[#d97757]/20 hover:bg-[#d97757]/30 text-[#e28566] border border-[#d97757]/40'}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Use as New Design
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'tokens' && (
            <>
              <p className="text-xs opacity-70">Extract the color, spacing, typography, and border tokens actually used in the current design.</p>
              {!sourceHtml ? (
                <div className={`${cardCls} text-xs opacity-70`}>{noSourceMsg}</div>
              ) : (
                <>
                  <button onClick={runTokenExtraction} disabled={tokensLoading} className={primaryBtnCls}>
                    {tokensLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />}
                    Extract Tokens
                  </button>
                  {tokensError && <div className={`${cardCls} text-xs text-red-500`}>{tokensError}</div>}
                  {tokens && (
                    tokens.length === 0 ? (
                      <div className={`${cardCls} text-xs opacity-70`}>No clear tokens were detected in this design.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tokens.map((t, i) => (
                          <div key={i} className={`${cardCls} flex items-center gap-2`}>
                            {t.type === 'color' && (
                              <span className="w-5 h-5 rounded-md border shrink-0" style={{ backgroundColor: t.value, borderColor: isLight ? '#e2ddd3' : '#3d3831' }} />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{t.name}</p>
                              <p className="text-[11px] opacity-60 truncate">{t.value} · {t.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </>
          )}

          {tab === 'a11y' && (
            <>
              <p className="text-xs opacity-70">Run a WCAG-focused accessibility audit against the current design.</p>
              {!sourceHtml ? (
                <div className={`${cardCls} text-xs opacity-70`}>{noSourceMsg}</div>
              ) : (
                <>
                  <button onClick={runA11yAudit} disabled={a11yLoading} className={primaryBtnCls}>
                    {a11yLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Run Audit
                  </button>
                  {a11yError && <div className={`${cardCls} text-xs text-red-500`}>{a11yError}</div>}
                  {a11yReport && (
                    <>
                      <div className={`${cardCls} flex items-center gap-4`}>
                        <div className="shrink-0">
                          <div className={`text-3xl font-serif-claude font-bold ${a11yReport.score >= 80 ? 'text-emerald-500' : a11yReport.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{a11yReport.score}</div>
                          <div className="text-[10px] uppercase tracking-wider text-[#9e978a] font-semibold">/ 100</div>
                        </div>
                        <div className="text-xs opacity-80">Estimated WCAG level: <span className="font-bold">{a11yReport.wcagLevel}</span></div>
                      </div>
                      {a11yReport.issues.length === 0 ? (
                        <div className={`${cardCls} text-xs`}>No issues found. {a11yReport.passedChecks.length} checks passed.</div>
                      ) : (
                        <div className="space-y-2">
                          {a11yReport.issues.map((iss) => (
                            <div key={iss.id} className={`p-3 rounded-xl border ${severityColor[iss.severity] || severityColor.minor}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider">{iss.severity}</span>
                                <span className="text-[10px] opacity-70">{iss.wcagCriteria}</span>
                              </div>
                              <p className="text-xs font-semibold">{iss.description}</p>
                              <p className="text-[11px] opacity-80 mt-1">Fix: {iss.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'layout' && (
            <>
              <p className="text-xs opacity-70">Infer the auto-layout structure (direction, alignment, spacing) the current design is using.</p>
              {!sourceHtml ? (
                <div className={`${cardCls} text-xs opacity-70`}>{noSourceMsg}</div>
              ) : (
                <>
                  <button onClick={runLayoutAnalysis} disabled={layoutLoading} className={primaryBtnCls}>
                    {layoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LayoutTemplate className="w-3.5 h-3.5" />}
                    Analyze Layout
                  </button>
                  {layoutError && <div className={`${cardCls} text-xs text-red-500`}>{layoutError}</div>}
                  {layoutConfig && (
                    <div className={`${cardCls} grid grid-cols-2 gap-3 text-xs`}>
                      <div><span className="opacity-60">Direction</span><p className="font-semibold">{layoutConfig.direction}</p></div>
                      <div><span className="opacity-60">Align Items</span><p className="font-semibold">{layoutConfig.alignItems}</p></div>
                      <div><span className="opacity-60">Justify Content</span><p className="font-semibold">{layoutConfig.justifyContent}</p></div>
                      <div><span className="opacity-60">Gap</span><p className="font-semibold">{layoutConfig.gap}px</p></div>
                      <div><span className="opacity-60">Wrap</span><p className="font-semibold">{layoutConfig.wrap ? 'Yes' : 'No'}</p></div>
                      <div>
                        <span className="opacity-60">Padding</span>
                        <p className="font-semibold">
                          {layoutConfig.padding.top}/{layoutConfig.padding.right}/{layoutConfig.padding.bottom}/{layoutConfig.padding.left}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'export' && (
            <>
              <p className="text-xs opacity-70">Convert the current design to another platform's native code. AI-translated — always review before shipping.</p>
              {!sourceHtml ? (
                <div className={`${cardCls} text-xs opacity-70`}>{noSourceMsg}</div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_PRESETS.map((p) => (
                      <button
                        key={p.preset.id}
                        onClick={() => { setSelectedPlatform(p); setExportResult(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          selectedPlatform.preset.id === p.preset.id
                            ? 'bg-[#d97757] text-white border-[#c66545]'
                            : isLight
                            ? 'bg-white hover:bg-[#f4f0e8] text-[#575249] border-[#e2ddd3]'
                            : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={runExport} disabled={exportLoading} className={primaryBtnCls}>
                    {exportLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCode2 className="w-3.5 h-3.5" />}
                    Convert to {selectedPlatform.label}
                  </button>
                  {exportError && <div className={`${cardCls} text-xs text-red-500`}>{exportError}</div>}
                  {exportResult && (
                    <div className="space-y-2">
                      {(exportResult.files.length > 0 ? exportResult.files : [{ path: 'component', content: exportResult.code }]).map((f, i) => (
                        <div key={i} className={cardCls}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono opacity-70">{f.path}</span>
                            <CopyButton text={f.content} isLight={isLight} />
                          </div>
                          <pre className={`text-[11px] font-mono overflow-x-auto max-h-48 p-2 rounded-lg ${isLight ? 'bg-[#f4f0e8]' : 'bg-[#1b1a17]'}`}>{f.content}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'deploy' && (
            <>
              <p className="text-xs opacity-70">Deploy the current design live to Vercel using your own access token.</p>
              {!sourceHtml ? (
                <div className={`${cardCls} text-xs opacity-70`}>{noSourceMsg}</div>
              ) : !byok.vercelToken.trim() ? (
                <div className={`${cardCls} text-xs flex items-start gap-2`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>No Vercel token configured. Add one in Settings (gear icon) - create it at <span className="font-mono-claude">vercel.com/account/tokens</span>.</span>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    {(['preview', 'production'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setDeployTarget(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                          deployTarget === t
                            ? 'bg-[#d97757] text-white border-[#c66545]'
                            : isLight
                            ? 'bg-white hover:bg-[#f4f0e8] text-[#575249] border-[#e2ddd3]'
                            : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={runDeploy} disabled={deployLoading} className={primaryBtnCls}>
                    {deployLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                    Deploy to Vercel
                  </button>
                  {deployError && (
                    <div className={`${cardCls} text-xs text-red-500 flex items-start gap-2`}>
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      {deployError}
                    </div>
                  )}
                  {deployResult && (
                    <div className={`${cardCls} flex items-center justify-between`}>
                      <span className="text-xs font-mono truncate mr-2">{deployResult.url}</span>
                      <a
                        href={deployResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${isLight ? 'bg-[#d97757]/10 hover:bg-[#d97757]/20 text-[#a94a2e] border border-[#d97757]/30' : 'bg-[#d97757]/20 hover:bg-[#d97757]/30 text-[#e28566] border border-[#d97757]/40'}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </a>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
