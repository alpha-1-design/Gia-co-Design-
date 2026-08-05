import React, { useState } from 'react';
import { Layers, X, CheckCircle2, XCircle, FileCode, Sparkles, RefreshCw } from 'lucide-react';
import { UIKitDecomposition, BYOKConfig } from '../types';
import { decomposeToUIKit } from '../lib/ai';

interface DecomposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeHtml: string;
  byok: BYOKConfig;
  uiKit?: UIKitDecomposition;
  onUIKitGenerated: (kit: UIKitDecomposition) => void;
  theme?: 'light' | 'dark';
}

export const DecomposeModal: React.FC<DecomposeModalProps> = ({
  isOpen,
  onClose,
  codeHtml,
  byok,
  uiKit,
  onUIKitGenerated,
  theme = 'light',
}) => {
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleDecompose = async () => {
    setIsDecomposing(true);
    setErrorMsg('');
    try {
      const kit = await decomposeToUIKit(codeHtml, byok, 'mobile-app-ui-kit');
      onUIKitGenerated(kit);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to decompose UI Kit.');
    } finally {
      setIsDecomposing(false);
    }
  };

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
            <div className="p-2 rounded-lg bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif-claude font-bold leading-tight">Decompose to UI Kit</h2>
              <p className={`text-xs ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                Transforms monolithic designs into structured <code className="text-[#d97757]">ui_kits/&lt;slug&gt;/</code> folders
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm">
          {!uiKit ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#d97757]/15 border border-[#d97757]/30 flex items-center justify-center mx-auto text-[#d97757]">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif-claude font-bold">Generate Structured Component Suite</h3>
                <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Decomposes layout into modular React TSX components, CSS tokens file, manifest.json, and validates design system parity.
                </p>
              </div>
              {errorMsg && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">{errorMsg}</p>}
              <button
                onClick={handleDecompose}
                disabled={isDecomposing}
                className="px-6 py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white font-semibold text-xs transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isDecomposing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Decomposing Components...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Decompose Monolith Now</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Parity Meter Header */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isLight ? 'bg-white border-[#ded8cc]' : 'bg-[#181715] border-[#38342e]'
              }`}>
                <div>
                  <span className={`text-xs uppercase font-semibold block ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                    UI Kit Parity Score
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-[#d97757]">
                      {(uiKit.parityScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 font-bold">
                      {uiKit.parityChecks.filter(c => c.passed).length} / 12 Checks Passed
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDecompose}
                  disabled={isDecomposing}
                  className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isLight ? 'bg-[#f4f0e8] hover:bg-[#ebe6dc] border-[#ded8cc] text-[#22201d]' : 'bg-[#2a2723] hover:bg-[#332f2a] border-[#3d3831] text-[#f4f0ea]'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDecomposing ? 'animate-spin' : ''}`} />
                  <span>Re-verify Parity</span>
                </button>
              </div>

              {/* 12-Check Boolean Rubric Grid */}
              <div className="space-y-2">
                <span className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
                  12-Question Boolean Parity Rubric
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uiKit.parityChecks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 text-xs ${
                        isLight ? 'bg-white border-[#ded8cc]' : 'bg-[#181715] border-[#38342e]'
                      }`}
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold block">{check.label}</span>
                        <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>{check.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-File Tree Output */}
              <div className="space-y-2">
                <span className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
                  Generated Kit Files ({uiKit.files.length})
                </span>
                <div className={`divide-y border rounded-xl overflow-hidden text-xs ${
                  isLight ? 'bg-white border-[#ded8cc] divide-[#e6e1d7]' : 'bg-[#181715] border-[#38342e] divide-[#38342e]'
                }`}>
                  {uiKit.files.map((file) => (
                    <div key={file.path} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#d97757]" />
                        <span className="font-mono-claude">{file.path}</span>
                      </div>
                      <span className={`text-[11px] font-mono-claude ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                        {(file.content.length / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

