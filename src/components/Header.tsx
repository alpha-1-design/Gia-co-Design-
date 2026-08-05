import React from 'react';
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
  Moon
} from 'lucide-react';
import { PreviewDevice, BYOKConfig } from '../types';

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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}) => {
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
          onClick={onOpenDecompose}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
      </div>
    </header>
  );
};

