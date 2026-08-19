import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Play, SkipForward, RotateCcw } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  theme?: 'light' | 'dark';
  /** Bump this to force a full remount (e.g. on replay) */
  tourKey?: number;
}

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  mockContent: React.ReactNode;
  duration: number; // ms
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gia-co-Design',
    subtitle: 'The universal AI design tool. Design anything — websites, apps, charts, motion graphics, presentations.',
    duration: 5000,
    mockContent: (
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-500/30">
          G
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {['Websites', 'Mobile', 'Charts', 'Motion', 'Slides'].map((t, i) => (
            <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'prompt',
    title: 'Describe What You Want',
    subtitle: 'Type a prompt in plain language. Be as specific or creative as you like — Gia handles the rest.',
    duration: 5500,
    mockContent: (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50 font-medium">AI Prompt</span>
          </div>
          <div className="text-sm text-white/90 leading-relaxed">
            <span className="typing-animation">A modern fintech dashboard with KPI cards, a revenue chart, recent transactions table, and a dark sidebar navigation...</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
              <span className="text-xs text-white/40">Describe your design...</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'generate',
    title: 'AI Generates Your Design',
    subtitle: 'Gia uses your chosen AI provider (Gemini, OpenAI, Anthropic, and 7 more) to generate production-quality HTML.',
    duration: 5500,
    mockContent: (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
            <span className="text-xs text-violet-300 font-medium">Generating design...</span>
          </div>
          <div className="space-y-2">
            {[85, 70, 92, 60, 78, 88, 55, 95, 65, 80].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500/60 to-fuchsia-500/60"
                  style={{
                    width: `${w}%`,
                    animation: `shimmer 1.5s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-white/30 font-mono">
            {`<div class="dashboard">...</div>`}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'preview',
    title: 'Live Preview & Edit',
    subtitle: 'See your design rendered live. Switch between mobile, tablet, and desktop views. Edit code inline.',
    duration: 5500,
    mockContent: (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {['📱', '📟', '🖥️'].map((e, i) => (
                <span key={i} className={`w-7 h-7 rounded-md flex items-center justify-center text-sm ${i === 0 ? 'bg-white/10' : 'bg-white/5'}`}>
                  {e}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              {['Code', 'Critique', 'Export'].map((l) => (
                <span key={l} className="px-2 py-0.5 rounded text-[10px] text-white/40 bg-white/5">{l}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-white overflow-hidden h-32 relative">
            <div className="absolute inset-0 p-2">
              <div className="flex gap-1 h-full">
                <div className="w-12 bg-slate-900 rounded-md flex flex-col items-center gap-1 p-1">
                  <div className="w-4 h-4 rounded bg-violet-500/80" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-6 h-1.5 rounded bg-white/10" />
                  ))}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex-1 h-8 rounded bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 p-1">
                        <div className="w-4 h-1 rounded bg-slate-300" />
                        <div className="w-6 h-2 rounded bg-slate-900 mt-0.5" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 rounded bg-slate-50 border border-slate-200 p-1">
                    <div className="flex items-end gap-0.5 h-full">
                      {[40, 65, 55, 80, 70, 90, 60, 75, 85, 50, 95, 65].map((h, i) => (
                        <div key={i} className="flex-1 bg-violet-400 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'canvas',
    title: 'Infinite Canvas',
    subtitle: 'See all your screens at once. Drag, arrange, and connect them to map out your entire design flow.',
    duration: 5500,
    mockContent: (
      <div className="w-full max-w-sm mx-auto relative h-40">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
          <path d="M 120 60 C 180 60, 180 100, 240 100" stroke="rgba(139,92,246,0.4)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
          <path d="M 320 100 C 340 100, 340 50, 360 50" stroke="rgba(139,92,246,0.4)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        </svg>
        {[
          { x: 40, y: 25, label: 'Login', color: 'from-blue-500 to-cyan-500' },
          { x: 200, y: 70, label: 'Dashboard', color: 'from-violet-500 to-purple-500' },
          { x: 340, y: 25, label: 'Settings', color: 'from-emerald-500 to-teal-500' },
        ].map((node, i) => (
          <div
            key={i}
            className="absolute rounded-lg border border-white/20 bg-white/5 backdrop-blur p-1.5 cursor-move hover:border-white/40 transition-colors"
            style={{ left: node.x, top: node.y, width: 100 }}
          >
            <div className={`w-full h-12 rounded bg-gradient-to-br ${node.color} opacity-80 mb-1`} />
            <span className="text-[9px] text-white/60 font-medium">{node.label}</span>
          </div>
        ))}
        <div className="absolute bottom-0 right-0 w-16 h-10 rounded bg-white/5 border border-white/10 p-1">
          <div className="w-2 h-1.5 rounded-sm bg-violet-400/60 absolute top-1 left-1" />
          <div className="w-3 h-2 rounded-sm bg-blue-400/60 absolute top-4 left-4" />
          <div className="w-2 h-1.5 rounded-sm bg-emerald-400/60 absolute top-2 right-2" />
        </div>
      </div>
    ),
  },
  {
    id: 'skills',
    title: 'Design Skills',
    subtitle: 'Activate domain-specific skills that teach the AI expert-level design patterns. Create and share your own.',
    duration: 5500,
    mockContent: (
      <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-2">
        {[
          { icon: '📊', name: 'Dashboard', active: true },
          { icon: '📱', name: 'Mobile App', active: false },
          { icon: '🚀', name: 'Landing Page', active: false },
          { icon: '🛒', name: 'E-Commerce', active: true },
          { icon: '📈', name: 'Charts', active: false },
          { icon: '✨', name: 'Motion', active: false },
        ].map((skill, i) => (
          <div
            key={i}
            className={`rounded-lg p-2 text-center transition-all ${
              skill.active
                ? 'bg-violet-500/20 border border-violet-400/40 shadow-lg shadow-violet-500/10'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="text-lg mb-0.5">{skill.icon}</div>
            <div className="text-[10px] text-white/70 font-medium">{skill.name}</div>
            {skill.active && (
              <div className="text-[8px] text-violet-300 mt-0.5 font-medium">ACTIVE</div>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'export',
    title: 'Export Anywhere',
    subtitle: 'Download as HTML, ZIP, or JSON. Deploy to Vercel/Netlify. Share via URL. Export to Canva.',
    duration: 5500,
    mockContent: (
      <div className="w-full max-w-sm mx-auto grid grid-cols-2 gap-2">
        {[
          { icon: '📄', label: 'HTML File', desc: 'Single file, ready to deploy' },
          { icon: '📦', label: 'ZIP Package', desc: 'Multi-file with assets' },
          { icon: '🔗', label: 'Share Link', desc: 'Anyone with the URL' },
          { icon: '🎨', label: 'Canva', desc: 'Continue editing in Canva' },
          { icon: '🚀', label: 'Vercel / Netlify', desc: 'One-click deploy' },
          { icon: '📱', label: 'DESIGN.md', desc: 'Portable design tokens' },
        ].map((item, i) => (
          <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-2.5 flex items-start gap-2 hover:bg-white/10 transition-colors cursor-pointer">
            <span className="text-base">{item.icon}</span>
            <div>
              <div className="text-xs text-white/80 font-medium">{item.label}</div>
              <div className="text-[10px] text-white/40">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'ready',
    title: "You're Ready",
    subtitle: "Start designing. The AI handles the code — you focus on the vision.",
    duration: 5000,
    mockContent: (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-violet-500/30 animate-bounce-slow">
            ✨
          </div>
          <div className="absolute -inset-3 rounded-3xl border-2 border-violet-400/30 animate-ping-slow" />
        </div>
        <div className="text-center">
          <div className="text-sm text-white/90 font-medium mb-1">Type your first prompt</div>
          <div className="text-xs text-white/50">and watch Gia bring it to life</div>
        </div>
      </div>
    ),
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onSkip,
  theme = 'light',
  tourKey = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const goToNext = useCallback(() => {
    if (isLast) {
      onClose();
      return;
    }
    setCurrentStep((p) => p + 1);
    setProgress(0);
  }, [isLast, onClose]);

  const goToPrev = useCallback(() => {
    if (!isFirst) {
      setCurrentStep((p) => p - 1);
      setProgress(0);
    }
  }, [isFirst]);

  // Auto-advance timer
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const duration = step.duration;
    const tick = 50;
    let elapsed = 0;

    progressRef.current = setInterval(() => {
      elapsed += tick;
      setProgress((elapsed / duration) * 100);
    }, tick);

    timerRef.current = setTimeout(() => {
      goToNext();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isOpen, currentStep, isPaused, step.duration, goToNext]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, tourKey]);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, goToNext, goToPrev, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Tour card */}
      <div className="relative w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>

        {/* Main card */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-0.5 bg-white/5 relative">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mock content area */}
          <div
            className="px-6 pt-8 pb-4 min-h-[220px] flex items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={step.id}>
              {step.mockContent}
            </div>
          </div>

          {/* Text content */}
          <div className="px-6 pb-4">
            <h2 className="text-lg font-semibold text-white mb-1">{step.title}</h2>
            <p className="text-sm text-white/60 leading-relaxed">{step.subtitle}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
            {/* Left: step dots */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentStep(i); setProgress(0); }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? 'bg-violet-400 w-5'
                      : i < currentStep
                      ? 'bg-violet-400/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={goToPrev}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onSkip}
                className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors flex items-center gap-1"
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </button>

              <button
                onClick={isLast ? onClose : goToNext}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {isLast ? (
                  <>
                    Start Designing
                    <Play className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="flex justify-center gap-4 mt-3">
          <span className="text-[10px] text-white/30">← → Navigate</span>
          <span className="text-[10px] text-white/30">Space Next</span>
          <span className="text-[10px] text-white/30">Esc Close</span>
          <span className="text-[10px] text-white/30">Hover to pause</span>
        </div>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .typing-animation {
          border-right: 2px solid rgba(139, 92, 246, 0.6);
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
      `}</style>
    </div>
  );
};
