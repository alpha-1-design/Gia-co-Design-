import React, { useState, useRef } from 'react';
import { X, Palette, Upload, Plus, Trash2, Check, FileCode2 } from 'lucide-react';
import { DesignSystem } from '../types';

interface DesignSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  designSystems: DesignSystem[];
  activeId: string | null;
  onSaveSystems: (systems: DesignSystem[]) => void;
  onSetActive: (id: string | null) => void;
  onDelete: (id: string) => void;
  theme?: 'light' | 'dark';
}

export const DesignSystemModal: React.FC<DesignSystemModalProps> = ({
  isOpen,
  onClose,
  designSystems,
  activeId,
  onSaveSystems,
  onSetActive,
  onDelete,
  theme = 'light',
}) => {
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      if (text.length < 50) {
        setError('File looks too small to be a useful design reference.');
        return;
      }
      setError(null);
      setSource(text);
      if (!name.trim()) {
        setName(file.name.replace(/\.(html?|css|txt|jsx|tsx)$/i, ''));
      }
    };
    reader.onerror = () => setError('Could not read the selected file.');
    reader.readAsText(file);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Give your design system a name.');
      return;
    }
    if (!source.trim() || source.trim().length < 50) {
      setError('Paste or upload an HTML/CSS reference that defines your brand (colors, fonts, components).');
      return;
    }
    const now = Date.now();
    const system: DesignSystem = {
      id: `design-system-${now}`,
      name: name.trim(),
      sourceHtml: source.trim(),
      createdAt: now,
      updatedAt: now,
    };
    onSaveSystems([system, ...designSystems]);
    onSetActive(system.id);
    setName('');
    setSource('');
    setError(null);
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
    isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Design Systems</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm">
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            isLight ? 'bg-[#d97757]/10 border-[#d97757]/30 text-[#92400e]' : 'bg-[#d97757]/20 border-[#d97757]/40 text-[#e28566]'
          }`}>
            <FileCode2 className="w-4 h-4 text-[#d97757] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Brand Reference</strong>
              Import an HTML/CSS file or paste code that defines your brand. Gia-co-Design will match its colors, fonts, and patterns on every generation.
            </div>
          </div>

          {/* Existing systems */}
          {designSystems.length > 0 && (
            <div className="space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
                Saved Systems ({designSystems.length})
              </label>
              {designSystems.map((ds) => (
                <div key={ds.id} className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${
                  activeId === ds.id
                    ? isLight ? 'bg-[#d97757]/10 border-[#d97757]' : 'bg-[#d97757]/20 border-[#d97757]'
                    : isLight ? 'bg-white border-[#e2ddd3]' : 'bg-[#2a2723] border-[#3d3831]'
                }`}>
                  <button
                    type="button"
                    onClick={() => onSetActive(activeId === ds.id ? null : ds.id)}
                    className="flex-1 text-left flex items-center gap-2 min-w-0"
                  >
                    {activeId === ds.id && <Check className="w-3.5 h-3.5 text-[#d97757] shrink-0" />}
                    <span className="font-semibold truncate">{ds.name}</span>
                    <span className={`text-[10px] shrink-0 ${isLight ? 'text-[#9e978a]' : 'text-[#736e65]'}`}>
                      {Math.round(ds.sourceHtml.length / 100) / 10}kb
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(ds.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete design system"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Create new */}
          <div className="space-y-3">
            <label className={`block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>
              Import New System
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="System name (e.g. Acme Brand UI)"
              className={inputCls}
            />
            <textarea
              rows={6}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={'Paste your brand HTML/CSS here...\n\nTips: include your color palette, fonts, buttons, nav, cards so the model can match them.'}
              className={`${inputCls} resize-none leading-relaxed`}
            />
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.css,.txt,.jsx,.tsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-[#f7f4ec] text-[#575249] border-[#e2ddd3]'
                    : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border-[#3d3831]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload HTML/CSS
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Save & Activate
              </button>
            </div>
            {error && <p className="text-[11px] text-amber-600 font-mono">⚠️ {error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
