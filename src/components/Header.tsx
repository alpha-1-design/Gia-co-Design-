import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderKanban, 
  Settings, 
  Code2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Layers, 
  Download, 
  Sun,
  Moon,
  Loader2,
  Palette,
  Link2,
  History,
  Wand2,
  MoreVertical,
  LibraryBig,
  Terminal,
  Zap
} from 'lucide-react';
import { PreviewDevice, BYOKConfig, AIProvider } from '../types';
import { fetchLiveModels } from '../lib/ai';
import {
  PROVIDER_LIST,
  ProviderModel,
  availableModels,
  getCuratedModels,
  isKeyConfigured,
} from '../lib/providers';

interface HeaderProps {
  sessionTitle: string;
  byok: BYOKConfig;
  previewDevice: PreviewDevice;
  setPreviewDevice: (dev: PreviewDevice) => void;
  showCodeInspector: boolean;
  setShowCodeInspector: (show: boolean) => void;
  onOpenSettings: () => void;
  onOpenSessions: () => void;
  onOpenDecompose: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  onOpenDesignSystems: () => void;
  onOpenVersionHistory: () => void;
  onOpenDesignTools: () => void;
  onOpenComponentLibrary: () => void;
  onOpenSkillGallery: () => void;
  onToggleTerminal: () => void;
  showTerminal: boolean;
  activeSkillPrompt?: string;
  activeDesignSystemName?: string | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionTitle,
  byok,
  previewDevice,
  setPreviewDevice,
  showCodeInspector,
  setShowCodeInspector,
  onOpenSettings,
  onOpenSessions,
  onOpenDecompose,
  onOpenExport,
  onOpenShare,
  onOpenDesignSystems,
  onOpenVersionHistory,
  onOpenDesignTools,
  onOpenComponentLibrary,
  onOpenSkillGallery,
  onToggleTerminal,
  showTerminal,
  activeSkillPrompt,
  activeDesignSystemName,
  theme,
  onToggleTheme,
  onProviderChange,
  onModelChange,
}) => {
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMore) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMore]);

  const providerIdentity = [
    byok.provider,
    byok.opencodezenBaseUrl,
    byok.ollamaBaseUrl,
    byok.customBaseUrl,
    byok.geminiApiKey,
    byok.openrouterApiKey,
    byok.opencodezenApiKey,
    byok.openaiApiKey,
    byok.anthropicApiKey,
    byok.groqApiKey,
    byok.deepseekApiKey,
    byok.mistralApiKey,
    byok.togetherApiKey,
    byok.xaiApiKey,
    byok.customApiKey,
  ].join('|');

  useEffect(() => {
    let cancelled = false;
    setModels(availableModels(byok));
    if (isKeyConfigured(byok, byok.provider)) {
      setModelsLoading(true);
      fetchLiveModels(byok)
        .then((live) => {
          if (!cancelled && live.length > 0) setModels(live);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setModelsLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [providerIdentity]);

  const hasKey = Boolean(
    byok.geminiApiKey ||
    byok.openrouterApiKey ||
    byok.opencodezenApiKey ||
    byok.openaiApiKey ||
    byok.anthropicApiKey ||
    byok.groqApiKey ||
    byok.deepseekApiKey ||
    byok.mistralApiKey ||
    byok.togetherApiKey ||
    byok.xaiApiKey ||
    byok.customApiKey ||
    byok.provider === 'ollama'
  );

  const isLight = theme === 'light';

  const baseModelOptions = models.length > 0 ? models : getCuratedModels(byok.provider);
  const modelOptions =
    byok.selectedModel && !baseModelOptions.some((m) => m.value === byok.selectedModel)
      ? [{ value: byok.selectedModel, label: `${byok.selectedModel} (custom)` }, ...baseModelOptions]
      : baseModelOptions;

  const switcherSelectCls = `h-8 px-2 rounded-lg border text-[11px] font-medium focus:outline-none focus:border-[#d97757] transition-colors ${
    isLight
      ? 'bg-white text-[#575249] border-[#e2ddd3]'
      : 'bg-[#2a2723] text-[#b3ac9f] border-[#3d3831]'
  }`;

  return (
    <header className={`h-14 border-b px-3 sm:px-4 flex items-center justify-between gap-2 select-none sticky top-0 z-30 transition-colors ${
      isLight 
        ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#22201d]' 
        : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
    }`}>
      {/* Left: App Title & Sessions drawer toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenSessions}
          className={`p-1.5 rounded-lg border transition-colors ${
            isLight
              ? 'bg-white/80 hover:bg-white text-[#575249] border-[#e2ddd3]'
              : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
          }`}
          title="Open Design Sessions Drawer"
        >
          <FolderKanban className="w-4 h-4 text-[#d97757]" />
        </button>
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#d97757] flex items-center justify-center font-serif-claude font-bold text-white text-sm shadow-sm tracking-tight">
            Gia
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-serif-claude font-bold leading-tight flex items-center gap-1.5 text-inherit">
              Gia-co-Design
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-sans font-medium border ${
                isLight
                  ? 'bg-[#d97757]/10 text-[#c05a3b] border-[#d97757]/25'
                  : 'bg-[#d97757]/20 text-[#e28566] border-[#d97757]/30'
              }`}>
                Claude Style BYOK
              </span>
            </h1>
            <p className={`text-[11px] truncate max-w-[160px] ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
              {sessionTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Device Viewport Switcher */}
      <div className={`flex items-center p-1 rounded-lg border ${
        isLight ? 'bg-[#ebe6dc] border-[#ded8cc]' : 'bg-[#181715] border-[#38342e]'
      }`}>
        <button
          onClick={() => setPreviewDevice('mobile')}
          className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition-all ${
            previewDevice === 'mobile'
              ? 'bg-[#d97757] text-white shadow-sm'
              : isLight ? 'text-[#736e65] hover:text-[#22201d]' : 'text-[#9e978a] hover:text-[#f4f0ea]'
          }`}
          title="Phone Viewport (390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Phone</span>
        </button>
        <button
          onClick={() => setPreviewDevice('tablet')}
          className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition-all ${
            previewDevice === 'tablet'
              ? 'bg-[#d97757] text-white shadow-sm'
              : isLight ? 'text-[#736e65] hover:text-[#22201d]' : 'text-[#9e978a] hover:text-[#f4f0ea]'
          }`}
          title="Tablet Viewport (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tablet</span>
        </button>
        <button
          onClick={() => setPreviewDevice('desktop')}
          className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition-all ${
            previewDevice === 'desktop'
              ? 'bg-[#d97757] text-white shadow-sm'
              : isLight ? 'text-[#736e65] hover:text-[#22201d]' : 'text-[#9e978a] hover:text-[#f4f0ea]'
          }`}
          title="Desktop Viewport (100%)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Desktop</span>
        </button>
      </div>

      {/* Provider + Model Quick Switcher (desktop convenience; also always reachable via More menu) */}
      <div className="hidden lg:flex items-center gap-1.5" title="AI provider & model">
        <select
          value={byok.provider}
          onChange={(e) => onProviderChange(e.target.value as AIProvider)}
          className={switcherSelectCls}
        >
          {PROVIDER_LIST.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={byok.selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={modelsLoading}
          className={`${switcherSelectCls} max-w-[180px] truncate disabled:opacity-60`}
        >
          {modelsLoading ? (
            <option value={byok.selectedModel}>Loading models...</option>
          ) : (
            modelOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))
          )}
        </select>
        {modelsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97757]" />}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors ${
            isLight
              ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
              : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
          }`}
          title={isLight ? 'Switch to Claude Dark Theme' : 'Switch to Claude Light Paper Theme'}
        >
          {isLight ? <Moon className="w-3.5 h-3.5 text-[#d97757]" /> : <Sun className="w-3.5 h-3.5 text-[#d97757]" />}
          <span className="hidden lg:inline">{isLight ? 'Dark' : 'Light'}</span>
        </button>

        <button
          onClick={onOpenVersionHistory}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isLight
              ? 'bg-[#f0e9dd] hover:bg-[#e7dfd1] text-[#22201d] border-[#ded8cc]'
              : 'bg-[#2e2a25] hover:bg-[#38332d] text-[#f4f0ea] border-[#3d3831]'
          }`}
          title="Version history &amp; branches"
        >
          <History className="w-3.5 h-3.5 text-[#d97757]" />
          <span>History</span>
        </button>

        <button
          onClick={onOpenDesignTools}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isLight
              ? 'bg-[#f0e9dd] hover:bg-[#e7dfd1] text-[#22201d] border-[#ded8cc]'
              : 'bg-[#2e2a25] hover:bg-[#38332d] text-[#f4f0ea] border-[#3d3831]'
          }`}
          title="Design tools: tokens, accessibility, layout, multi-platform export"
        >
          <Wand2 className="w-3.5 h-3.5 text-[#d97757]" />
          <span>Tools</span>
        </button>

        <button
          onClick={onOpenDecompose}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isLight
              ? 'bg-[#f0e9dd] hover:bg-[#e7dfd1] text-[#22201d] border-[#ded8cc]'
              : 'bg-[#2e2a25] hover:bg-[#38332d] text-[#f4f0ea] border-[#3d3831]'
          }`}
          title="Decompose to multi-file UI Kit package"
        >
          <Layers className="w-3.5 h-3.5 text-[#d97757]" />
          <span>UI Kit</span>
        </button>

        <button
          onClick={onOpenDesignSystems}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            activeDesignSystemName
              ? isLight
                ? 'bg-[#d97757]/15 hover:bg-[#d97757]/25 text-[#a94a2e] border-[#d97757]/40'
                : 'bg-[#d97757]/20 hover:bg-[#d97757]/30 text-[#e28566] border-[#d97757]/50'
              : isLight
              ? 'bg-[#f0e9dd] hover:bg-[#e7dfd1] text-[#22201d] border-[#ded8cc]'
              : 'bg-[#2e2a25] hover:bg-[#38332d] text-[#f4f0ea] border-[#3d3831]'
          }`}
          title="Manage design systems / brand references"
        >
          <Palette className="w-3.5 h-3.5 text-[#d97757]" />
          <span className="max-w-[110px] truncate">
            {activeDesignSystemName ? activeDesignSystemName : 'Design System'}
          </span>
          {activeDesignSystemName && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Design system active" />
          )}
        </button>

        <button
          onClick={() => setShowCodeInspector(!showCodeInspector)}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors border ${
            showCodeInspector
              ? 'bg-[#d97757] text-white border-[#c66545]'
              : isLight
              ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
              : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
          }`}
          title="Toggle Code Inspector"
        >
          <Code2 className="w-4 h-4" />
          <span className="hidden md:inline">Code</span>
        </button>

        <button
          onClick={onOpenShare}
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isLight
              ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
              : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
          }`}
          title="Generate a portable share link for this design"
        >
          <Link2 className="w-3.5 h-3.5 text-[#d97757]" />
          <span>Share</span>
        </button>

        <button
          onClick={onOpenExport}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border flex items-center gap-1 text-xs font-medium transition-colors ${
            isLight
              ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
              : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
          }`}
          title="Export Design Files"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </button>

        <button
          onClick={onOpenSettings}
          className={`relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors border ${
            hasKey
              ? isLight
                ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
              : 'bg-[#d97757]/20 text-[#d97757] border-[#d97757]/50 animate-pulse'
          }`}
          title="Configure BYOK API Keys & Models"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
          {!hasKey && (
            <span className="w-2 h-2 rounded-full bg-[#d97757] absolute top-1 right-1" />
          )}
        </button>

        {/* More menu - the guaranteed access point for every secondary action
            on any screen size, phones included. Nothing in here should ever
            be reachable ONLY through a breakpoint-hidden inline button. */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMore((v) => !v)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showMore
                ? 'bg-[#d97757] text-white border-[#c66545]'
                : isLight
                ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
            }`}
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMore && (
            <div
              className={`absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl overflow-hidden z-40 ${
                isLight ? 'bg-[#faf8f5] border-[#e6e1d7]' : 'bg-[#22201d] border-[#38342e]'
              }`}
            >
              <div className={`px-3 py-2 border-b ${isLight ? 'border-[#e6e1d7]' : 'border-[#38342e]'}`}>
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
                  Provider & Model
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={byok.provider}
                    onChange={(e) => onProviderChange(e.target.value as AIProvider)}
                    className={`${switcherSelectCls} flex-1`}
                  >
                    {PROVIDER_LIST.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  {modelsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97757] shrink-0" />}
                </div>
                <select
                  value={byok.selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  disabled={modelsLoading}
                  className={`${switcherSelectCls} w-full mt-1.5 disabled:opacity-60`}
                >
                  {modelsLoading ? (
                    <option value={byok.selectedModel}>Loading models...</option>
                  ) : (
                    modelOptions.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))
                  )}
                </select>
              </div>
              {[
                { icon: History, label: 'Version History', onClick: onOpenVersionHistory },
                { icon: Wand2, label: 'Design Tools', onClick: onOpenDesignTools },
                { icon: LibraryBig, label: 'Component Library', onClick: onOpenComponentLibrary },
                { icon: Zap, label: activeSkillPrompt ? 'Design Skills (Active)' : 'Design Skills', onClick: onOpenSkillGallery, active: Boolean(activeSkillPrompt) },
                { icon: Layers, label: 'UI Kit (Decompose)', onClick: onOpenDecompose },
                {
                  icon: Palette,
                  label: activeDesignSystemName ? activeDesignSystemName : 'Design System',
                  onClick: onOpenDesignSystems,
                  active: Boolean(activeDesignSystemName),
                },
                { icon: Terminal, label: showTerminal ? 'Hide Terminal' : 'Terminal', onClick: onToggleTerminal, active: showTerminal },
                { icon: Link2, label: 'Share', onClick: onOpenShare },
              ].map(({ icon: Icon, label, onClick, active }) => (
                <button
                  key={label}
                  onClick={() => { onClick(); setShowMore(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-left transition-colors ${
                    isLight ? 'hover:bg-[#f0e9dd] text-[#22201d]' : 'hover:bg-[#2e2a25] text-[#f4f0ea]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#d97757] shrink-0" />
                  <span className="truncate flex-1">{label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

