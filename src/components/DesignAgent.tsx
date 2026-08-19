import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  Sparkles,
  User,
  Bot,
  RefreshCw,
  Image as ImageIcon,
  X,
  FileCode2,
  FileText,
  FileJson,
  Layers,
  LayoutGrid,
  Plus,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Code2,
  Palette,
  Zap,
  Loader2,
  Brain,
  Paintbrush,
  MonitorSmartphone,
} from 'lucide-react';
import { DesignTurn, ImageAttachment, DesignMessage, DesignSkill } from '../types';
import { VisualLibraryPanel } from './VisualLibraryPanel';
import { aiCallStream, parseStructuredCode } from '../lib/ai';
import { BYOKConfig } from '../types';
import { DEVICE_VIEWPORTS } from '../lib/deviceViewports';
import { PreviewDevice } from '../types';

/* ─── Lightweight Markdown Renderer (no deps) ────────────────────────── */

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (```)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().replace(/^```/, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <pre key={key++} className="my-1.5 rounded-lg overflow-hidden text-[10px] leading-[1.5] font-mono">
          <div className="flex items-center justify-between px-2.5 py-1 bg-black/10 text-[9px] uppercase tracking-wider font-bold opacity-70">
            <span>{lang || 'code'}</span>
            <CopyButton text={codeLines.join('\n')} />
          </div>
          <code className="block px-3 py-2 bg-black/5 overflow-x-auto whitespace-pre">{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading (### or ## or #)
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cls = level === 1 ? 'text-sm font-bold mt-2 mb-0.5' : level === 2 ? 'text-xs font-bold mt-1.5 mb-0.5' : 'text-[11px] font-semibold mt-1 mb-0.5';
      nodes.push(<p key={key++} className={cls}>{renderInline(headingMatch[2])}</p>);
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^\s*[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      nodes.push(
        <ul key={key++} className="my-1 space-y-0.5 pl-3 list-disc text-[11px]">
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\s*\d+[.)]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+[.)]\s+/)) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i++;
      }
      nodes.push(
        <ol key={key++} className="my-1 space-y-0.5 pl-3 list-decimal text-[11px]">
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      nodes.push(
        <blockquote key={key++} className="my-1 pl-3 border-l-2 border-[#d97757]/40 italic text-[11px] opacity-80">
          {renderInline(line.replace(/^>\s*/, ''))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Regular paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('```') && !lines[i].match(/^#{1,3}\s/) && !lines[i].match(/^\s*[-*]\s+/) && !lines[i].match(/^\s*\d+[.)]\s+/) && !lines[i].startsWith('>')) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push(<p key={key++} className="my-1 text-[11px] leading-relaxed">{renderInline(paraLines.join(' '))}</p>);
    }
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Bold, italic, inline code, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let k = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={k++} className="px-1 py-0.5 mx-0.5 rounded bg-black/8 text-[10px] font-mono font-semibold">{codeMatch[1]}</code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={k++} className="font-bold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={k++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={k++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#d97757] underline decoration-dotted underline-offset-2 hover:text-[#c66545]">{linkMatch[1]}</a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Regular char — accumulate until next special
    const nextSpecial = remaining.search(/[*`\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

/* ─── Copy Button ────────────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <button type="button" onClick={handleCopy} className="flex items-center gap-1 hover:text-white transition-colors">
      {copied ? <><Check className="w-3 h-3" /><span>Copied</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
    </button>
  );
}

/* ─── Thinking Phases ────────────────────────────────────────────────── */

const THINKING_PHASES = [
  { icon: Brain, text: 'Analyzing your request', color: '#8b5cf6' },
  { icon: Paintbrush, text: 'Designing the layout', color: '#d97757' },
  { icon: Code2, text: 'Writing HTML + CSS + JS', color: '#10b981' },
  { icon: MonitorSmartphone, text: 'Optimizing for viewport', color: '#3b82f6' },
];

/* ─── Code Block with Tabs ───────────────────────────────────────────── */

function CodeBlockTabs({ code, theme }: { code: { html: string; css?: string; js?: string }; theme?: string }) {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isLight = (theme || 'light') === 'light';

  const tabs: Array<{ id: 'html' | 'css' | 'js'; label: string; icon: typeof FileCode2; content: string }> = [
    { id: 'html', label: 'HTML', icon: FileCode2, content: code.html },
  ];
  if (code.css) tabs.push({ id: 'css', label: 'CSS', icon: Palette, content: code.css });
  if (code.js) tabs.push({ id: 'js', label: 'JS', icon: FileJson, content: code.js });

  const activeContent = tabs.find(t => t.id === activeTab)?.content || '';

  return (
    <div className={`rounded-lg border overflow-hidden text-[10px] ${isLight ? 'border-[#e6e1d7] bg-white' : 'border-[#3d3831] bg-[#1b1a17]'}`}>
      <div className={`flex items-center justify-between px-2 py-1 border-b ${isLight ? 'border-[#e6e1d7] bg-[#f8f6f2]' : 'border-[#3d3831] bg-[#23201c]'}`}>
        <div className="flex items-center gap-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setIsCollapsed(false); }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#d97757]/15 text-[#d97757]'
                    : isLight ? 'text-[#827c70] hover:text-[#575249]' : 'text-[#8c8577] hover:text-[#c4bdae]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={activeContent} />
          <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className="p-0.5 rounded hover:bg-black/10 transition-colors">
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <pre className="px-3 py-2 overflow-x-auto max-h-48 overflow-y-auto font-mono leading-relaxed whitespace-pre">{activeContent}</pre>
      )}
      {isCollapsed && (
        <div className={`px-3 py-1.5 text-[9px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
          {tabs.length} file{tabs.length > 1 ? 's' : ''} · Click to expand
        </div>
      )}
    </div>
  );
}

/* ─── Live Preview Card ──────────────────────────────────────────────── */

function LivePreview({ html, msgId, theme }: { html: string; msgId: string; theme?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLight = (theme || 'light') === 'light';

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsExpanded(false)}>
        <div className={`relative w-[90vw] h-[85vh] rounded-2xl overflow-hidden shadow-2xl border ${isLight ? 'bg-white border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'}`} onClick={e => e.stopPropagation()}>
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isLight ? 'bg-[#f8f6f2] border-[#e6e1d7]' : 'bg-[#23201c] border-[#3d3831]'}`}>
            <span className="text-xs font-bold text-[#d97757]">Live Preview</span>
            <button type="button" onClick={() => setIsExpanded(false)} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
          <iframe title={`preview-full-${msgId}`} srcDoc={html} sandbox="allow-scripts" className="w-full h-full border-0" loading="lazy" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group rounded-xl overflow-hidden border ${isLight ? 'border-[#e6e1d7]' : 'border-[#3d3831]'}`}>
      <div className="h-44 bg-white">
        <iframe title={`preview-${msgId}`} srcDoc={html} sandbox="allow-scripts" className="w-full h-full pointer-events-none border-0" loading="lazy" />
      </div>
      <div className={`absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
          title="Expand preview"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
        <a
          href={`data:text/html,${encodeURIComponent(html)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
          title="Open in new tab"
        >
          <Eye className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

/* ─── Context Chips ──────────────────────────────────────────────────── */

function ContextChips({ turns, designSystemHtml, skillPrompt, conversationLength }: {
  turns: DesignTurn[];
  designSystemHtml?: string;
  skillPrompt?: string;
  conversationLength: number;
}) {
  const chips: Array<{ icon: typeof Sparkles; label: string; color: string }> = [];

  if (turns.length > 0 || conversationLength > 0) {
    chips.push({ icon: Sparkles, label: `${turns.length + conversationLength} messages in context`, color: '#d97757' });
  }
  if (designSystemHtml && designSystemHtml.trim()) {
    chips.push({ icon: Palette, label: 'Design system loaded', color: '#8b5cf6' });
  }
  if (skillPrompt) {
    chips.push({ icon: Zap, label: 'Skill active', color: '#10b981' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 px-3 pb-1">
      {chips.map((chip, i) => {
        const Icon = chip.icon;
        return (
          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-black/5 text-[#736e65]">
            <Icon className="w-2.5 h-2.5" style={{ color: chip.color }} />
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Main DesignAgent Component ─────────────────────────────────────── */

interface DesignAgentProps {
  turns: DesignTurn[];
  activeTurnIndex: number;
  onSelectTurn: (index: number) => void;
  onGenerate: (prompt: string, imageDataUrl?: string) => Promise<void>;
  isGenerating: boolean;
  onDecompose: () => void;
  tokenCount: number;
  variantCount: number;
  onVariantCountChange: (count: number) => void;
  byok: BYOKConfig;
  designSystemHtml?: string;
  previewDevice?: PreviewDevice;
  skillPrompt?: string;
  onStructuredCode?: (code: { html: string; css: string; js: string }) => void;
  theme?: 'light' | 'dark';
}

export const DesignAgent: React.FC<DesignAgentProps> = ({
  turns,
  activeTurnIndex,
  onSelectTurn,
  onGenerate,
  isGenerating,
  onDecompose,
  tokenCount,
  variantCount,
  onVariantCountChange,
  byok,
  designSystemHtml,
  previewDevice,
  skillPrompt,
  onStructuredCode,
  theme = 'light',
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'patterns'>('chat');
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<DesignMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLight = theme === 'light';

  // Thinking phase animation
  useEffect(() => {
    if (!isStreaming || !streamingText) return;
    const timer = setInterval(() => {
      setThinkingPhase(prev => (prev + 1) % THINKING_PHASES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isStreaming, streamingText]);

  // Auto-scroll
  useEffect(() => {
    if (sidebarTab === 'chat' && feedEndRef.current) {
      try { feedEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch {}
    }
  }, [turns.length, sidebarTab, conversationHistory.length, streamingText]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read image'));
      reader.readAsDataURL(file);
    });

  const addAttachment = async (file: File) => {
    if (!file.type.startsWith('image/') || attachments.length >= 1) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAttachments([{ id: `${file.name}-${Date.now()}`, name: file.name, dataUrl, mimeType: file.type }]);
    } catch (err) { console.warn('Failed to attach:', err); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files: File[] = Array.from(e.dataTransfer.files || []);
    const imageFile = files.find((f) => f.type.startsWith('image/'));
    if (imageFile) { addAttachment(imageFile); return; }
    const snippet = e.dataTransfer.getData('text/plain');
    if (snippet) {
      setInputPrompt((prev) => prev.trim() ? `${prev.trim()}\n\nInclude UI pattern: ${snippet}` : `Build a UI component featuring: ${snippet}`);
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    setInputPrompt((prev) => prev.trim() ? `${prev.trim()}\n\nInclude UI pattern: ${snippet}` : `Build a UI component featuring: ${snippet}`);
    setSidebarTab('chat');
  };

  const runGeneration = useCallback(async (userText: string, imageDataUrl?: string) => {
    const userMsg: DesignMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userText || 'Analyze the attached image',
      timestamp: Date.now(),
    };
    setConversationHistory((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsStreaming(true);
    setStreamingText('');
    setThinkingPhase(0);

    try {
      const { width } = DEVICE_VIEWPORTS[previewDevice || 'mobile'];
      let fullPrompt = `User Request: ${userText}\n\nTARGET VIEWPORT: ${width}px wide (${previewDevice || 'mobile'}). Make it responsive and pixel-perfect at this width.\n\nIMPORTANT: Return your response with:\n1. A brief explanation of what you built and your design decisions\n2. Separate code blocks for HTML, CSS, and JS:\n   \`\`\`html ...\`\`\`\n   \`\`\`css ...\`\`\`\n   \`\`\`javascript ...\`\`\`\nThis lets the design tool show them as separate editable files.`;

      if (designSystemHtml && designSystemHtml.trim()) {
        fullPrompt += `\n\nDesign System:\n\`\`\`html\n${designSystemHtml.slice(0, 12000)}\n\`\`\``;
      }
      // Include last 3 conversation messages for context
      const recentHistory = conversationHistory.slice(-6);
      if (recentHistory.length > 0) {
        fullPrompt += '\n\nPrevious conversation context:\n';
        recentHistory.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text.slice(0, 500)}\n`;
        });
      }
      if (turns.length > 0) {
        const lastCode = turns[turns.length - 1]?.codeHtml;
        if (lastCode) {
          fullPrompt += `\n\nExisting design to modify:\n\`\`\`html\n${lastCode}\n\`\`\``;
        }
      }
      if (imageDataUrl) {
        fullPrompt += '\n\nNote: User attached a wireframe/screenshot. Match its layout and style.';
      }

      let collectedText = '';

      await aiCallStream(
        byok,
        fullPrompt,
        (chunk) => {
          if ('token' in chunk) {
            collectedText += chunk.token;
            setStreamingText(collectedText);
          } else if ('done' in chunk) {
            const { code, explanation } = parseStructuredCode(chunk.fullText);

            const assistantMsg: DesignMessage = {
              id: `msg-${Date.now() + 1}`,
              role: 'assistant',
              text: explanation || chunk.fullText.slice(0, 500),
              code,
              timestamp: Date.now(),
              modelUsed: byok.selectedModel || 'gemini-2.5-flash',
              tokensEstimate: chunk.tokensEstimate,
            };
            setConversationHistory((prev) => [...prev, assistantMsg]);
            setStreamingText('');
            setIsStreaming(false);
            setThinkingPhase(0);

            if (code.html) {
              onStructuredCode?.(code);
              onGenerate(userText, imageDataUrl);
            }
          }
        }
      );
    } catch (err: any) {
      setConversationHistory((prev) => [...prev, {
        id: `msg-error-${Date.now()}`,
        role: 'assistant',
        text: `Error: ${err.message || 'Generation failed. Check your API key in Settings.'}`,
        timestamp: Date.now(),
      }]);
      setStreamingText('');
      setIsStreaming(false);
      setThinkingPhase(0);
    }
  }, [byok, skillPrompt, designSystemHtml, previewDevice, turns, conversationHistory, onGenerate, onStructuredCode]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputPrompt.trim() && attachments.length === 0) || isStreaming) return;
    const userText = inputPrompt.trim();
    const imageDataUrl = attachments[0]?.dataUrl;
    await runGeneration(userText || 'Analyze the attached image', imageDataUrl);
  }, [inputPrompt, attachments, isStreaming, runGeneration]);

  // Quick pills now route through conversation
  const handlePill = useCallback(async (pill: string) => {
    if (isStreaming) return;
    await runGeneration(pill);
  }, [isStreaming, runGeneration]);

  const quickPills = [
    { icon: '📱', text: 'Mobile Dashboard' },
    { icon: '🧭', text: 'Navigation Bar' },
    { icon: '🔐', text: 'Login Form' },
    { icon: '📊', text: 'Data Chart' },
    { icon: '💰', text: 'Pricing Section' },
    { icon: '🌙', text: 'Dark Mode Toggle' },
  ];

  const hasMessages = conversationHistory.length > 0 || turns.length > 0;
  const currentPhase = isStreaming ? THINKING_PHASES[thinkingPhase % THINKING_PHASES.length] : null;

  return (
    <aside className={`w-full lg:w-80 xl:w-96 border-r flex flex-col h-full shrink-0 overflow-hidden select-none transition-colors ${
      isLight ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
    }`}>
      {/* Header */}
      <div className={`p-2.5 border-b space-y-2 ${
        isLight ? 'bg-[#ebe6dc]/80 border-[#e6e1d7]' : 'bg-[#1b1a17]/60 border-[#38342e]'
      }`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-[#d97757]" />
              {isStreaming && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />}
            </div>
            <span className="text-xs font-serif-claude font-bold tracking-wide text-inherit">
              Design Agent
            </span>
            {byok.selectedModel && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono ${isLight ? 'bg-[#e2ddd3] text-[#736e65]' : 'bg-[#3d3831] text-[#9e978a]'}`}>
                {byok.selectedModel.split('/').pop()?.split('-').slice(0, 2).join(' ')}
              </span>
            )}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
            isLight ? 'bg-white/80 text-[#736e65] border-[#ded8cc]' : 'bg-[#2a2723] text-[#9e978a] border-[#3d3831]'
          }`}>
            ~{tokenCount}
          </span>
        </div>
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
            <span>Chat ({conversationHistory.length || turns.length})</span>
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

      {/* Context Chips */}
      <ContextChips
        turns={turns}
        designSystemHtml={designSystemHtml}
        skillPrompt={skillPrompt}
        conversationLength={conversationHistory.length}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {sidebarTab === 'patterns' ? (
          <VisualLibraryPanel onInsertSnippet={handleInsertSnippet} theme={theme} />
        ) : (
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Empty state */}
            {!hasMessages && (
              <div className="text-center py-12 px-4">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isLight ? 'bg-gradient-to-br from-[#d97757]/20 to-[#d97757]/5' : 'bg-gradient-to-br from-[#d97757]/30 to-[#d97757]/10'
                }`}>
                  <Sparkles className="w-7 h-7 text-[#d97757]" />
                </div>
                <h3 className={`text-sm font-bold mb-1.5 ${isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'}`}>
                  What shall we design?
                </h3>
                <p className={`text-[11px] leading-relaxed max-w-[240px] mx-auto ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Describe anything — a login page, a dashboard, an animation. I'll build it with HTML, CSS, and JS, and explain every design decision.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-1.5 max-w-[260px] mx-auto">
                  {quickPills.map((pill) => (
                    <button
                      key={pill.text}
                      type="button"
                      onClick={() => handlePill(`Create a ${pill.text.toLowerCase()} design`)}
                      className={`px-2.5 py-2 rounded-xl text-[10px] font-medium border text-left transition-all hover:scale-[1.02] ${
                        isLight
                          ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3] hover:border-[#d97757]/40'
                          : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border-[#3d3831] hover:border-[#d97757]/40'
                      }`}
                    >
                      <span className="mr-1">{pill.icon}</span> {pill.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy turns */}
            {turns.map((turn, idx) => {
              const isActive = idx === activeTurnIndex;
              return (
                <div key={turn.id} className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isLight ? 'bg-[#e2ddd3] text-[#575249]' : 'bg-[#3d3831] text-[#c4bdae]'
                    }`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className={`flex-1 min-w-0 p-3 rounded-2xl rounded-tl-sm border text-xs leading-relaxed ${
                      isLight ? 'bg-white border-[#e6e1d7] text-[#22201d]' : 'bg-[#2a2723] border-[#3d3831] text-[#f4f0ea]'
                    }`}>
                      <p className="break-words">{turn.prompt}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => onSelectTurn(idx)} className="flex items-start gap-2.5 w-full text-left">
                    <div className="w-7 h-7 rounded-full bg-[#d97757] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className={`flex-1 min-w-0 rounded-2xl rounded-tl-sm border overflow-hidden transition-all ${
                      isActive ? 'border-[#d97757] ring-2 ring-[#d97757]/40' : isLight ? 'border-[#e6e1d7] hover:border-[#d97757]/50' : 'border-[#3d3831] hover:border-[#d97757]/50'
                    }`}>
                      <LivePreview html={turn.codeHtml} msgId={`turn-${idx}`} theme={theme} />
                      <div className={`px-3 py-1.5 flex items-center justify-between text-[10px] ${isLight ? 'bg-white text-[#736e65]' : 'bg-[#2a2723] text-[#9e978a]'}`}>
                        <span className="font-mono truncate">{turn.modelUsed}</span>
                        {isActive && <span className="text-[#d97757] font-bold shrink-0 ml-1.5">Viewing</span>}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Conversation messages */}
            {conversationHistory.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === 'user' ? (
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isLight ? 'bg-[#e2ddd3] text-[#575249]' : 'bg-[#3d3831] text-[#c4bdae]'
                    }`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className={`flex-1 min-w-0 px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed ${
                      isLight ? 'bg-[#d97757] text-white' : 'bg-[#d97757] text-white'
                    }`}>
                      <p className="break-words">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#d97757] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className={`flex-1 min-w-0 rounded-2xl rounded-tl-sm border overflow-hidden ${
                      isLight ? 'border-[#e6e1d7] bg-white' : 'border-[#3d3831] bg-[#2a2723]'
                    }`}>
                      {/* Explanation text with markdown */}
                      {msg.text && (
                        <div className={`px-3.5 py-3 ${isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'}`}>
                          {renderMarkdown(msg.text)}
                        </div>
                      )}

                      {/* Live preview */}
                      {msg.code?.html && (
                        <div className="px-3 pb-2">
                          <LivePreview html={msg.code.html} msgId={msg.id} theme={theme} />
                        </div>
                      )}

                      {/* Code tabs */}
                      {msg.code && (msg.code.html || msg.code.css || msg.code.js) && (
                        <div className="px-3 pb-2.5">
                          <CodeBlockTabs code={msg.code} theme={theme} />
                        </div>
                      )}

                      {/* Metadata footer */}
                      <div className={`px-3 py-1.5 flex items-center gap-2 text-[9px] border-t ${
                        isLight ? 'border-[#e6e1d7] text-[#827c70]' : 'border-[#3d3831] text-[#8c8577]'
                      }`}>
                        {msg.modelUsed && <span className="font-mono">{msg.modelUsed}</span>}
                        {msg.tokensEstimate && <span className="ml-auto opacity-60">{msg.tokensEstimate} tokens</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming message */}
            {isStreaming && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#d97757] text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className={`flex-1 min-w-0 rounded-2xl rounded-tl-sm border overflow-hidden ${
                  isLight ? 'border-[#d97757]/50 bg-[#d97757]/5' : 'border-[#d97757]/50 bg-[#d97757]/10'
                }`}>
                  {/* Thinking phase indicator */}
                  {currentPhase && (
                    <div className={`px-3.5 py-2.5 flex items-center gap-2 text-[11px] border-b ${
                      isLight ? 'border-[#e6e1d7]/50 text-[#575249]' : 'border-[#3d3831]/50 text-[#c4bdae]'
                    }`}>
                      {React.createElement(currentPhase.icon, { className: 'w-3.5 h-3.5 animate-spin', style: { color: currentPhase.color } })}
                      <span className="font-medium">{currentPhase.text}</span>
                    </div>
                  )}

                  {/* Streaming text */}
                  {streamingText ? (
                    <div className={`px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'
                    }`}>
                      {renderMarkdown(streamingText)}
                      <span className="inline-block w-1.5 h-3.5 bg-[#d97757] ml-0.5 animate-pulse rounded-sm align-middle" />
                    </div>
                  ) : (
                    <div className="px-3.5 py-4 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#d97757]" />
                      <span className={`text-xs ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>Connecting to AI...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={feedEndRef} />
          </div>
        )}
      </div>

      {/* Quick pills */}
      {sidebarTab === 'chat' && !isStreaming && !hasMessages && (
        <div className="px-3 pt-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3 h-3 text-[#d97757]" />
            <span className={`text-[10px] font-semibold ${isLight ? 'text-[#736e65]' : 'text-[#9e978a]'}`}>Quick Start</span>
          </div>
        </div>
      )}

      {/* Decompose button when there are messages */}
      {sidebarTab === 'chat' && !isStreaming && hasMessages && (
        <div className="px-3 pt-1">
          <button
            type="button"
            onClick={onDecompose}
            className="w-full px-2 py-1.5 rounded-lg text-[10px] font-semibold text-[#d97757] hover:text-[#c66545] border border-[#d97757]/30 hover:border-[#d97757]/60 flex items-center justify-center gap-1.5 transition-all"
          >
            <Layers className="w-3 h-3" /> Decompose into UI Kit
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; if (!isDragOver) setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`p-3.5 border-t space-y-2.5 relative transition-all ${
          isDragOver
            ? 'bg-[#d97757]/15 border-[#d97757] ring-2 ring-[#d97757]'
            : isLight ? 'bg-[#ebe6dc]/60 border-[#e6e1d7]' : 'bg-[#1b1a17]/70 border-[#38342e]'
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
            ref={textareaRef}
            rows={3}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={isStreaming ? "AI is designing..." : hasMessages ? "Say 'make the header blue' or describe changes..." : "Describe what you want to design..."}
            disabled={isStreaming}
            className={`w-full px-3.5 py-2.5 pr-10 rounded-2xl border text-xs leading-relaxed resize-none transition-all ${
              isLight
                ? 'bg-white border-[#ded8cc] focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] text-[#22201d] placeholder-[#9e978a]'
                : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] text-[#f4f0ea] placeholder-[#736e65]'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-3 bottom-3.5 flex items-center gap-1.5 text-[#9e978a]">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) => { const target = e.target as HTMLInputElement; const file = target.files?.[0]; if (file) addAttachment(file); target.value = ''; }}
            />
            <button
              type="button"
              className={`p-1 rounded-lg transition-colors ${attachments.length > 0 ? 'text-[#d97757]' : 'hover:text-[#d97757]'}`}
              title="Attach Wireframe / Screenshot"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="flex items-center gap-2">
            {attachments.map((att) => (
              <div key={att.id} className={`flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-lg border text-[10px] font-medium ${
                isLight ? 'bg-[#d97757]/10 border-[#d97757]/30 text-[#92400e]' : 'bg-[#d97757]/20 border-[#d97757]/40 text-[#e28566]'
              }`}>
                <img src={att.dataUrl} alt={att.name} className="w-6 h-6 rounded object-cover border border-black/10" />
                <span className="max-w-[110px] truncate">{att.name}</span>
                <button type="button" onClick={() => { setAttachments((p) => p.filter((a) => a.id !== att.id)); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-0.5 rounded hover:bg-black/10 text-current">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>Variants</span>
            <div className="flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-white/10">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onVariantCountChange(n)}
                  disabled={isGenerating || isStreaming}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all disabled:opacity-50 ${
                    variantCount === n ? 'bg-[#d97757] text-white shadow-sm' : isLight ? 'text-[#736e65] hover:text-[#22201d]' : 'text-[#9e978a] hover:text-[#f4f0ea]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={(!inputPrompt.trim() && attachments.length === 0) || isStreaming}
            className="px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {isStreaming ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Designing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{hasMessages ? 'Send' : variantCount > 1 ? `Generate ${variantCount}` : 'Design'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </aside>
  );
};
