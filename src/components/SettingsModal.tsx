import React, { useState, useEffect, useCallback } from 'react';
import { X, Key, HelpCircle, RefreshCw, Sparkles, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BYOKConfig, AIProvider } from '../types';
import { fetchLiveModels } from '../lib/ai';
import {
  PROVIDER_LIST,
  getProviderDefinition,
  getCuratedModels,
  getCachedModels,
  isKeyConfigured,
} from '../lib/providers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  byok: BYOKConfig;
  onSave: (newConfig: BYOKConfig) => void;
  theme?: 'light' | 'dark';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  byok,
  onSave,
  theme = 'light',
}) => {
  const [config, setConfig] = useState<BYOKConfig>(byok);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<{ value: string; label: string }[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(byok);
      setSavedSuccess(false);
      setFetchedModels(getCachedModels(byok) || []);
      setFetchError(null);
    }
  }, [isOpen, byok]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const refreshModels = useCallback(async (cfg: BYOKConfig) => {
    setIsFetchingModels(true);
    setFetchError(null);
    try {
      const liveModels = await fetchLiveModels(cfg);
      if (liveModels.length > 0) {
        setFetchedModels(liveModels);
      } else {
        setFetchError('No live models returned by provider API.');
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Could not fetch live models. Check API key/URL or CORS.');
    } finally {
      setIsFetchingModels(false);
    }
  }, []);

  const handleFetchModels = () => {
    refreshModels(config);
  };

  const handleProviderChange = (pId: AIProvider) => {
    const def = getProviderDefinition(pId);
    const next = { ...config, provider: pId, selectedModel: def.defaultModel };
    setConfig(next);
    setFetchError(null);
    setFetchedModels(getCachedModels(next) || []);
    if (isKeyConfigured(next, pId)) {
      refreshModels(next);
    }
  };

  const getActiveKeyStatus = () => {
    switch (config.provider) {
      case 'gemini':
        return config.geminiApiKey ? { ready: true, text: 'Gemini API Key Saved' } : { ready: false, text: 'Gemini API Key Required' };
      case 'openrouter':
        return config.openrouterApiKey ? { ready: true, text: 'OpenRouter API Key Saved' } : { ready: false, text: 'OpenRouter API Key Required' };
      case 'opencodezen':
        return config.opencodezenApiKey ? { ready: true, text: 'OpenCode Zen API Key Saved' } : { ready: false, text: 'OpenCode Zen API Key Required' };
      case 'openai':
        return config.openaiApiKey ? { ready: true, text: 'OpenAI API Key Saved' } : { ready: false, text: 'OpenAI API Key Required' };
      case 'anthropic':
        return config.anthropicApiKey ? { ready: true, text: 'Anthropic API Key Saved' } : { ready: false, text: 'Anthropic API Key Required' };
      case 'groq':
        return config.groqApiKey ? { ready: true, text: 'Groq API Key Saved' } : { ready: false, text: 'Groq API Key Required' };
      case 'deepseek':
        return config.deepseekApiKey ? { ready: true, text: 'DeepSeek API Key Saved' } : { ready: false, text: 'DeepSeek API Key Required' };
      case 'mistral':
        return config.mistralApiKey ? { ready: true, text: 'Mistral API Key Saved' } : { ready: false, text: 'Mistral API Key Required' };
      case 'together':
        return config.togetherApiKey ? { ready: true, text: 'Together API Key Saved' } : { ready: false, text: 'Together API Key Required' };
      case 'xai':
        return config.xaiApiKey ? { ready: true, text: 'xAI API Key Saved' } : { ready: false, text: 'xAI API Key Required' };
      case 'ollama':
        return { ready: true, text: 'Ollama Local Endpoint Configured' };
      case 'custom':
        return config.customApiKey ? { ready: true, text: 'Custom Key Saved' } : { ready: false, text: 'Custom API Key Recommended' };
      default:
        return { ready: false, text: 'No API Key Saved' };
    }
  };

  const status = getActiveKeyStatus();

  const handleSave = () => {
    onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const providersList = PROVIDER_LIST;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Gia-co-Design AI Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Mobile BYOK Notice */}
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            isLight
              ? 'bg-[#d97757]/10 border-[#d97757]/30 text-[#92400e]'
              : 'bg-[#d97757]/20 border-[#d97757]/40 text-[#e28566]'
          }`}>
            <HelpCircle className="w-4 h-4 text-[#d97757] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Device BYOK Client Mode</strong>
              Your API keys stay stored securely in your browser's <code>localStorage</code>.
            </div>
          </div>

          {/* Provider Selector */}
          <div className="space-y-2">
            <label className={`block text-xs font-semibold uppercase tracking-wider ${
              isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
            }`}>
              Select AI Provider ({providersList.length} Supported)
            </label>
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-xl border ${
              isLight ? 'bg-[#f0e9dd] border-[#e6e1d7]' : 'bg-[#181715] border-[#38342e]'
            }`}>
              {providersList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-left flex flex-col justify-between ${
                    config.provider === p.id
                      ? 'bg-[#d97757] text-white border-[#c66545] shadow-sm'
                      : isLight
                      ? 'bg-white hover:bg-[#f7f4ec] text-[#575249] border-[#e2ddd3]'
                      : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border-[#3d3831]'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  <span className="text-[10px] opacity-75 font-normal truncate">
                    {p.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Provider Key Status Indicator */}
          <div className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            status.ready
              ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              {status.ready ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
              <span>{status.text}</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10">{config.provider}</span>
          </div>

          {/* API Key Fields */}
          {config.provider === 'gemini' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Google Gemini API Key</label>
              <input
                type="password"
                value={config.geminiApiKey}
                onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
              <p className="text-[11px] text-gray-500">Get your key from Google AI Studio (ai.google.dev).</p>
            </div>
          )}

          {config.provider === 'openai' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">OpenAI API Key</label>
              <input
                type="password"
                value={config.openaiApiKey}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                placeholder="sk-proj-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'anthropic' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Anthropic API Key</label>
              <input
                type="password"
                value={config.anthropicApiKey}
                onChange={(e) => setConfig({ ...config, anthropicApiKey: e.target.value })}
                placeholder="sk-ant-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'groq' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Groq API Key</label>
              <input
                type="password"
                value={config.groqApiKey}
                onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'deepseek' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">DeepSeek API Key</label>
              <input
                type="password"
                value={config.deepseekApiKey}
                onChange={(e) => setConfig({ ...config, deepseekApiKey: e.target.value })}
                placeholder="sk-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'mistral' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Mistral AI API Key</label>
              <input
                type="password"
                value={config.mistralApiKey}
                onChange={(e) => setConfig({ ...config, mistralApiKey: e.target.value })}
                placeholder="api-key-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'together' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Together AI API Key</label>
              <input
                type="password"
                value={config.togetherApiKey}
                onChange={(e) => setConfig({ ...config, togetherApiKey: e.target.value })}
                placeholder="together-api-key-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'xai' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">xAI (Grok) API Key</label>
              <input
                type="password"
                value={config.xaiApiKey}
                onChange={(e) => setConfig({ ...config, xaiApiKey: e.target.value })}
                placeholder="xai-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'openrouter' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">OpenRouter API Key</label>
              <input
                type="password"
                value={config.openrouterApiKey}
                onChange={(e) => setConfig({ ...config, openrouterApiKey: e.target.value })}
                placeholder="sk-or-v1-..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'opencodezen' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium">OpenCode Zen API Key</label>
                <input
                  type="password"
                  value={config.opencodezenApiKey}
                  onChange={(e) => setConfig({ ...config, opencodezenApiKey: e.target.value })}
                  placeholder="cz-..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                    isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium">OpenCode Zen Base URL (Optional Override)</label>
                <input
                  type="text"
                  value={config.opencodezenBaseUrl}
                  onChange={(e) => setConfig({ ...config, opencodezenBaseUrl: e.target.value })}
                  placeholder="https://opencodezen.com/v1"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                    isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                  }`}
                />
              </div>
            </div>
          )}

          {config.provider === 'ollama' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium">Local Ollama Base URL</label>
              <input
                type="text"
                value={config.ollamaBaseUrl}
                onChange={(e) => setConfig({ ...config, ollamaBaseUrl: e.target.value })}
                placeholder="http://localhost:11434/v1"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              />
            </div>
          )}

          {config.provider === 'custom' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium">Custom Base URL</label>
                <input
                  type="text"
                  value={config.customBaseUrl}
                  onChange={(e) => setConfig({ ...config, customBaseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                    isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium">Custom API Key</label>
                <input
                  type="password"
                  value={config.customApiKey}
                  onChange={(e) => setConfig({ ...config, customApiKey: e.target.value })}
                  placeholder="sk-custom..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                    isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Model Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`block text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
              }`}>
                Selected Model
              </label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={isFetchingModels}
                className="text-[11px] text-[#d97757] hover:text-[#c66545] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                <span>{isFetchingModels ? 'Fetching...' : 'Fetch Live Models'}</span>
              </button>
            </div>

            {config.provider === 'custom' ? (
              <>
                <input
                  list="gia-model-list"
                  value={config.selectedModel}
                  onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                  placeholder="Type a model name (freeform)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono-claude focus:outline-none focus:border-[#d97757] ${
                    isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                  }`}
                />
                <datalist id="gia-model-list">
                  {[...fetchedModels, ...getCuratedModels(config.provider)].map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </datalist>
              </>
            ) : (
              <select
                value={config.selectedModel}
                onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                }`}
              >
                {fetchedModels.length > 0 ? (
                  <optgroup label="Live Models (fetched from provider)">
                    {fetchedModels.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Curated Fallback">
                  {getCuratedModels(config.provider).map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}

            {fetchError && (
              <p className="text-[11px] text-amber-600 font-mono mt-1">
                ⚠️ {fetchError}
              </p>
            )}
            {fetchedModels.length > 0 && (
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-[#d97757]" /> Loaded {fetchedModels.length} models dynamically from provider endpoint!
              </p>
            )}
          </div>

          {/* System Prompt Customizer */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-semibold uppercase tracking-wider ${
              isLight ? 'text-[#736e65]' : 'text-[#9e978a]'
            }`}>
              System Designer Prompt
            </label>
            <textarea
              rows={3}
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed resize-none font-mono-claude focus:outline-none focus:border-[#d97757] ${
                isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
              }`}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700 transition-colors text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

