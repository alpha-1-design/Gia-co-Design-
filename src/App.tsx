import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { PromptSidebar } from './components/PromptSidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { CodeInspector } from './components/CodeInspector';
import { DecomposeModal } from './components/DecomposeModal';
import { ExportModal } from './components/ExportModal';
import { SessionsDrawer } from './components/SessionsDrawer';
import { 
  BYOKConfig, 
  DesignSession, 
  DesignTurn, 
  PreviewDevice, 
  PinComment, 
  UIKitDecomposition 
} from './types';
import { 
  loadBYOKConfig, 
  saveBYOKConfig, 
  loadSessions, 
  saveSessions, 
  getActiveSessionId, 
  setActiveSessionId,
  INITIAL_SAMPLE_HTML
} from './lib/storage';
import { generateDesignCode } from './lib/ai';
import { Smartphone, Sparkles, Code2, Layers } from 'lucide-react';

export default function App() {
  const [byok, setByok] = useState<BYOKConfig>(loadBYOKConfig);
  const [sessions, setSessions] = useState<DesignSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionIdState] = useState<string>(getActiveSessionId);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('mobile');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const [showCodeInspector, setShowCodeInspector] = useState(false);
  const [showDecomposeModal, setShowDecomposeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'preview' | 'prompt' | 'code'>('preview');

  // Find active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeTurn = activeSession.turns[activeSession.activeTurnIndex] || activeSession.turns[0];

  // Auto-open settings if no API keys configured
  useEffect(() => {
    const hasAnyKey = Boolean(
      byok.geminiApiKey ||
      byok.openrouterApiKey ||
      byok.openaiApiKey ||
      byok.anthropicApiKey ||
      byok.groqApiKey ||
      byok.deepseekApiKey ||
      byok.mistralApiKey ||
      byok.togetherApiKey ||
      byok.xaiApiKey ||
      byok.customApiKey ||
      byok.provider === 'ollama'
    );
    if (!hasAnyKey) {
      setShowSettings(true);
    }
  }, []);

  const handleSaveBYOK = (newConfig: BYOKConfig) => {
    setByok(newConfig);
    saveBYOKConfig(newConfig);
  };

  const handleSwitchSession = (id: string) => {
    setActiveSessionIdState(id);
    setActiveSessionId(id);
  };

  const handleCreateSession = () => {
    const newSession: DesignSession = {
      id: `session-${Date.now()}`,
      title: `Gia-co-Design #${sessions.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activeTurnIndex: 0,
      turns: [
        {
          id: `turn-${Date.now()}`,
          role: 'assistant',
          prompt: 'Initial Gia-co-Design Workspace',
          codeHtml: INITIAL_SAMPLE_HTML,
          timestamp: Date.now(),
          modelUsed: byok.selectedModel || 'gemini-2.5-flash',
          tokensCost: 350,
        },
      ],
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    handleSwitchSession(newSession.id);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s));
    setSessions(updated);
    saveSessions(updated);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    if (activeSessionId === id) {
      handleSwitchSession(updated[0].id);
    }
  };

  const handleGenerate = async (promptText: string) => {
    setIsGenerating(true);
    try {
      const currentHtml = activeTurn?.codeHtml || null;
      const activePins = activeTurn?.pins || [];

      const { html, tokensEstimate } = await generateDesignCode(
        promptText,
        currentHtml,
        byok,
        activePins.map((p) => ({ x: p.x, y: p.y, comment: p.comment }))
      );

      const newTurn: DesignTurn = {
        id: `turn-${Date.now()}`,
        role: 'assistant',
        prompt: promptText,
        codeHtml: html,
        timestamp: Date.now(),
        modelUsed: byok.selectedModel || 'gemini-2.5-flash',
        tokensCost: tokensEstimate,
      };

      const updatedTurns = [...activeSession.turns, newTurn];
      const newActiveIdx = updatedTurns.length - 1;

      const updatedSessions = sessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              turns: updatedTurns,
              activeTurnIndex: newActiveIdx,
              updatedAt: Date.now(),
            }
          : s
      );

      setSessions(updatedSessions);
      saveSessions(updatedSessions);

      if (window.innerWidth < 1024) {
        setMobileTab('preview');
      }
    } catch (e: any) {
      alert(`Generation Error: ${e.message || 'Check your API Key in Settings.'}`);
      setShowSettings(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddPin = (pinData: Omit<PinComment, 'id' | 'createdAt'>) => {
    const newPin: PinComment = {
      ...pinData,
      id: `pin-${Date.now()}`,
      createdAt: Date.now(),
    };

    const currentPins = activeTurn.pins || [];
    const updatedPins = [...currentPins, newPin];

    const updatedTurns = activeSession.turns.map((t, idx) =>
      idx === activeSession.activeTurnIndex ? { ...t, pins: updatedPins } : t
    );

    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, turns: updatedTurns } : s
    );

    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleResolvePin = (pinId: string) => {
    const currentPins = activeTurn.pins || [];
    const updatedPins = currentPins.filter((p) => p.id !== pinId);

    const updatedTurns = activeSession.turns.map((t, idx) =>
      idx === activeSession.activeTurnIndex ? { ...t, pins: updatedPins } : t
    );

    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, turns: updatedTurns } : s
    );

    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleUpdateCode = (newCode: string) => {
    const updatedTurns = activeSession.turns.map((t, idx) =>
      idx === activeSession.activeTurnIndex ? { ...t, codeHtml: newCode } : t
    );

    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, turns: updatedTurns } : s
    );

    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleSelectTurn = (idx: number) => {
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, activeTurnIndex: idx } : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleUIKitGenerated = (kit: UIKitDecomposition) => {
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, uiKit: kit } : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const totalTokens = activeSession.turns.reduce((acc, t) => acc + (t.tokensCost || 0), 0);

  const isLight = theme === 'light';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none transition-colors ${
      isLight ? 'bg-[#faf8f5] text-[#22201d]' : 'bg-[#181715] text-[#f4f0ea]'
    }`}>
      {/* Header Bar */}
      <Header
        sessionTitle={activeSession.title}
        byok={byok}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        showCodeInspector={showCodeInspector}
        setShowCodeInspector={setShowCodeInspector}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSessions={() => setShowSessionsDrawer(true)}
        onOpenDecompose={() => setShowDecomposeModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop / Large Screen Split View */}
        <div className="hidden lg:flex w-full h-full">
          <PromptSidebar
            turns={activeSession.turns}
            activeTurnIndex={activeSession.activeTurnIndex}
            onSelectTurn={handleSelectTurn}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onDecompose={() => setShowDecomposeModal(true)}
            tokenCount={totalTokens}
            theme={theme}
          />
          <PreviewCanvas
            codeHtml={activeTurn.codeHtml}
            previewDevice={previewDevice}
            pins={activeTurn.pins || []}
            onAddPin={handleAddPin}
            onResolvePin={handleResolvePin}
            onTweakPrompt={handleGenerate}
            isGenerating={isGenerating}
            theme={theme}
          />
          {showCodeInspector && (
            <CodeInspector
              isOpen={showCodeInspector}
              onClose={() => setShowCodeInspector(false)}
              codeHtml={activeTurn.codeHtml}
              uiKit={activeSession.uiKit}
              onUpdateCode={handleUpdateCode}
              theme={theme}
            />
          )}
        </div>

        {/* Mobile / Android Responsive View with Bottom Tabs */}
        <div className="flex lg:hidden w-full h-full flex-col">
          <div className="flex-1 overflow-hidden relative">
            {mobileTab === 'preview' && (
              <PreviewCanvas
                codeHtml={activeTurn.codeHtml}
                previewDevice={previewDevice}
                pins={activeTurn.pins || []}
                onAddPin={handleAddPin}
                onResolvePin={handleResolvePin}
                onTweakPrompt={handleGenerate}
                isGenerating={isGenerating}
                theme={theme}
              />
            )}
            {mobileTab === 'prompt' && (
              <PromptSidebar
                turns={activeSession.turns}
                activeTurnIndex={activeSession.activeTurnIndex}
                onSelectTurn={handleSelectTurn}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onDecompose={() => setShowDecomposeModal(true)}
                tokenCount={totalTokens}
                theme={theme}
              />
            )}
            {mobileTab === 'code' && (
              <CodeInspector
                isOpen={true}
                onClose={() => setMobileTab('preview')}
                codeHtml={activeTurn.codeHtml}
                uiKit={activeSession.uiKit}
                onUpdateCode={handleUpdateCode}
                theme={theme}
              />
            )}
          </div>

          {/* Bottom Mobile Tab Navigation Bar */}
          <nav className={`h-14 border-t flex items-center justify-around z-30 shrink-0 transition-colors ${
            isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#22201d] border-[#38342e]'
          }`}>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                mobileTab === 'preview' ? 'text-[#d97757] font-bold' : isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setMobileTab('prompt')}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                mobileTab === 'prompt' ? 'text-[#d97757] font-bold' : isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Agent Prompt</span>
            </button>
            <button
              onClick={() => setMobileTab('code')}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                mobileTab === 'code' ? 'text-[#d97757] font-bold' : isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code Inspector</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        byok={byok}
        onSave={handleSaveBYOK}
        theme={theme}
      />
      <SessionsDrawer
        isOpen={showSessionsDrawer}
        onClose={() => setShowSessionsDrawer(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSwitchSession}
        onCreateSession={handleCreateSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        theme={theme}
      />
      <DecomposeModal
        isOpen={showDecomposeModal}
        onClose={() => setShowDecomposeModal(false)}
        codeHtml={activeTurn.codeHtml}
        byok={byok}
        uiKit={activeSession.uiKit}
        onUIKitGenerated={handleUIKitGenerated}
        theme={theme}
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        codeHtml={activeTurn.codeHtml}
        activeSession={activeSession}
        uiKit={activeSession.uiKit}
        theme={theme}
      />
    </div>
  );
}
