import React from 'react';
import { X, AlertTriangle, AlertCircle, Lightbulb, Sparkles, Wand2 } from 'lucide-react';
import { DesignCritique, CritiqueFinding } from '../types';

interface CritiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  critique: DesignCritique | null;
  isCritiquing: boolean;
  onFixWithAI: () => void;
  theme?: 'light' | 'dark';
}

const severityMeta: Record<CritiqueFinding['severity'], { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  error: { label: 'Error', icon: AlertCircle, cls: 'text-red-500', dot: 'bg-red-500' },
  warning: { label: 'Warning', icon: AlertTriangle, cls: 'text-amber-500', dot: 'bg-amber-500' },
  suggestion: { label: 'Suggestion', icon: Lightbulb, cls: 'text-sky-500', dot: 'bg-sky-500' },
};

export const CritiqueModal: React.FC<CritiqueModalProps> = ({
  isOpen,
  onClose,
  critique,
  isCritiquing,
  onFixWithAI,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">AI Design Critique</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          {isCritiquing && !critique && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Sparkles className="w-8 h-8 text-[#d97757] animate-pulse" />
              <span className="text-xs font-mono text-[#9e978a]">Auditing accessibility, contrast, hierarchy, responsiveness...</span>
            </div>
          )}

          {critique && (
            <>
              {/* Score + Summary */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                isLight ? 'bg-white border-[#e6e1d7]' : 'bg-[#2a2723] border-[#3d3831]'
              }`}>
                <div className="shrink-0">
                  <div className={`text-4xl font-serif-claude font-bold ${scoreColor(critique.score)}`}>{critique.score}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#9e978a] font-semibold mt-0.5">/ 100</div>
                </div>
                <div className="flex-1">
                  <p className="text-xs leading-relaxed text-inherit">{critique.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLight ? 'bg-[#d97757]/10 text-[#a94a2e] border-[#d97757]/30' : 'bg-[#d97757]/20 text-[#e28566] border-[#d97757]/50'
                    }`}>
                      {critique.findings.filter((f) => f.severity === 'error').length} errors
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLight ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    }`}>
                      {critique.findings.filter((f) => f.severity === 'warning').length} warnings
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLight ? 'bg-sky-500/10 text-sky-700 border-sky-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    }`}>
                      {critique.findings.filter((f) => f.severity === 'suggestion').length} suggestions
                    </span>
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="space-y-2">
                {critique.findings.map((f, idx) => {
                  const meta = severityMeta[f.severity];
                  const Icon = meta.icon;
                  return (
                    <div key={idx} className={`p-3 rounded-xl border ${
                      isLight ? 'bg-white border-[#e6e1d7]' : 'bg-[#2a2723] border-[#3d3831]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <Icon className={`w-3.5 h-3.5 ${meta.cls}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.cls}`}>{meta.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-semibold text-[#9e978a]">{f.category}</span>
                      </div>
                      <p className="text-xs font-semibold mt-1.5 text-inherit">{f.title}</p>
                      <p className="text-[11px] mt-1 leading-relaxed text-inherit opacity-80">{f.detail}</p>
                      {f.fix && (
                        <p className="text-[11px] mt-1.5 leading-relaxed text-[#d97757] font-medium">
                          Fix: {f.fix}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className={`px-5 py-3.5 border-t flex items-center justify-between ${
          isLight ? 'border-[#e6e1d7]' : 'border-[#38342e]'
        }`}>
          <span className={`text-[10px] font-mono ${isLight ? 'text-[#9e978a]' : 'text-[#736e65]'}`}>
            {critique ? `~${critique.tokensUsed} tokens · ${new Date(critique.generatedAt).toLocaleTimeString()}` : ' '}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onFixWithAI}
              disabled={isCritiquing}
              className="px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Fix with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
