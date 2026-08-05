import React, { useState, useRef } from 'react';
import { 
  Pin, 
  SlidersHorizontal, 
  RotateCw, 
  X, 
  CheckCircle2
} from 'lucide-react';
import { PreviewDevice, PinComment } from '../types';

interface PreviewCanvasProps {
  codeHtml: string;
  previewDevice: PreviewDevice;
  pins: PinComment[];
  onAddPin: (pin: Omit<PinComment, 'id' | 'createdAt'>) => void;
  onResolvePin: (id: string) => void;
  onTweakPrompt: (tweakPrompt: string) => void;
  isGenerating: boolean;
  theme?: 'light' | 'dark';
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  codeHtml,
  previewDevice,
  pins,
  onAddPin,
  onResolvePin,
  onTweakPrompt,
  isGenerating,
  theme = 'light',
}) => {
  const [isPinMode, setIsPinMode] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);
  const [newPinPos, setNewPinPos] = useState<{ x: number; y: number } | null>(null);
  const [pinCommentText, setPinCommentText] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewPinPos({ x, y });
  };

  const handleSavePin = () => {
    if (!newPinPos || !pinCommentText.trim()) return;
    onAddPin({
      x: newPinPos.x,
      y: newPinPos.y,
      comment: pinCommentText.trim(),
      resolved: false,
    });
    setNewPinPos(null);
    setPinCommentText('');
    setIsPinMode(false);
  };

  // Viewport Container Widths & Styles
  const getDeviceStyle = () => {
    switch (previewDevice) {
      case 'mobile':
        return `w-[390px] h-[812px] max-h-[85vh] rounded-[40px] border-[10px] ${
          isLight ? 'border-[#38342e]' : 'border-[#2a2723]'
        } shadow-2xl relative overflow-hidden bg-white`;
      case 'tablet':
        return `w-[768px] h-[900px] max-h-[85vh] rounded-2xl border-8 ${
          isLight ? 'border-[#38342e]' : 'border-[#2a2723]'
        } shadow-2xl relative overflow-hidden bg-white`;
      case 'desktop':
      default:
        return `w-full h-full min-h-[600px] rounded-xl border ${
          isLight ? 'border-[#ded8cc]' : 'border-[#38342e]'
        } shadow-lg relative overflow-hidden bg-white`;
    }
  };

  const quickTweaks = [
    { label: 'Switch to Dark Theme', prompt: 'Convert the overall design to a dark theme with warm terracotta accents' },
    { label: 'Increase Padding & Spacing', prompt: 'Make padding and spacing generous, modern, and aligned' },
    { label: 'Rounded Corners (16px)', prompt: 'Apply 16px rounded corners (rounded-2xl) to all cards and controls' },
    { label: 'Add Search & Filter Bar', prompt: 'Add a sticky search input and category filter chips at the top' },
  ];

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${
      isLight ? 'bg-[#faf8f5]' : 'bg-[#181715]'
    }`}>
      {/* Canvas Controls Header */}
      <div className={`h-11 border-b px-4 flex items-center justify-between z-20 shrink-0 ${
        isLight ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className="flex items-center gap-2">
          {/* Pin Mode Button */}
          <button
            onClick={() => {
              setIsPinMode(!isPinMode);
              setNewPinPos(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isPinMode
                ? 'bg-[#d97757] text-white border-[#c66545] shadow-md animate-pulse'
                : isLight
                ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{isPinMode ? 'Click Canvas to Drop Pin' : 'Comment Pin Mode'}</span>
          </button>

          {/* Quick Tweak Toolbar */}
          <button
            onClick={() => setShowTweaks(!showTweaks)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              showTweaks
                ? 'bg-[#d97757] text-white border-[#c66545]'
                : isLight
                ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tweak Palette</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
              isLight
                ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
            }`}
            title="Reload Preview Frame"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Tweak Drawer Overlay */}
      {showTweaks && (
        <div className={`p-3 border-b z-20 flex flex-wrap items-center gap-2 animate-in slide-in-from-top-2 duration-150 ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#22201d] border-[#38342e]'
        }`}>
          <span className="text-xs font-serif-claude font-bold text-[#d97757] uppercase tracking-wider block mr-2">
            One-Click Tweaks:
          </span>
          {quickTweaks.map((tw) => (
            <button
              key={tw.label}
              onClick={() => {
                onTweakPrompt(tw.prompt);
                setShowTweaks(false);
              }}
              disabled={isGenerating}
              className={`px-2.5 py-1 rounded-lg text-xs border font-medium transition-all disabled:opacity-50 ${
                isLight
                  ? 'bg-white hover:bg-[#d97757] hover:text-white text-[#575249] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#d97757] hover:text-white text-[#b3ac9f] border-[#3d3831]'
              }`}
            >
              {tw.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Preview Stage Area */}
      <div className={`flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative ${
        isLight
          ? 'bg-[radial-gradient(#d6cfc4_1px,transparent_1px)] [background-size:16px_16px]'
          : 'bg-[radial-gradient(#38342e_1px,transparent_1px)] [background-size:16px_16px]'
      }`}>
        {/* Phone Frame Device Shell */}
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          className={`${getDeviceStyle()} transition-all duration-300 ${
            isPinMode ? 'cursor-crosshair ring-2 ring-[#d97757]' : ''
          }`}
        >
          {/* Phone Speaker Notch Bar for Mobile Frame */}
          {previewDevice === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#2a2723] rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-10 h-1 bg-[#3d3831] rounded-full" />
            </div>
          )}

          {/* Code Iframe */}
          <iframe
            key={iframeKey}
            srcDoc={codeHtml}
            title="Design Preview"
            className="w-full h-full border-none bg-white pointer-events-auto"
            sandbox="allow-scripts allow-modals allow-same-origin"
          />

          {/* Active Pin Overlay Markers */}
          {pins.map((pin, idx) => (
            <div
              key={pin.id}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
            >
              <div className="w-6 h-6 rounded-full bg-[#d97757] text-white font-extrabold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer animate-bounce">
                {idx + 1}
              </div>
              {/* Pin Tooltip */}
              <div className={`hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-xl border text-xs shadow-xl z-30 pointer-events-auto ${
                isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
              }`}>
                <p className="font-semibold text-[#d97757]">Pin #{idx + 1}</p>
                <p className="text-[11px] mt-0.5">{pin.comment}</p>
                <button
                  onClick={() => onResolvePin(pin.id)}
                  className="mt-1.5 text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Mark Resolved
                </button>
              </div>
            </div>
          ))}

          {/* New Pin Comment Popup Dialog */}
          {newPinPos && (
            <div
              style={{ left: `${Math.min(newPinPos.x, 70)}%`, top: `${Math.min(newPinPos.y, 70)}%` }}
              className={`absolute z-30 w-64 p-3 rounded-xl border shadow-2xl space-y-2 text-xs ${
                isLight ? 'bg-white border-[#d97757]' : 'bg-[#22201d] border-[#d97757]'
              }`}
            >
              <div className="flex items-center justify-between text-[#d97757] font-bold">
                <span className="flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5" /> Drop Pin Comment
                </span>
                <button onClick={() => setNewPinPos(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={pinCommentText}
                onChange={(e) => setPinCommentText(e.target.value)}
                placeholder="What should be changed at this exact spot?"
                className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:border-[#d97757] resize-none ${
                  isLight
                    ? 'bg-[#faf8f5] border-[#ded8cc] text-[#22201d]'
                    : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
              <button
                onClick={handleSavePin}
                className="w-full py-1.5 bg-[#d97757] text-white font-bold rounded-lg hover:bg-[#c66545] transition-colors"
              >
                Attach Pin & Prompt Region
              </button>
            </div>
          )}

          {/* Home Bar Indicator for Mobile Frame */}
          {previewDevice === 'mobile' && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#3d3831] rounded-full z-20" />
          )}
        </div>
      </div>
    </div>
  );
};

