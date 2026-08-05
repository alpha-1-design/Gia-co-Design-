import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Layers, 
  User, 
  Image as ImageIcon, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { DesignTurn } from '../types';

interface PromptSidebarProps {
  turns: DesignTurn[];
  activeTurnIndex: number;
  onSelectTurn: (index: number) => void;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  onDecompose: () => void;
  tokenCount: number;
  theme?: 'light' | 'dark';
}

export const PromptSidebar: React.FC<PromptSidebarProps> = ({
  turns,
  activeTurnIndex,
  onSelectTurn,
  onGenerate,
  isGenerating,
  onDecompose,
  tokenCount,
  theme = 'light',
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const isLight = theme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;
    onGenerate(inputPrompt.trim());
    setInputPrompt('');
  };

  const quickPills = [
    'Create Mobile Dashboard',
    'Add Floating Action Button',
    'Convert to Dark Theme',
    'Add Contact Form & Inputs',
  ];

  return (
    <aside className={`w-full lg:w-80 xl:w-96 border-r flex flex-col h-full shrink-0 overflow-hidden select-none transition-colors ${
      isLight 
        ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#22201d]' 
        : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
    }`}>
      {/* Sidebar Header */}
      <div className={`p-3.5 border-b flex items-center justify-between ${
        isLight ? 'bg-[#ebe6dc]/80 border-[#e6e1d7]' : 'bg-[#1b1a17]/60 border-[#38342e]'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d97757]" />
          <span className="text-xs font-serif-claude font-bold tracking-wide text-inherit">
            Agentic Prompt Loop
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono border ${
            isLight
              ? 'bg-white/80 text-[#736e65] border-[#ded8cc]'
              : 'bg-[#2a2723] text-[#9e978a] border-[#3d3831]'
          }`}>
            ~{tokenCount} tokens
          </span>
        </div>
      </div>

      {/* History Toggle Bar */}
      <div className={`px-3.5 py-2 border-b flex items-center justify-between text-xs ${
        isLight ? 'bg-[#f7f4ec]/50 border-[#e6e1d7] text-[#736e65]' : 'bg-[#181715]/40 border-[#38342e] text-[#9e978a]'
      }`}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 hover:text-[#d97757] transition-colors font-medium"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#d97757]" />
          <span>Design History ({turns.length} turns)</span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onDecompose}
          className="text-[#d97757] hover:text-[#c66545] font-medium flex items-center gap-1 text-[11px]"
        >
          <Layers className="w-3 h-3" />
          <span>Decompose UI Kit</span>
        </button>
      </div>

      {/* History List or Active Turn View */}
      {showHistory ? (
        <div className={`flex-1 overflow-y-auto p-3 space-y-2 ${
          isLight ? 'bg-[#faf8f5]/60' : 'bg-[#181715]/30'
        }`}>
          {turns.map((turn, idx) => (
            <div
              key={turn.id}
              onClick={() => {
                onSelectTurn(idx);
                setShowHistory(false);
              }}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                idx === activeTurnIndex
                  ? isLight
                    ? 'bg-[#d97757]/10 border-[#d97757] text-[#22201d]'
                    : 'bg-[#d97757]/20 border-[#d97757] text-white'
                  : isLight
                  ? 'bg-white hover:bg-[#f7f4ec] border-[#e6e1d7] text-[#575249]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] border-[#3d3831] text-[#c4bdae]'
              }`}
            >
              <div className={`flex items-center justify-between mb-1 text-[11px] ${
                isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
              }`}>
                <span className="font-semibold text-inherit">Turn #{idx + 1}</span>
                <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="line-clamp-2 font-medium text-inherit">{turn.prompt}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Recent Prompt Card */}
          {turns[activeTurnIndex] && (
            <div className="space-y-3">
              <div className={`p-3.5 rounded-2xl border space-y-2 shadow-sm ${
                isLight 
                  ? 'bg-white border-[#e6e1d7] text-[#22201d]' 
                  : 'bg-[#2a2723] border-[#3d3831] text-[#f4f0ea]'
              }`}>
                <div className={`flex items-center justify-between text-[11px] ${
                  isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
                }`}>
                  <span className="flex items-center gap-1 font-semibold text-[#d97757]">
                    <User className="w-3.5 h-3.5" />
                    Active Version #{activeTurnIndex + 1}
                  </span>
                  <span className="font-mono text-[10px]">{turns[activeTurnIndex].modelUsed}</span>
                </div>
                <p className="text-xs font-serif-claude text-inherit font-medium leading-relaxed italic">
                  "{turns[activeTurnIndex].prompt}"
                </p>
              </div>

              {turns[activeTurnIndex].pins && turns[activeTurnIndex].pins!.length > 0 && (
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  isLight
                    ? 'bg-[#fef3c7]/60 border-[#f59e0b]/40 text-[#92400e]'
                    : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                }`}>
                  <span className="font-semibold block">
                    Active Pin Comments ({turns[activeTurnIndex].pins!.length})
                  </span>
                  {turns[activeTurnIndex].pins!.map((p, pIdx) => (
                    <div key={p.id} className="text-[11px] pl-2 border-l border-amber-500/50">
                      Pin #{pIdx + 1}: "{p.comment}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Action Pills */}
          <div className="space-y-2 pt-2">
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isLight ? 'text-[#827c70]' : 'text-[#8c8577]'
            }`}>
              Quick Enhancements
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => onGenerate(pill)}
                  disabled={isGenerating}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                    isLight
                      ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                      : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border-[#3d3831]'
                  }`}
                >
                  + {pill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Prompt Form */}
      <form onSubmit={handleSubmit} className={`p-3.5 border-t space-y-2.5 ${
        isLight ? 'bg-[#ebe6dc]/60 border-[#e6e1d7]' : 'bg-[#1b1a17]/70 border-[#38342e]'
      }`}>
        <div className="relative">
          <textarea
            rows={3}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Describe your design or tweak in natural language..."
            className={`w-full px-3.5 py-2.5 pr-10 rounded-2xl border text-xs leading-relaxed resize-none transition-all ${
              isLight
                ? 'bg-white border-[#ded8cc] focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] text-[#22201d] placeholder-[#9e978a]'
                : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] text-[#f4f0ea] placeholder-[#736e65]'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-3 bottom-3.5 flex items-center gap-1.5 text-[#9e978a]">
            <button
              type="button"
              className="p-1 hover:text-[#d97757] transition-colors"
              title="Attach Wireframe / Screenshot"
              onClick={() => alert('Image/Wireframe Attachment: Mention details in your prompt.')}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
            Press <kbd className={`px-1 py-0.5 rounded font-mono text-[9px] ${
              isLight ? 'bg-[#e2ddd3]' : 'bg-[#2a2723]'
            }`}>Enter</kbd> to generate
          </span>
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Designing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </form>
    </aside>
  );
};

