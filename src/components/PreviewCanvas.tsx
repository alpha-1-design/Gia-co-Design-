import React, { useState, useRef, useEffect } from 'react';
import { 
  Pin, 
  SlidersHorizontal, 
  RotateCw, 
  X, 
  CheckCircle2,
  MousePointerClick,
  Check,
  Wand2,
  Sparkles
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
  directions?: string[];
  activeDirection?: number;
  onSelectDirection?: (index: number) => void;
  onUpdateCode?: (html: string) => void;
  onCritique?: () => void;
  isCritiquing?: boolean;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

interface EditInfo {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface StyleValues {
  padding: string;
  fontSize: string;
  borderRadius: string;
  backgroundColor: string;
  color: string;
}

function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const toHex = (n: number) => Number(n).toString(16).padStart(2, '0');
  return `#${toHex(+m[1])}${toHex(+m[2])}${toHex(+m[3])}`;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  codeHtml,
  previewDevice,
  pins,
  onAddPin,
  onResolvePin,
  onTweakPrompt,
  isGenerating,
  directions,
  activeDirection = 0,
  onSelectDirection,
  onUpdateCode,
  onCritique,
  isCritiquing,
  readOnly,
  theme = 'light',
}) => {
  const [isPinMode, setIsPinMode] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);
  const [newPinPos, setNewPinPos] = useState<{ x: number; y: number } | null>(null);
  const [pinCommentText, setPinCommentText] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState<EditInfo | null>(null);
  const [styleValues, setStyleValues] = useState<StyleValues>({
    padding: '0px',
    fontSize: '16px',
    borderRadius: '0px',
    backgroundColor: '#ffffff',
    color: '#000000',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editElRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
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

  // --- Direct Canvas Edit Mode ---
  const getEditDoc = (): Document | null => {
    const iframeEl = iframeRef.current;
    if (!iframeEl || !iframeEl.contentDocument) return null;
    return iframeEl.contentDocument;
  };

  const updateEditInfo = () => {
    const el = editElRef.current;
    const frame = containerRef.current;
    if (!el || !frame) return;
    const r = el.getBoundingClientRect();
    const f = frame.getBoundingClientRect();
    setEditInfo({
      name: el.tagName.toLowerCase() + (el.className ? ` .${String(el.className).split(' ').slice(0, 2).join('.')}` : ''),
      x: r.left - f.left,
      y: r.top - f.top,
      w: r.width,
      h: r.height,
    });
  };

  const initStyleValues = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    setStyleValues({
      padding: `${Math.round(parseFloat(cs.padding) || 0)}px`,
      fontSize: `${Math.round(parseFloat(cs.fontSize) || 16)}px`,
      borderRadius: `${Math.round(parseFloat(cs.borderRadius) || 0)}px`,
      backgroundColor: rgbToHex(cs.backgroundColor) || '#ffffff',
      color: rgbToHex(cs.color) || '#000000',
    });
  };

  const clearEditSelection = () => {
    const el = editElRef.current;
    if (el) {
      el.removeAttribute('data-gia-selected');
      el.style.outline = '';
      el.style.outlineOffset = '';
    }
    editElRef.current = null;
    dragRef.current = null;
    setEditInfo(null);
  };

  const selectElement = (el: HTMLElement) => {
    clearEditSelection();
    editElRef.current = el;
    el.setAttribute('data-gia-selected', 'true');
    el.style.outline = '2px solid #d97757';
    el.style.outlineOffset = '2px';
    initStyleValues(el);
    updateEditInfo();
  };

  const applyStyle = (prop: keyof StyleValues, value: string) => {
    const el = editElRef.current;
    if (!el) return;
    el.style[prop] = value;
    setStyleValues((prev) => ({ ...prev, [prop]: value }));
    updateEditInfo();
  };

  const syncEditsToCode = () => {
    const doc = getEditDoc();
    if (!doc || !onUpdateCode) return;
    clearEditSelection();
    const html = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
    onUpdateCode(html);
    setIsEditMode(false);
  };

  useEffect(() => {
    if (!isEditMode) return;
    const doc = getEditDoc();
    if (!doc) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const el = target.closest?.(
        'div,p,button,a,input,textarea,span,h1,h2,h3,h4,h5,section,header,footer,nav,main,form,ul,ol,li,img,svg,label,select'
      ) as HTMLElement | null;
      if (!el) return;
      selectElement(el);
      const r = el.getBoundingClientRect();
      dragRef.current = { startX: e.clientX, startY: e.clientY, origLeft: r.left, origTop: r.top };
    };

    const onMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      const el = editElRef.current;
      if (!d || !el) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      el.style.position = 'relative';
      el.style.left = `${Math.round(d.origLeft + dx)}px`;
      el.style.top = `${Math.round(d.origTop + dy)}px`;
      updateEditInfo();
    };

    const onMouseUp = () => {
      dragRef.current = null;
    };

    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    doc.addEventListener('mousedown', onMouseDown, { capture: true });
    doc.addEventListener('mousemove', onMouseMove, { capture: true });
    doc.addEventListener('mouseup', onMouseUp, { capture: true });
    doc.addEventListener('click', onClick, { capture: true });

    return () => {
      doc.removeEventListener('mousedown', onMouseDown, { capture: true });
      doc.removeEventListener('mousemove', onMouseMove, { capture: true });
      doc.removeEventListener('mouseup', onMouseUp, { capture: true });
      doc.removeEventListener('click', onClick, { capture: true });
    };
  }, [isEditMode]);

  const toggleEditMode = () => {
    if (isEditMode) {
      clearEditSelection();
      setIsEditMode(false);
    } else {
      setIsPinMode(false);
      setNewPinPos(null);
      setEditInfo(null);
      setIsEditMode(true);
    }
  };

  // Viewport Container Widths & Styles
  const getDeviceStyle = () => {
    switch (previewDevice) {
      case 'mobile':
        return `w-[min(390px,100%)] h-[min(812px,80vh)] rounded-[40px] border-[10px] ${
          isLight ? 'border-[#38342e]' : 'border-[#2a2723]'
        } shadow-2xl relative overflow-hidden bg-white`;
      case 'tablet':
        return `w-[min(768px,100%)] h-[min(900px,80vh)] rounded-2xl border-8 ${
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
      <div className={`h-11 border-b px-4 flex items-center justify-between gap-2 z-20 shrink-0 ${
        isLight ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className="flex items-center gap-2 overflow-x-auto min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Pin Mode Button */}
          {/* Comment Pin Mode Button */}
          {!readOnly && (
            <button
              onClick={() => {
                setIsPinMode(!isPinMode);
                setNewPinPos(null);
                if (!isPinMode) {
                  clearEditSelection();
                  setIsEditMode(false);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isPinMode
                  ? 'bg-[#d97757] text-white border-[#c66545] shadow-md animate-pulse'
                  : isLight
                  ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
              }`}
              title="Drop a pinned comment on the design"
            >
              <Pin className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{isPinMode ? 'Click Canvas to Drop Pin' : 'Comment Pin Mode'}</span>
            </button>
          )}

          {/* Direct Edit Mode Button */}
          {!readOnly && (
            <button
              onClick={toggleEditMode}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isEditMode
                  ? 'bg-[#d97757] text-white border-[#c66545] shadow-md animate-pulse'
                  : isLight
                  ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
              }`}
              title="Click elements to drag them or tune spacing/color, then sync to code"
            >
              <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{isEditMode ? 'Click Canvas to Select' : 'Direct Edit'}</span>
            </button>
          )}

          {/* Quick Tweak Toolbar */}
          {!readOnly && (
            <button
              onClick={() => setShowTweaks(!showTweaks)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                showTweaks
                  ? 'bg-[#d97757] text-white border-[#c66545]'
                  : isLight
                  ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
              }`}
              title="Quick style tweaks"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Tweak Palette</span>
            </button>
          )}

          {/* AI Critique Button */}
          {onCritique && (
            <button
              onClick={onCritique}
              disabled={isCritiquing}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border disabled:opacity-50 ${
                isLight
                  ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
              }`}
              title="Run an AI accessibility & design quality audit"
            >
              {isCritiquing ? (
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-[#d97757]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#d97757]" />
              )}
              <span className="hidden sm:inline">{isCritiquing ? 'Auditing...' : 'Critique'}</span>
            </button>
          )}
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

      {/* Direction Tabs */}
      {directions && directions.length > 1 && (
        <div className={`h-11 px-4 border-b flex items-center gap-2 z-20 shrink-0 overflow-x-auto ${
          isLight ? 'bg-[#ebe6dc]/80 border-[#e6e1d7]' : 'bg-[#1b1a17]/60 border-[#38342e]'
        }`}>
          <span className="text-[11px] font-serif-claude font-bold text-[#d97757] uppercase tracking-wider shrink-0 mr-1">
            Directions
          </span>
          {directions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDirection?.(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                activeDirection === idx
                  ? 'bg-[#d97757] text-white border-[#c66545] shadow-md'
                  : isLight
                  ? 'bg-white hover:bg-[#f7f4ec] text-[#575249] border-[#e2ddd3]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border-[#3d3831]'
              }`}
            >
              Direction {idx + 1}
            </button>
          ))}
        </div>
      )}

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
            ref={iframeRef}
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

          {/* Direct Edit Toolbar */}
          {isEditMode && editInfo && (
            (() => {
              const frame = containerRef.current;
              const frameRect = frame ? frame.getBoundingClientRect() : null;
              const frameH = frameRect?.height ?? 800;
              const frameW = frameRect?.width ?? 400;
              const toolbarTop = Math.min(editInfo.y + editInfo.h + 8, Math.max(0, frameH - 260));
              const toolbarLeft = Math.max(0, Math.min(editInfo.x, frameW - 224));
              return (
                <div
                  style={{ left: toolbarLeft, top: toolbarTop }}
                  className={`absolute z-40 w-56 p-3 rounded-xl border shadow-2xl space-y-2.5 text-xs ${
                    isLight ? 'bg-white border-[#d97757]' : 'bg-[#22201d] border-[#d97757]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-[#d97757]">
                      <Wand2 className="w-3.5 h-3.5" />
                      <span className="font-mono truncate">{editInfo.name}</span>
                    </span>
                    <button onClick={clearEditSelection} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-[#736e65] dark:text-[#9e978a]">
                      <span>Padding</span><span className="font-mono">{styleValues.padding}</span>
                    </div>
                    <input type="range" min={0} max={80} value={parseInt(styleValues.padding, 10)}
                      onChange={(e) => applyStyle('padding', `${e.target.value}px`)} className="w-full" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-[#736e65] dark:text-[#9e978a]">
                      <span>Font Size</span><span className="font-mono">{styleValues.fontSize}</span>
                    </div>
                    <input type="range" min={8} max={64} value={parseInt(styleValues.fontSize, 10)}
                      onChange={(e) => applyStyle('fontSize', `${e.target.value}px`)} className="w-full" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-[#736e65] dark:text-[#9e978a]">
                      <span>Corner Radius</span><span className="font-mono">{styleValues.borderRadius}</span>
                    </div>
                    <input type="range" min={0} max={48} value={parseInt(styleValues.borderRadius, 10)}
                      onChange={(e) => applyStyle('borderRadius', `${e.target.value}px`)} className="w-full" />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[10px] font-semibold text-[#736e65] dark:text-[#9e978a]">Background</span>
                    <input type="color" value={styleValues.backgroundColor}
                      onChange={(e) => applyStyle('backgroundColor', e.target.value)} className="w-12 h-6 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-[#736e65] dark:text-[#9e978a]">Text Color</span>
                    <input type="color" value={styleValues.color}
                      onChange={(e) => applyStyle('color', e.target.value)} className="w-12 h-6 rounded cursor-pointer" />
                  </div>

                  <p className="text-[10px] text-[#9e978a] leading-snug">
                    Drag element to move. Sliders update the live preview.
                  </p>

                  <button
                    onClick={syncEditsToCode}
                    className="w-full py-1.5 bg-[#d97757] hover:bg-[#c66545] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Sync to Code
                  </button>
                </div>
              );
            })()
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

