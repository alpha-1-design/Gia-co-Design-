import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Layers, 
  User, 
  Image as ImageIcon, 
  RefreshCw, 
  LayoutGrid,
  Plus,
  X,
  Pin as PinIcon,
  Bot,
} from 'lucide-react';
import { DesignTurn, ImageAttachment } from '../types';
import { VisualLibraryPanel } from './VisualLibraryPanel';

interface PromptSidebarProps {
  turns: DesignTurn[];
  activeTurnIndex: number;
  onSelectTurn: (index: number) => void;
  onGenerate: (prompt: string, imageDataUrl?: string) => Promise<void>;
  isGenerating: boolean;
  onDecompose: () => void;
  tokenCount: number;
  variantCount: number;
  onVariantCountChange: (count: number) => void;
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
  variantCount,
  onVariantCountChange,
  theme = 'light',
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'patterns'>('chat');
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (sidebarTab === 'chat' && typeof feedEndRef.current?.scrollIntoView === 'function') {
      try {
        feedEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch {
        // Non-fatal - worst case the feed just doesn't auto-scroll
      }
    }
  }, [turns.length, sidebarTab]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read image file'));
      reader.readAsDataURL(file);
    });

  const addAttachment = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (attachments.length >= 1) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAttachments([
        {
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          dataUrl,
          mimeType: file.type,
        },
      ]);
    } catch (err) {
      console.warn('Failed to attach image:', err);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputPrompt.trim() && attachments.length === 0) || isGenerating) return;
    const imageDataUrl = attachments[0]?.dataUrl;
    onGenerate(inputPrompt.trim(), imageDataUrl);
    setInputPrompt('');
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInsertSnippet = (snippet: string) => {
    setInputPrompt((prev) => {
      if (!prev.trim()) return `Build a UI component featuring: ${snippet}`;
      return `${prev.trim()}\n\nInclude UI pattern: ${snippet}`;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files: File[] = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const imageFile = files.find((f) => f.type.startsWith('image/'));
      if (imageFile) {
        addAttachment(imageFile);
        return;
      }
    }
    const snippet = e.dataTransfer.getData('text/plain');
    if (snippet) {
      handleInsertSnippet(snippet);
    }
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
      {/* Sidebar Top Header & Mode Tabs */}
      <div className={`p-2.5 border-b space-y-2 ${
        isLight ? 'bg-[#ebe6dc]/80 border-[#e6e1d7]' : 'bg-[#1b1a17]/60 border-[#38342e]'
      }`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#d97757]" />
            <span className="text-xs font-serif-claude font-bold tracking-wide text-inherit">
              Gia-co Design Loop
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
            isLight
              ? 'bg-white/80 text-[#736e65] border-[#ded8cc]'
              : 'bg-[#2a2723] text-[#9e978a] border-[#3d3831]'
          }`}>
            ~{tokenCount} tokens
          </span>
        </div>

        {/* Sidebar Nav Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/5 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setSidebarTab('chat')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
              sidebarTab === 'chat'
                ? 'bg-white dark:bg-[#2e2a25] text-[#d97757] shadow-xs'
                : 'text-[#736e65] dark:text-[#9e978a] hover:text-[#22201d] dark:hover:text-[#f4f0ea]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat ({turns.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab('patterns')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
              sidebarTab === 'patterns'
                ? 'bg-white dark:bg-[#2e2a25] text-[#d97757] shadow-xs'
                : 'text-[#736e65] dark:text-[#9e978a] hover:text-[#22201d] dark:hover:text-[#f4f0ea]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>UI Patterns</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {sidebarTab === 'patterns' ? (
          <VisualLibraryPanel
            onInsertSnippet={handleInsertSnippet}
            theme={theme}
          />
        ) : (
          /* Chat Feed - every turn as a message, AI turns carry an inline
             live preview so the design shows up right in the conversation,
             not tucked away behind a separate tab. Tapping a preview syncs
             the main canvas to that version. */
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {turns.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#d97757] opacity-60" />
                <p className={`text-xs ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Describe what you want to design below - your conversation and every version you generate will show up here.
                </p>
              </div>
            ) : (
              turns.map((turn, idx) => {
                const isActive = idx === activeTurnIndex;
                return (
                  <div key={turn.id} className="space-y-1.5">
                    {/* User message */}
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isLight ? 'bg-[#e2ddd3] text-[#575249]' : 'bg-[#3d3831] text-[#c4bdae]'
                      }`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className={`flex-1 min-w-0 p-2.5 rounded-2xl rounded-tl-sm border text-xs leading-relaxed ${
                        isLight ? 'bg-white border-[#e6e1d7] text-[#22201d]' : 'bg-[#2a2723] border-[#3d3831] text-[#f4f0ea]'
                      }`}>
                        <p className="break-words">{turn.prompt}</p>
                        {turn.pins && turn.pins.length > 0 && (
                          <div className={`mt-1.5 pt-1.5 border-t space-y-1 ${isLight ? 'border-[#e6e1d7]' : 'border-[#3d3831]'}`}>
                            {turn.pins.map((p, pIdx) => (
                              <div key={p.id} className="flex items-start gap-1 text-[10px] opacity-70">
                                <PinIcon className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                                <span>{p.comment}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assistant message with inline live preview */}
                    <button
                      type="button"
                      onClick={() => onSelectTurn(idx)}
                      className="flex items-start gap-2 w-full text-left"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#d97757] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className={`flex-1 min-w-0 rounded-2xl rounded-tl-sm border overflow-hidden transition-all ${
                        isActive
                          ? 'border-[#d97757] ring-2 ring-[#d97757]/40'
                          : isLight
                          ? 'border-[#e6e1d7] hover:border-[#d97757]/50'
                          : 'border-[#3d3831] hover:border-[#d97757]/50'
                      }`}>
                        <div className={`h-28 border-b ${isLight ? 'border-[#e6e1d7]' : 'border-[#3d3831]'} bg-white`}>
                          <iframe
                            title={`turn-${idx}-preview`}
                            srcDoc={turn.codeHtml}
                            sandbox="allow-scripts"
                            className="w-full h-full pointer-events-none"
                            loading="lazy"
                          />
                        </div>
                        <div className={`px-2.5 py-1.5 flex items-center justify-between text-[10px] ${
                          isLight ? 'bg-white text-[#736e65]' : 'bg-[#2a2723] text-[#9e978a]'
                        }`}>
                          <span className="font-mono truncate">{turn.modelUsed}</span>
                          {isActive && <span className="text-[#d97757] font-bold shrink-0 ml-1.5">Viewing</span>}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            )}
            <div ref={feedEndRef} />
          </div>
        )}
      </div>

      {sidebarTab === 'chat' && (
        <div className="px-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {quickPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => onGenerate(pill)}
                disabled={isGenerating}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors disabled:opacity-50 ${
                  isLight
                    ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                    : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border-[#3d3831]'
                }`}
              >
                + {pill}
              </button>
            ))}
            <button
              type="button"
              onClick={onDecompose}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#d97757] hover:text-[#c66545] border border-[#d97757]/30 flex items-center gap-1"
            >
              <Layers className="w-2.5 h-2.5" /> Decompose Kit
            </button>
          </div>
        </div>
      )}

      {/* Input Prompt Form with Drag & Drop Listener */}
      <form
        onSubmit={handleSubmit}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          if (!isDragOver) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`p-3.5 border-t space-y-2.5 relative transition-all ${
          isDragOver
            ? 'bg-[#d97757]/15 border-[#d97757] ring-2 ring-[#d97757]'
            : isLight
            ? 'bg-[#ebe6dc]/60 border-[#e6e1d7]'
            : 'bg-[#1b1a17]/70 border-[#38342e]'
        }`}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-20 bg-[#d97757]/90 text-white font-bold text-xs flex items-center justify-center gap-2 backdrop-blur-xs rounded-t-xl animate-pulse">
            <Plus className="w-5 h-5" />
            <span>Drop UI Pattern into Prompt!</span>
          </div>
        )}

        <div className="relative">
          <textarea
            rows={3}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Describe your design or drag UI patterns from the library tab..."
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) addAttachment(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className={`p-1 rounded-lg transition-colors ${
                attachments.length > 0 ? 'text-[#d97757]' : 'hover:text-[#d97757]'
              }`}
              title="Attach Wireframe / Screenshot (image)"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="flex items-center gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className={`flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-lg border text-[10px] font-medium ${
                  isLight
                    ? 'bg-[#d97757]/10 border-[#d97757]/30 text-[#92400e]'
                    : 'bg-[#d97757]/20 border-[#d97757]/40 text-[#e28566]'
                }`}
              >
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="w-6 h-6 rounded object-cover border border-black/10"
                />
                <span className="max-w-[110px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded hover:bg-black/10 text-current transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <span className={`text-[10px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
              wireframe attached — model will match its layout
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
              Directions
            </span>
            <div className="flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-white/10">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onVariantCountChange(n)}
                  disabled={isGenerating}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all disabled:opacity-50 ${
                    variantCount === n
                      ? 'bg-[#d97757] text-white shadow-sm'
                      : isLight
                      ? 'text-[#736e65] hover:text-[#22201d]'
                      : 'text-[#9e978a] hover:text-[#f4f0ea]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
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
                <span>{variantCount > 1 ? `Generate ${variantCount}` : 'Generate'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </aside>
  );
};
