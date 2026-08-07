import React, { useState } from 'react';
import { X, Link2, Check, Loader2, Copy, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildLink: () => Promise<string>;
  theme?: 'light' | 'dark';
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onBuildLink, theme = 'light' }) => {
  const [link, setLink] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleBuild = async () => {
    setIsBuilding(true);
    setError(null);
    try {
      const built = await onBuildLink();
      if (!built) throw new Error('Could not build share link.');
      setLink(built);
    } catch (e: any) {
      setError(e.message || 'Failed to build share link.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: 'Gia-co-Design', text: 'Check out this design', url: link });
    } catch {
      // User cancelled the share sheet, or it's unsupported despite the
      // feature check - either way, silently fall through. Copy is still
      // right there as the reliable fallback.
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Share This Design</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <p className="text-xs leading-relaxed opacity-80">
            Generate a portable link that captures the full design (all versions, directions, pins, and code).
            Anyone who opens the link on a device running Gia-co-Design sees this exact design in read-only view
            — no backend or accounts needed.
          </p>

          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            isLight ? 'bg-amber-500/10 border-amber-500/30 text-amber-800' : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
          }`}>
            <Copy className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>The link is embedded in the URL itself. Very large designs produce long links — that is expected.</span>
          </div>

          {!link && !isBuilding && (
            <button
              onClick={handleBuild}
              className="w-full py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              Generate Share Link
            </button>
          )}

          {isBuilding && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#9e978a] font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-[#d97757]" />
              Compressing design into a portable link...
            </div>
          )}

          {link && (
            <div className="space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
                Share Link
              </label>
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#d97757] hover:bg-[#c66545] text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share via...
                </button>
              )}
              <div className={`flex items-center gap-2 p-2 rounded-xl border ${
                isLight ? 'bg-white border-[#e2ddd3]' : 'bg-[#2a2723] border-[#3d3831]'
              }`}>
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 bg-transparent text-[11px] font-mono leading-relaxed focus:outline-none min-w-0"
                />
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : isLight
                      ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border border-[#e2ddd3]'
                      : 'bg-[#332f2a] hover:bg-[#3d3831] text-[#f4f0ea] border border-[#3d3831]'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {canNativeShare && (
                <p className={`text-[11px] ${isLight ? 'text-[#9e978a]' : 'text-[#736e65]'}`}>
                  "Share via..." opens your device's share sheet - you won't see the raw link there, just app icons to send it through.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-[11px] text-amber-600 font-mono">⚠️ {error}</p>}
        </div>
      </div>
    </div>
  );
};
