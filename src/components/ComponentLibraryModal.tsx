import React, { useState } from 'react';
import { X, Search, Trash2, Plus, Copy, Check, LibraryBig } from 'lucide-react';
import { SavedComponent } from '../types';

interface ComponentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: SavedComponent[];
  onDelete: (id: string) => void;
  onInsert: (html: string, name: string) => void;
  theme: 'light' | 'dark';
}

function CopyBtn({ text, isLight }: { text: string; isLight: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {}
      }}
      className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-[#f4f0e8] text-[#575249]' : 'hover:bg-[#332f2a] text-[#b3ac9f]'}`}
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export const ComponentLibraryModal: React.FC<ComponentLibraryModalProps> = ({
  isOpen,
  onClose,
  components,
  onDelete,
  onInsert,
  theme,
}) => {
  const [query, setQuery] = useState('');
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const filtered = components.filter((c) =>
    !query.trim() ||
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'}`}>
          <div className="flex items-center gap-2">
            <LibraryBig className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Component Library</h2>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isLight ? 'bg-white text-[#736e65]' : 'bg-[#2a2723] text-[#9e978a]'}`}>{components.length}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b shrink-0 border-[#e6e1d7] dark:border-[#38342e]">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-[#e2ddd3]' : 'bg-[#2a2723] border-[#3d3831]'}`}>
            <Search className="w-4 h-4 opacity-50 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved components by name or tag..."
              className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {components.length === 0 ? (
            <div className="text-center py-12 text-sm opacity-60">
              Nothing saved yet. Generate something in the Component or Motion tab of Design Tools, then hit "Save to Library" to keep it here.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm opacity-60">No matches for "{query}".</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((c) => (
                <div key={c.id} className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-[#e2ddd3]' : 'bg-[#2a2723] border-[#3d3831]'}`}>
                  <div className="h-32 border-b border-[#e2ddd3] dark:border-[#3d3831] bg-white">
                    <iframe title={c.name} srcDoc={c.codeHtml} sandbox="allow-scripts" className="w-full h-full pointer-events-none" />
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold truncate">{c.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide font-bold ${
                        c.category === 'motion' ? 'bg-[#d97757]/15 text-[#d97757]' : isLight ? 'bg-[#f4f0e8] text-[#736e65]' : 'bg-[#1b1a17] text-[#9e978a]'
                      }`}>{c.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onInsert(c.codeHtml, c.name)}
                        className="flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 bg-[#d97757] hover:bg-[#c66545] text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Insert
                      </button>
                      <CopyBtn text={c.codeHtml} isLight={isLight} />
                      <button
                        onClick={() => onDelete(c.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-500/10 text-red-400'}`}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
