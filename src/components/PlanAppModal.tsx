import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertTriangle, Check, Smartphone, Globe, LayoutDashboard, PanelTop, Component } from 'lucide-react';
import { BYOKConfig, DesignScreen, PreviewDevice } from '../types';
import { planAppScreens, generateDesignCode, PlannedScreen } from '../lib/ai';

interface PlanAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScreensReady: (screens: Array<{ name: string; kind: DesignScreen['kind']; html: string }>) => void;
  byok: BYOKConfig;
  previewDevice: PreviewDevice;
  designSystemHtml?: string;
}

const KIND_ICON: Record<string, React.ElementType> = {
  website: Globe,
  mobile: Smartphone,
  dashboard: LayoutDashboard,
  landing: PanelTop,
  component: Component,
  other: PanelTop,
};

type Stage = 'describe' | 'planned' | 'generating' | 'done';

export const PlanAppModal: React.FC<PlanAppModalProps> = ({
  isOpen,
  onClose,
  onScreensReady,
  byok,
  previewDevice,
  designSystemHtml,
}) => {
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<Stage>('describe');
  const [planned, setPlanned] = useState<PlannedScreen[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; currentName: string }>({ done: 0, total: 0, currentName: '' });

  if (!isOpen) return null;

  const reset = () => {
    setDescription('');
    setStage('describe');
    setPlanned([]);
    setSelected(new Set());
    setError(null);
    setProgress({ done: 0, total: 0, currentName: '' });
  };
  const handleClose = () => { reset(); onClose(); };

  const handlePlan = async () => {
    if (!description.trim()) return;
    setPlanning(true);
    setError(null);
    try {
      const result = await planAppScreens(description, byok, previewDevice);
      setPlanned(result.screens);
      setSelected(new Set(result.screens.map((_, i) => i)));
      setStage('planned');
    } catch (e: any) {
      setError(e?.message || 'Could not plan screens.');
    } finally {
      setPlanning(false);
    }
  };

  const toggleScreen = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleGenerateAll = async () => {
    const toGenerate = planned.filter((_, i) => selected.has(i));
    if (toGenerate.length === 0) return;
    setStage('generating');
    setError(null);
    setProgress({ done: 0, total: toGenerate.length, currentName: toGenerate[0].name });
    const results: Array<{ name: string; kind: DesignScreen['kind']; html: string }> = [];
    for (let i = 0; i < toGenerate.length; i++) {
      const screen = toGenerate[i];
      setProgress({ done: i, total: toGenerate.length, currentName: screen.name });
      try {
        const result = await generateDesignCode(screen.prompt, null, byok, [], designSystemHtml, undefined, previewDevice);
        results.push({ name: screen.name, kind: screen.kind, html: result.html });
      } catch (e: any) {
        setError(`Stopped after "${screen.name}" - ${e?.message || 'generation failed'}. ${results.length} screen(s) completed so far will still be added.`);
        break;
      }
    }
    setProgress({ done: results.length, total: toGenerate.length, currentName: '' });
    if (results.length > 0) {
      onScreensReady(results);
    }
    setStage('done');
  };

  const isLight = true; // modal uses a fixed light/dark pair via Tailwind dark: classes below

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border bg-[#faf8f5] border-[#e6e1d7] text-[#22201d] dark:bg-[#22201d] dark:border-[#38342e] dark:text-[#f4f0ea]">
        <div className="px-5 py-4 border-b border-[#e6e1d7] dark:border-[#38342e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Plan a Whole App</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {stage === 'describe' && (
            <>
              <p className="text-xs opacity-70">
                Describe the product. The agent proposes the screens it actually needs (2-6), you pick which to generate. Design/mockup output only - no backend, no real navigation logic between screens.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A budgeting app for students - track spending, set savings goals, see weekly summaries"
                rows={4}
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-[#d97757] resize-none bg-white border-[#e2ddd3] text-[#22201d] dark:bg-[#2a2723] dark:border-[#3d3831] dark:text-[#f4f0ea]"
              />
              {error && (
                <div className="p-3 rounded-xl text-xs text-red-500 bg-white border border-[#e2ddd3] dark:bg-[#2a2723] dark:border-[#3d3831] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <button
                onClick={handlePlan}
                disabled={planning || !description.trim()}
                className="w-full px-4 py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
              >
                {planning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {planning ? 'Planning screens...' : 'Plan Screens'}
              </button>
            </>
          )}

          {stage === 'planned' && (
            <>
              <p className="text-xs opacity-70">Proposed screens - uncheck any you don't want, then generate.</p>
              <div className="space-y-2">
                {planned.map((s, idx) => {
                  const Icon = KIND_ICON[s.kind] || PanelTop;
                  const checked = selected.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleScreen(idx)}
                      className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                        checked
                          ? 'bg-[#d97757]/10 border-[#d97757]/40'
                          : 'bg-white border-[#e2ddd3] dark:bg-[#2a2723] dark:border-[#3d3831] opacity-60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${checked ? 'bg-[#d97757] border-[#d97757]' : 'border-[#c9c2b4]'}`}>
                        {checked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <Icon className="w-4 h-4 text-[#d97757] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs opacity-70">{s.purpose}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {error && (
                <div className="p-3 rounded-xl text-xs text-red-500 bg-white border border-[#e2ddd3] dark:bg-[#2a2723] dark:border-[#3d3831] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setStage('describe')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-[#f4f0e8] text-[#575249] border border-[#e2ddd3] dark:bg-[#2a2723] dark:hover:bg-[#332f2a] dark:text-[#b3ac9f] dark:border-[#3d3831]"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateAll}
                  disabled={selected.size === 0}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate {selected.size} Screen{selected.size !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}

          {stage === 'generating' && (
            <div className="py-8 flex flex-col items-center text-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#d97757]" />
              <p className="text-sm font-semibold">
                Generating {progress.done + 1} of {progress.total}: {progress.currentName}
              </p>
              <div className="w-full h-1.5 rounded-full bg-[#e6e1d7] dark:bg-[#38342e] overflow-hidden">
                <div
                  className="h-full bg-[#d97757] transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs opacity-60">This can take a bit - each screen is a full generation call.</p>
            </div>
          )}

          {stage === 'done' && (
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold">{progress.done} screen{progress.done !== 1 ? 's' : ''} added to your project</p>
              {error && <p className="text-xs text-amber-500">{error}</p>}
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-sm font-semibold"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
