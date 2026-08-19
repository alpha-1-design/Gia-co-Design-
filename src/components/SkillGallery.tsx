import React, { useState, useCallback } from 'react';
import {
  X,
  Search,
  Zap,
  Download,
  Upload,
  Plus,
  Copy,
  Trash2,
  Check,
  ExternalLink,
  Pencil,
  Star,
  Wand2,
  Users,
  Sparkles,
} from 'lucide-react';
import { DesignSkill } from '../types';
import {
  getAllSkills,
  getActiveSkill,
  setActiveSkill,
  addCustomSkill,
  removeCustomSkill,
  duplicateSkill,
  exportSkillAsUrl,
  importSkillFromUrl,
  importSkillFromCurrentUrl,
} from '../lib/skills';

interface SkillGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  /** Called when a skill is activated — so App can inject systemPrompt into AI calls */
  onSkillActivated?: (skill: DesignSkill | null) => void;
}

export const SkillGallery: React.FC<SkillGalleryProps> = ({
  isOpen,
  onClose,
  theme,
  onSkillActivated,
}) => {
  const isLight = theme === 'light';

  const [skills, setSkills] = useState<DesignSkill[]>(() => getAllSkills());
  const [activeSkill, setActiveSkillState] = useState<DesignSkill | null>(() => getActiveSkill());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportUrl, setShowImportUrl] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState('');

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newIcon, setNewIcon] = useState('🎨');
  const [newSystemPrompt, setNewSystemPrompt] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories = ['All', ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = skills.filter((skill) => {
    const matchCat = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleActivate = useCallback(
    (skill: DesignSkill) => {
      if (activeSkill?.id === skill.id) {
        // Deactivate
        setActiveSkillState(null);
        setActiveSkill(null);
        onSkillActivated?.(null);
      } else {
        setActiveSkillState(skill);
        setActiveSkill(skill);
        onSkillActivated?.(skill);
      }
    },
    [activeSkill, onSkillActivated]
  );

  const handleCreateSkill = useCallback(() => {
    if (!newName.trim() || !newSystemPrompt.trim()) return;
    const skill: DesignSkill = {
      id: `skill-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim(),
      category: newCategory.trim() || 'Custom',
      icon: newIcon,
      systemPrompt: newSystemPrompt.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      author: 'Custom',
      version: '1.0.0',
      downloads: 0,
      createdAt: Date.now(),
      isBuiltin: false,
    };
    addCustomSkill(skill);
    setSkills(getAllSkills());
    setShowCreateForm(false);
    setNewName('');
    setNewDescription('');
    setNewCategory('Custom');
    setNewIcon('🎨');
    setNewSystemPrompt('');
    setNewTags('');
  }, [newName, newDescription, newCategory, newIcon, newSystemPrompt, newTags]);

  const handleDelete = useCallback(
    (id: string) => {
      removeCustomSkill(id);
      setSkills(getAllSkills());
      const active = getActiveSkill();
      setActiveSkillState(active);
      onSkillActivated?.(active);
    },
    [onSkillActivated]
  );

  const handleDuplicate = useCallback((id: string) => {
    duplicateSkill(id);
    setSkills(getAllSkills());
  }, []);

  const handleExport = useCallback(async (skill: DesignSkill) => {
    try {
      const url = await exportSkillAsUrl(skill);
      await navigator.clipboard.writeText(url);
      setCopiedId(skill.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Export failed:', err);
    }
  }, []);

  const handleImportUrl = useCallback(async () => {
    if (!importUrl.trim()) return;
    setImportMessage('');
    try {
      const skill = await importSkillFromUrl(importUrl.trim());
      if (skill) {
        setSkills(getAllSkills());
        setImportMessage(`✓ Imported "${skill.name}" successfully!`);
        setImportUrl('');
        setTimeout(() => {
          setShowImportUrl(false);
          setImportMessage('');
        }, 1500);
      } else {
        setImportMessage('✗ Invalid skill URL. Make sure it starts with #skill=');
      }
    } catch {
      setImportMessage('✗ Failed to import. The URL may be corrupted.');
    }
  }, [importUrl]);

  const handleImportFromCurrentUrl = useCallback(async () => {
    const skill = await importSkillFromCurrentUrl();
    if (skill) {
      setSkills(getAllSkills());
      setImportMessage(`✓ Imported "${skill.name}" from URL!`);
      setTimeout(() => setImportMessage(''), 2000);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]'
            : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Design Skills</h2>
            {activeSkill && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d97757] text-white font-bold">
                ACTIVE: {activeSkill.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleImportFromCurrentUrl();
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                isLight
                  ? 'hover:bg-[#ebe6dc] text-[#575249]'
                  : 'hover:bg-[#332f2a] text-[#b3ac9f]'
              }`}
              title="Import from URL"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowImportUrl(!showImportUrl)}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                isLight
                  ? 'hover:bg-[#ebe6dc] text-[#575249]'
                  : 'hover:bg-[#332f2a] text-[#b3ac9f]'
              }`}
              title="Import via URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                showCreateForm
                  ? 'bg-[#d97757] text-white'
                  : isLight
                  ? 'bg-white hover:bg-[#f4f0e8] text-[#575249] border border-[#ded8cc]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border border-[#3d3831]'
              }`}
            >
              <Plus className="w-3 h-3" />
              Create Skill
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Import URL bar */}
        {showImportUrl && (
          <div
            className={`px-5 py-3 border-b shrink-0 ${
              isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste a skill share URL..."
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
                  isLight
                    ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                    : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
              />
              <button
                onClick={handleImportUrl}
                className="px-3 py-1.5 rounded-lg bg-[#d97757] text-white text-xs font-semibold"
              >
                Import
              </button>
            </div>
            {importMessage && (
              <p className={`text-xs mt-1.5 ${importMessage.startsWith('✓') ? 'text-emerald-500' : 'text-red-400'}`}>
                {importMessage}
              </p>
            )}
          </div>
        )}

        {/* Create form */}
        {showCreateForm && (
          <div
            className={`px-5 py-4 border-b shrink-0 space-y-3 ${
              isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
            }`}
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                  Skill Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Custom Skill"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isLight
                      ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                      : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                  Category
                </label>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Custom"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isLight
                      ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                      : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                  Icon (emoji)
                </label>
                <input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="🎨"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isLight
                      ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                      : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                Description
              </label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What this skill is good at..."
                className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                  isLight
                    ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                    : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                }`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                System Prompt (AI expertise instructions)
              </label>
              <textarea
                value={newSystemPrompt}
                onChange={(e) => setNewSystemPrompt(e.target.value)}
                placeholder="You are an expert in... When generating designs, follow these rules..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border text-xs resize-none ${
                  isLight
                    ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                    : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma-separated: dashboard, charts, SaaS)"
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
                  isLight
                    ? 'bg-white border-[#ded8cc] focus:border-[#d97757]'
                    : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757]'
                }`}
              />
              <button
                onClick={handleCreateSkill}
                disabled={!newName.trim() || !newSystemPrompt.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#d97757] text-white text-xs font-semibold disabled:opacity-40"
              >
                Save Skill
              </button>
            </div>
          </div>
        )}

        {/* Search + Categories */}
        <div
          className={`px-5 py-3 border-b shrink-0 space-y-2 ${
            isLight ? 'bg-[#ebe6dc]/60 border-[#e6e1d7]' : 'bg-[#1b1a17]/60 border-[#38342e]'
          }`}
        >
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9e978a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name, description, or tag..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs transition-colors ${
                isLight
                  ? 'bg-white border-[#ded8cc] focus:border-[#d97757] text-[#22201d] placeholder-[#9e978a]'
                  : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757] text-[#f4f0ea] placeholder-[#736e65]'
              }`}
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#d97757] text-white font-bold shadow-xs'
                    : isLight
                    ? 'bg-white/80 hover:bg-white text-[#575249] border border-[#e2ddd3]'
                    : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#c4bdae] border border-[#3d3831]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className={`flex-1 overflow-y-auto p-5 ${isLight ? 'bg-[#faf8f5]/60' : 'bg-[#181715]/30'}`}>
          {filteredSkills.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Wand2 className="w-8 h-8 mx-auto text-[#d97757] opacity-40" />
              <p className="text-sm font-semibold">No skills found</p>
              <p className="text-xs opacity-60">Try a different search or create a new skill.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSkills.map((skill) => {
                const isActive = activeSkill?.id === skill.id;
                return (
                  <div
                    key={skill.id}
                    className={`group rounded-xl border p-4 transition-all cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-[#d97757] shadow-md'
                        : 'hover:shadow-md'
                    } ${
                      isLight
                        ? 'bg-white border-[#e6e1d7] hover:bg-[#fcfaf7]'
                        : 'bg-[#2a2723] border-[#3d3831] hover:bg-[#332f2a]'
                    }`}
                    onClick={() => handleActivate(skill)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{skill.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{skill.name}</p>
                          <p className="text-[9px] opacity-50">{skill.category}</p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#d97757] text-white text-[8px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className={`text-[11px] leading-tight mb-3 line-clamp-2 ${isLight ? 'text-[#736e65]' : 'text-[#a39c90]'}`}>
                      {skill.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {skill.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
                            isLight ? 'bg-[#f4f0e8] text-[#736e65]' : 'bg-[#1f1d1a] text-[#9e978a]'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {skill.tags.length > 3 && (
                        <span className="text-[8px] opacity-40">+{skill.tags.length - 3}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(skill);
                        }}
                        className={`p-1 rounded text-[10px] ${
                          copiedId === skill.id
                            ? 'text-emerald-500'
                            : isLight
                            ? 'text-[#575249] hover:bg-[#f4f0e8]'
                            : 'text-[#b3ac9f] hover:bg-[#332f2a]'
                        }`}
                        title="Export as shareable URL"
                      >
                        {copiedId === skill.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(skill.id);
                        }}
                        className={`p-1 rounded text-[10px] ${
                          isLight ? 'text-[#575249] hover:bg-[#f4f0e8]' : 'text-[#b3ac9f] hover:bg-[#332f2a]'
                        }`}
                        title="Duplicate"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {!skill.isBuiltin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(skill.id);
                          }}
                          className="p-1 rounded text-[10px] text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      {skill.author !== 'Custom' && skill.author !== 'Gia' && (
                        <span className="text-[8px] opacity-40 ml-auto flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />
                          {skill.author}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-2.5 border-t text-center text-[10px] font-medium flex items-center justify-center gap-1.5 ${
            isLight
              ? 'bg-[#ebe6dc]/60 border-[#e6e1d7] text-[#736e65]'
              : 'bg-[#1b1a17]/60 border-[#38342e] text-[#9e978a]'
          }`}
        >
          <Sparkles className="w-3 h-3 text-[#d97757]" />
          <span>
            {activeSkill
              ? `"${activeSkill.name}" is active — all AI generations will use this skill's expertise`
              : 'Click a skill to activate it — it injects domain expertise into every AI generation'}
          </span>
        </div>
      </div>
    </div>
  );
};
