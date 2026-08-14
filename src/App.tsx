import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { PromptSidebar } from './components/PromptSidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ScreensRail } from './components/ScreensRail';
import { AddScreenModal } from './components/AddScreenModal';
import { PlanAppModal } from './components/PlanAppModal';
import { CodeInspector } from './components/CodeInspector';
import { DecomposeModal } from './components/DecomposeModal';
import { ExportModal } from './components/ExportModal';
import { SessionsDrawer } from './components/SessionsDrawer';
import { DesignSystemModal } from './components/DesignSystemModal';
import { CritiqueModal } from './components/CritiqueModal';
import { ShareModal } from './components/ShareModal';
import { UpdateModal } from './components/UpdateModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { DesignToolsModal } from './components/DesignToolsModal';
import { ComponentLibraryModal } from './components/ComponentLibraryModal';
import { Capacitor } from '@capacitor/core';
import { 
  BYOKConfig, 
  DesignSession, 
  DesignScreen,
  DesignTurn, 
  SavedComponent,
  PreviewDevice, 
  PinComment, 
  UIKitDecomposition,
  AIProvider,
  DesignSystem,
  DesignCritique,
  VersionSnapshot
} from './types';
import { 
  loadBYOKConfig, 
  saveBYOKConfig, 
  loadSessions, 
  saveSessions, 
  getActiveSessionId, 
  setActiveSessionId,
  INITIAL_SAMPLE_HTML,
  loadDesignSystems,
  saveDesignSystems,
  getActiveDesignSystemId,
  setActiveDesignSystemId,
  loadComponentLibrary,
  saveComponentLibrary
} from './lib/storage';
import { generateDesignCode, generateVariants, critiqueDesign } from './lib/ai';
import { getProviderDefinition } from './lib/providers';
import { encodeShareLink, decodeShareHash, clearShareHash } from './lib/share';
import { AppRelease, fetchLatestRelease, getCurrentAppVersion, hasUpdate } from './lib/updater';
import { Smartphone, Sparkles, Code2, Layers, Link2, FolderPlus, X } from 'lucide-react';

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
  const [showDesignSystemModal, setShowDesignSystemModal] = useState(false);
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>(loadDesignSystems);
  const [activeDesignSystemId, setActiveDesignSystemIdState] = useState<string | null>(getActiveDesignSystemId);
  const [showCritiqueModal, setShowCritiqueModal] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<DesignCritique | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDesignTools, setShowDesignTools] = useState(false);
  const [showAddScreenPrompt, setShowAddScreenPrompt] = useState(false);
  const [showPlanApp, setShowPlanApp] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [componentLibrary, setComponentLibrary] = useState<SavedComponent[]>(loadComponentLibrary);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedSession, setSharedSession] = useState<DesignSession | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [latestRelease, setLatestRelease] = useState<AppRelease | null>(null);
  const appVersion = getCurrentAppVersion();
  const [isGenerating, setIsGenerating] = useState(false);
  const [variantCount, setVariantCount] = useState(1);
  const [mobileTab, setMobileTab] = useState<'preview' | 'prompt' | 'code'>('preview');

  // Find active session, and within it, the active screen (a session can
  // now hold multiple named screens - a mobile app concept might have a
  // Login, Home, and Settings screen all living in the same project).
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeScreen = activeSession.screens.find((sc) => sc.id === activeSession.activeScreenId) || activeSession.screens[0];
  const activeTurn = activeScreen.turns[activeScreen.activeTurnIndex] || activeScreen.turns[0];
  const activeDesignSystem = designSystems.find((ds) => ds.id === activeDesignSystemId) || null;

  // Central write path for anything that mutates the active screen's turns -
  // every screen behaves exactly like the old single-design session did, so
  // history/critique/pins/branching all keep working per-screen unchanged.
  const updateActiveScreen = (updater: (screen: DesignScreen) => DesignScreen) => {
    const updatedSessions = sessions.map((s) => {
      if (s.id !== activeSession.id) return s;
      return {
        ...s,
        screens: s.screens.map((sc) => (sc.id === activeScreen.id ? updater(sc) : sc)),
        updatedAt: Date.now(),
      };
    });
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    return updatedSessions;
  };

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

  // Load a shared design from the URL hash (portable share link)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#s=')) return;
    let cancelled = false;
    (async () => {
      const session = await decodeShareHash(hash);
      if (!cancelled && session) {
        setSharedSession(session);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-update check: only inside the native Android app
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    const check = async () => {
      const release = await fetchLatestRelease();
      if (!cancelled && release && hasUpdate(appVersion, release.version)) {
        setLatestRelease(release);
        setShowUpdateModal(true);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [appVersion]);

  const handleSaveBYOK = (newConfig: BYOKConfig) => {
    setByok(newConfig);
    saveBYOKConfig(newConfig);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const def = getProviderDefinition(provider);
    const next = { ...byok, provider, selectedModel: def.defaultModel };
    setByok(next);
    saveBYOKConfig(next);
  };

  const handleModelChange = (model: string) => {
    const next = { ...byok, selectedModel: model };
    setByok(next);
    saveBYOKConfig(next);
  };

  const handleSaveDesignSystems = (systems: DesignSystem[]) => {
    setDesignSystems(systems);
    saveDesignSystems(systems);
  };

  const handleSetActiveDesignSystem = (id: string | null) => {
    setActiveDesignSystemIdState(id);
    setActiveDesignSystemId(id);
  };

  const handleDeleteDesignSystem = (id: string) => {
    const updated = designSystems.filter((ds) => ds.id !== id);
    handleSaveDesignSystems(updated);
    if (activeDesignSystemId === id) {
      handleSetActiveDesignSystem(null);
    }
  };

  const handleSwitchSession = (id: string) => {
    setActiveSessionIdState(id);
    setActiveSessionId(id);
  };

  const handleCreateSession = () => {
    const firstScreen: DesignScreen = {
      id: `screen-${Date.now()}`,
      name: 'Screen 1',
      kind: 'other',
      activeTurnIndex: 0,
      createdAt: Date.now(),
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
    const newSession: DesignSession = {
      id: `session-${Date.now()}`,
      title: `Gia-co-Design #${sessions.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      screens: [firstScreen],
      activeScreenId: firstScreen.id,
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

  const handleGenerate = async (promptText: string, imageDataUrl?: string) => {
    setIsGenerating(true);
    try {
      const currentHtml = activeTurn?.codeHtml || null;
      const activePins = activeTurn?.pins || [];
      const pinComments = activePins.map((p) => ({ x: p.x, y: p.y, comment: p.comment }));

      let html: string;
      let tokensEstimate: number;
      let directions: string[] | undefined;
      const designSystemHtml = activeDesignSystem?.sourceHtml;

      if (variantCount > 1) {
        const results = await generateVariants(promptText, currentHtml, byok, pinComments, variantCount, designSystemHtml, imageDataUrl, previewDevice);
        directions = results.map((r) => r.html);
        html = results[0].html;
        tokensEstimate = results.reduce((acc, r) => acc + r.tokensEstimate, 0);
      } else {
        const result = await generateDesignCode(promptText, currentHtml, byok, pinComments, designSystemHtml, imageDataUrl, previewDevice);
        html = result.html;
        tokensEstimate = result.tokensEstimate;
      }

      const newTurn: DesignTurn = {
        id: `turn-${Date.now()}`,
        role: 'assistant',
        prompt: promptText,
        codeHtml: html,
        directions,
        activeDirection: 0,
        timestamp: Date.now(),
        modelUsed: byok.selectedModel || 'gemini-2.5-flash',
        tokensCost: tokensEstimate,
      };

      const updatedTurns = [...activeScreen.turns, newTurn];
      const newActiveIdx = updatedTurns.length - 1;

      updateActiveScreen((sc) => ({ ...sc, turns: updatedTurns, activeTurnIndex: newActiveIdx }));

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

  const handleCritique = async () => {
    if (!activeTurn?.codeHtml) return;
    setIsCritiquing(true);
    setShowCritiqueModal(true);
    try {
      const result = await critiqueDesign(activeTurn.codeHtml, byok);
      setCritiqueResult(result);
    } catch (e: any) {
      alert(`Critique Error: ${e.message || 'Failed to run critique.'}`);
      setShowCritiqueModal(false);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleFixWithAI = () => {
    setShowCritiqueModal(false);
    if (!critiqueResult || critiqueResult.findings.length === 0) return;
    const fixes = critiqueResult.findings
      .map((f) => `- [${f.severity}] ${f.category}: ${f.title}${f.fix ? ` — ${f.fix}` : ''}`)
      .join('\n');
    handleGenerate(
      `Apply fixes for the following design issues in the current design:\n${fixes}\n\nKeep the overall layout and branding but resolve every listed issue.`
    );
  };

  const handleBuildShareLink = async (): Promise<string> => {
    return encodeShareLink(activeScreen, activeSession.title);
  };

  const handleSaveSharedToDesigns = () => {
    if (!sharedSession) return;
    const imported: DesignSession = {
      ...sharedSession,
      id: `session-${Date.now()}`,
      title: `${sharedSession.title} (imported)`,
      updatedAt: Date.now(),
    };
    const updated = [imported, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    clearShareHash();
    setSharedSession(null);
    handleSwitchSession(imported.id);
  };

  const handleExitSharedView = () => {
    clearShareHash();
    setSharedSession(null);
  };

  const handleAddPin = (pinData: Omit<PinComment, 'id' | 'createdAt'>) => {    const newPin: PinComment = {
      ...pinData,
      id: `pin-${Date.now()}`,
      createdAt: Date.now(),
    };

    const currentPins = activeTurn.pins || [];
    const updatedPins = [...currentPins, newPin];

    updateActiveScreen((sc) => ({
      ...sc,
      turns: sc.turns.map((t, idx) => (idx === sc.activeTurnIndex ? { ...t, pins: updatedPins } : t)),
    }));
  };

  const handleResolvePin = (pinId: string) => {
    const currentPins = activeTurn.pins || [];
    const updatedPins = currentPins.filter((p) => p.id !== pinId);

    updateActiveScreen((sc) => ({
      ...sc,
      turns: sc.turns.map((t, idx) => (idx === sc.activeTurnIndex ? { ...t, pins: updatedPins } : t)),
    }));
  };

  const handleUpdateCode = (newCode: string) => {
    updateActiveScreen((sc) => ({
      ...sc,
      turns: sc.turns.map((t, idx) => {
        if (idx !== sc.activeTurnIndex) return t;
        const directions = t.directions
          ? t.directions.map((d, di) => (di === (t.activeDirection ?? 0) ? newCode : d))
          : undefined;
        return { ...t, codeHtml: newCode, directions };
      }),
    }));
  };

  const handleSelectTurn = (idx: number) => {
    updateActiveScreen((sc) => ({ ...sc, activeTurnIndex: idx }));
  };

  const handleSelectDirection = (directionIdx: number) => {
    const turn = activeScreen.turns[activeScreen.activeTurnIndex];
    if (!turn?.directions || !turn.directions[directionIdx]) return;
    updateActiveScreen((sc) => ({
      ...sc,
      turns: sc.turns.map((t, idx) =>
        idx === sc.activeTurnIndex
          ? { ...t, activeDirection: directionIdx, codeHtml: turn.directions![directionIdx] }
          : t
      ),
    }));
  };

  // --- Multi-screen project management ---
  const handleAddScreen = (name?: string, kind: DesignScreen['kind'] = 'other', initialHtml?: string) => {
    const newScreen: DesignScreen = {
      id: `screen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name?.trim() || `Screen ${activeSession.screens.length + 1}`,
      kind,
      activeTurnIndex: 0,
      createdAt: Date.now(),
      turns: [
        {
          id: `turn-${Date.now()}`,
          role: 'assistant',
          prompt: name ? `Initial: ${name}` : 'New blank screen',
          codeHtml: initialHtml || INITIAL_SAMPLE_HTML,
          timestamp: Date.now(),
          modelUsed: byok.selectedModel || 'gemini-2.5-flash',
        },
      ],
    };
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? { ...s, screens: [...s.screens, newScreen], activeScreenId: newScreen.id, updatedAt: Date.now() }
        : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    return newScreen;
  };

  // Adds many screens at once (from the "Plan App" flow) in a single state
  // update rather than N sequential ones, and switches to the first new
  // screen so the person lands somewhere real, not on whatever was active
  // before they started planning.
  const handleAddScreensBulk = (newScreens: Array<{ name: string; kind: DesignScreen['kind']; html: string }>) => {
    if (newScreens.length === 0) return;
    const built: DesignScreen[] = newScreens.map((ns, i) => ({
      id: `screen-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: ns.name,
      kind: ns.kind,
      activeTurnIndex: 0,
      createdAt: Date.now(),
      turns: [
        {
          id: `turn-${Date.now()}-${i}`,
          role: 'assistant',
          prompt: `Planned screen: ${ns.name}`,
          codeHtml: ns.html,
          timestamp: Date.now(),
          modelUsed: byok.selectedModel || 'gemini-2.5-flash',
        },
      ],
    }));
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? { ...s, screens: [...s.screens, ...built], activeScreenId: built[0].id, updatedAt: Date.now() }
        : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleSelectScreen = (screenId: string) => {
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id ? { ...s, activeScreenId: screenId } : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleRenameScreen = (screenId: string, name: string) => {
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? { ...s, screens: s.screens.map((sc) => (sc.id === screenId ? { ...sc, name } : sc)) }
        : s
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const handleDeleteScreen = (screenId: string) => {
    if (activeSession.screens.length <= 1) return;
    const remaining = activeSession.screens.filter((sc) => sc.id !== screenId);
    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? {
            ...s,
            screens: remaining,
            activeScreenId: s.activeScreenId === screenId ? remaining[0].id : s.activeScreenId,
          }
        : s
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

  // Version history: jump the active session to a given turn (a "version" is
  // either an explicit snapshot or, by default, simply a turn in the session).
  const handleSelectVersion = (turnIndex: number) => {
    handleSelectTurn(turnIndex);
    setShowVersionHistory(false);
  };

  // Branch: fork a *new single-screen session* containing only the turns up
  // to and including turnIndex from the active screen, so the person can
  // explore a different direction from that point without losing the
  // original project. (Branches the one screen being viewed, not the whole
  // multi-screen project - forking an entire project is a bigger feature.)
  const handleCreateBranch = (turnIndex: number) => {
    const sourceTurns = activeScreen.turns.slice(0, turnIndex + 1);
    if (sourceTurns.length === 0) return;
    const branchedScreen: DesignScreen = {
      ...activeScreen,
      id: `screen-${Date.now()}`,
      turns: sourceTurns.map((t) => ({ ...t })),
      activeTurnIndex: sourceTurns.length - 1,
    };
    const branchedSession: DesignSession = {
      ...activeSession,
      id: `session-${Date.now()}`,
      title: `${activeSession.title} (branch)`,
      screens: [branchedScreen],
      activeScreenId: branchedScreen.id,
      parentSessionId: activeSession.id,
      parentTurnIndex: turnIndex,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [branchedSession, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    setActiveSessionIdState(branchedSession.id);
    setActiveSessionId(branchedSession.id);
    setShowVersionHistory(false);
  };

  // Bookmark: turns don't have an explicit VersionSnapshot until the person
  // bookmarks them, at which point we materialize one so it's a durable,
  // named entry in that turn's history rather than a synthetic UI-only row.
  const handleBookmarkVersion = (versionId: string) => {
    updateActiveScreen((sc) => ({
      ...sc,
      turns: sc.turns.map((t, idx) => {
        const existingSnaps = t.versionSnapshots || [];
        const existingIdx = existingSnaps.findIndex((sn) => sn.id === versionId);
        if (existingIdx >= 0) {
          const updatedSnaps = existingSnaps.map((sn, i) =>
            i === existingIdx ? { ...sn, isBookmarked: !sn.isBookmarked } : sn
          );
          return { ...t, versionSnapshots: updatedSnaps };
        }
        if (t.id === versionId) {
          const newSnapshot: VersionSnapshot = {
            id: `snap-${Date.now()}`,
            turnIndex: idx,
            codeHtml: t.codeHtml,
            timestamp: t.timestamp,
            label: `Turn ${idx + 1}`,
            isBookmarked: true,
          };
          return { ...t, versionSnapshots: [...existingSnaps, newSnapshot] };
        }
        return t;
      }),
    }));
  };

  const handleDeleteVersion = (versionId: string) => {
    updateActiveScreen((sc) => ({
      ...sc,
      turns: sc.turns.map((t) => ({
        ...t,
        versionSnapshots: (t.versionSnapshots || []).filter((sn) => sn.id !== versionId),
      })),
    }));
  };

  // Design Tools "Use as New Design": push a generated standalone component
  // as a fresh turn, same path real generations take.
  const handleInsertComponent = (html: string, label: string) => {
    const newTurn: DesignTurn = {
      id: `turn-${Date.now()}`,
      role: 'assistant',
      prompt: `Custom component: ${label}`,
      codeHtml: html,
      activeDirection: 0,
      timestamp: Date.now(),
      modelUsed: byok.selectedModel || 'gemini-2.5-flash',
      tokensCost: 0,
    };
    const updatedTurns = [...activeScreen.turns, newTurn];
    const newActiveIdx = updatedTurns.length - 1;
    updateActiveScreen((sc) => ({ ...sc, turns: updatedTurns, activeTurnIndex: newActiveIdx }));
    setShowDesignTools(false);
    if (window.innerWidth < 1024) setMobileTab('preview');
  };

  // --- Component Library ---
  const handleSaveToLibrary = (html: string, name: string, category: 'component' | 'motion' | 'other') => {
    const entry: SavedComponent = {
      id: `saved-${Date.now()}`,
      name: name.trim() || 'Untitled',
      codeHtml: html,
      tags: [],
      category,
      createdAt: Date.now(),
    };
    const updated = [entry, ...componentLibrary];
    setComponentLibrary(updated);
    saveComponentLibrary(updated);
  };

  const handleDeleteFromLibrary = (id: string) => {
    const updated = componentLibrary.filter((c) => c.id !== id);
    setComponentLibrary(updated);
    saveComponentLibrary(updated);
  };

  const handleInsertFromLibrary = (html: string, name: string) => {
    handleInsertComponent(html, name);
    setShowComponentLibrary(false);
  };

  const totalTokens = activeScreen.turns.reduce((acc, t) => acc + (t.tokensCost || 0), 0);
  const sharedTurn = sharedSession
    ? (sharedSession.screens?.[0]?.turns[sharedSession.screens[0].activeTurnIndex] || sharedSession.screens?.[0]?.turns[0])
    : undefined;

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
        onOpenShare={() => setShowShareModal(true)}
        onOpenDesignSystems={() => setShowDesignSystemModal(true)}
        onOpenVersionHistory={() => setShowVersionHistory(true)}
        onOpenDesignTools={() => setShowDesignTools(true)}
        onOpenComponentLibrary={() => setShowComponentLibrary(true)}
        activeDesignSystemName={activeDesignSystem?.name ?? null}
        theme={theme}
        onToggleTheme={toggleTheme}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
      />

      {/* Main Workspace Stage */}
      {sharedSession && sharedTurn ? (
        /* Read-Only Shared Design View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 z-20 shrink-0 ${
            isLight
              ? 'bg-gradient-to-r from-[#d97757]/15 to-transparent border-[#e6e1d7]'
              : 'bg-gradient-to-r from-[#d97757]/25 to-transparent border-[#38342e]'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <Link2 className="w-4 h-4 text-[#d97757] shrink-0" />
              <span className={`text-xs font-medium truncate ${isLight ? 'text-[#92400e]' : 'text-[#e28566]'}`}>
                Read-only shared design · {sharedSession.title}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveSharedToDesigns}
                className="px-3 py-1.5 rounded-lg bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Save to My Designs
              </button>
              <button
                onClick={handleExitSharedView}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                    : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
                }`}
                title="Exit shared view"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <PreviewCanvas
              codeHtml={sharedTurn.codeHtml}
              previewDevice={previewDevice}
              pins={sharedTurn.pins || []}
              onAddPin={() => {}}
              onResolvePin={() => {}}
              onTweakPrompt={() => {}}
              isGenerating={false}
              directions={sharedTurn.directions}
              activeDirection={sharedTurn.activeDirection ?? 0}
              readOnly
              theme={theme}
            />
          </div>
        </div>
      ) : (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ScreensRail
          screens={activeSession.screens}
          activeScreenId={activeSession.activeScreenId}
          onSelectScreen={handleSelectScreen}
          onAddScreen={() => setShowAddScreenPrompt(true)}
          onPlanApp={() => setShowPlanApp(true)}
          onRenameScreen={handleRenameScreen}
          onDeleteScreen={handleDeleteScreen}
          theme={theme}
        />
        <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop / Large Screen Split View */}
        <div className="hidden lg:flex w-full h-full">
          <PromptSidebar
            turns={activeScreen.turns}
            activeTurnIndex={activeScreen.activeTurnIndex}
            onSelectTurn={handleSelectTurn}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onDecompose={() => setShowDecomposeModal(true)}
            tokenCount={totalTokens}
            variantCount={variantCount}
            onVariantCountChange={setVariantCount}
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
            directions={activeTurn.directions}
            activeDirection={activeTurn.activeDirection ?? 0}
            onSelectDirection={handleSelectDirection}
            onCritique={handleCritique}
            isCritiquing={isCritiquing}
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
                directions={activeTurn.directions}
                activeDirection={activeTurn.activeDirection ?? 0}
                onSelectDirection={handleSelectDirection}
                onCritique={handleCritique}
                isCritiquing={isCritiquing}
                theme={theme}
              />
            )}
            {mobileTab === 'prompt' && (
              <PromptSidebar
                turns={activeScreen.turns}
                activeTurnIndex={activeScreen.activeTurnIndex}
                onSelectTurn={handleSelectTurn}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onDecompose={() => setShowDecomposeModal(true)}
                tokenCount={totalTokens}
                variantCount={variantCount}
                onVariantCountChange={setVariantCount}
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
      </div>
      )}

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
        previewDevice={previewDevice}
        theme={theme}
      />
      <DesignSystemModal
        isOpen={showDesignSystemModal}
        onClose={() => setShowDesignSystemModal(false)}
        designSystems={designSystems}
        activeId={activeDesignSystemId}
        onSaveSystems={handleSaveDesignSystems}
        onSetActive={handleSetActiveDesignSystem}
        onDelete={handleDeleteDesignSystem}
        theme={theme}
      />
      <CritiqueModal
        isOpen={showCritiqueModal}
        onClose={() => setShowCritiqueModal(false)}
        critique={critiqueResult}
        isCritiquing={isCritiquing}
        onFixWithAI={handleFixWithAI}
        theme={theme}
      />
      {showVersionHistory && (
        <VersionHistoryModal
          session={activeScreen}
          sessionTitle={`${activeSession.title} · ${activeScreen.name}`}
          currentTurnIndex={activeScreen.activeTurnIndex}
          onClose={() => setShowVersionHistory(false)}
          onSelectVersion={handleSelectVersion}
          onCreateBranch={handleCreateBranch}
          onBookmarkVersion={handleBookmarkVersion}
          onDeleteVersion={handleDeleteVersion}
          theme={theme}
        />
      )}
      <DesignToolsModal
        isOpen={showDesignTools}
        onClose={() => setShowDesignTools(false)}
        sourceHtml={activeTurn?.codeHtml || null}
        byok={byok}
        designSystemHtml={activeDesignSystem?.sourceHtml}
        previewDevice={previewDevice}
        theme={theme}
        onInsertComponent={handleInsertComponent}
        onSaveToLibrary={handleSaveToLibrary}
      />
      <ComponentLibraryModal
        isOpen={showComponentLibrary}
        onClose={() => setShowComponentLibrary(false)}
        components={componentLibrary}
        onDelete={handleDeleteFromLibrary}
        onInsert={handleInsertFromLibrary}
        theme={theme}
      />
      <AddScreenModal
        isOpen={showAddScreenPrompt}
        onClose={() => setShowAddScreenPrompt(false)}
        onCreateBlank={(name, kind) => {
          handleAddScreen(name, kind);
          setShowAddScreenPrompt(false);
        }}
        onCreateGenerated={(name, kind, html) => {
          handleAddScreen(name, kind, html);
          setShowAddScreenPrompt(false);
        }}
        byok={byok}
        previewDevice={previewDevice}
        designSystemHtml={activeDesignSystem?.sourceHtml}
      />
      <PlanAppModal
        isOpen={showPlanApp}
        onClose={() => setShowPlanApp(false)}
        onScreensReady={handleAddScreensBulk}
        byok={byok}
        previewDevice={previewDevice}
        designSystemHtml={activeDesignSystem?.sourceHtml}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onBuildLink={handleBuildShareLink}
        theme={theme}
      />
      <UpdateModal
        isOpen={showUpdateModal}
        currentVersion={appVersion}
        release={latestRelease}
        onClose={() => setShowUpdateModal(false)}
        onRetry={() => {
          fetchLatestRelease().then((release) => {
            if (release && hasUpdate(appVersion, release.version)) {
              setLatestRelease(release);
            }
            setShowUpdateModal(true);
          });
        }}
        theme={theme}
      />
    </div>
  );
}
