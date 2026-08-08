import React, { useState } from 'react';
import { X, Smartphone, Globe, LayoutDashboard, PanelTop, Component, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { BYOKConfig, DesignScreen, PreviewDevice } from '../types';
import { generateDesignCode } from '../lib/ai';

interface AddScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: (name: string, kind: DesignScreen['kind']) => void;
  onCreateGenerated: (name: string, kind: DesignScreen['kind'], html: string) => void;
  byok: BYOKConfig;
  previewDevice: PreviewDevice;
  designSystemHtml?: string;
}

const KINDS: Array<{ id: DesignScreen['kind']; label: string; icon: React.ElementType }> = [
  { id: 'mobile', label: 'Mobile Screen', icon: Smartphone },
  { id: 'website', label: 'Website Page', icon: Globe },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'landing', label: 'Landing Page', icon: PanelTop },
  { id: 'component', label: 'Component', icon: Component },
];

export const AddScreenModal: React.FC<AddScreenModalProps> = ({
  isOpen,
  onClose,
  onCreateBlank,
  onCreateGenerated,
  byok,
  previewDevice,
  designSystemHtml,
}) => {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<DesignScreen['kind']>('mobile');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => { setName(''); setPrompt(''); setError(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleCreate = async () => {
    const screenName = name.trim() || `New ${KINDS.find((k) => k.id === kind)?.label || 'Screen'}`;
    if (!prompt.trim()) {
      onCreateBlank(screenName, kind);
      reset();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateDesignCode(prompt, null, byok, [], designSystemHtml, undefined, previewDevice);
      onCreateGenerated(screenName, kind, result.html);
      reset();
    } catch (e: any) {
      setError(e?.message || 'Failed to generate this screen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border bg-[#faf8f5] border-[#e6e1d7] text-[#22201d] dark:bg-[#22201d] dark:border-[#38342e] dark:text-[#f4f0ea]">
        <div className="px-5 py-4 border-b border-[#e6e1d7] dark:border-[#38342e] flex items-center justify-between">
          <h2 className="text-base font-serif-claude font-bold">Add a Screen</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#736e65] dark:text-[#9e978a] mb-1.5">Screen Type</label>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setKind(id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                    kind === id
                      ? 'bg-[#d97757] text-white border-[#c66545]'
                      : 'bg-white hover:bg-[#f4f0e8] text-[#575249] border-[#e2ddd3] dark:bg-[#2a2723] dark:hover:bg-[#332f2a] dark:text-[#b3ac9f] dark:border-[#3d3831]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#736e65] dark:text-[#9e978a] mb-1.5">Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Checkout, Profile, Pricing"
              className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#d97757] bg-white border-[#e2ddd3] text-[#22201d] dark:bg-[#2a2723] dark:border-[#3d3831] dark:text-[#f4f0ea]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#736e65] dark:text-[#9e978a] mb-1.5">
              Describe it (leave blank to start empty)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A checkout screen with order summary, promo code field, and a pay button"
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#d97757] resize-none bg-white border-[#e2ddd3] text-[#22201d] dark:bg-[#2a2723] dark:border-[#3d3831] dark:text-[#f4f0ea]"
            />
          </div>
          {error && (
            <div className="p-3 rounded-xl text-xs text-red-500 bg-white border border-[#e2ddd3] dark:bg-[#2a2723] dark:border-[#3d3831] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : prompt.trim() ? 'Generate Screen' : 'Add Blank Screen'}
          </button>
        </div>
      </div>
    </div>
  );
};
