import React, { useState } from 'react';
import { 
  MousePointerClick, 
  FormInput, 
  CreditCard, 
  Navigation, 
  Bell, 
  Plus, 
  Search, 
  GripVertical, 
  Check, 
  SlidersHorizontal,
  Table,
  Sparkles,
  ToggleLeft,
  LayoutGrid
} from 'lucide-react';

export interface UIPattern {
  id: string;
  category: 'Buttons' | 'Inputs' | 'Cards' | 'Navigation' | 'Feedback';
  title: string;
  description: string;
  snippet: string;
  previewType: string;
}

interface VisualLibraryPanelProps {
  onInsertSnippet: (snippet: string) => void;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

export const UI_PATTERNS: UIPattern[] = [
  // Buttons & Controls
  {
    id: 'btn-primary',
    category: 'Buttons',
    title: 'Primary Action Button',
    description: 'High-contrast CTA button with subtle shadow and icon',
    snippet: 'Add a primary CTA button styled with rounded-xl px-5 py-2.5 bg-[#d97757] hover:bg-[#c66545] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2',
    previewType: 'btn-primary',
  },
  {
    id: 'btn-outline',
    category: 'Buttons',
    title: 'Secondary Outline Button',
    description: 'Clean subtle border button for secondary actions',
    snippet: 'Add a secondary outline button with rounded-xl px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium text-xs transition-colors flex items-center gap-1.5',
    previewType: 'btn-outline',
  },
  {
    id: 'btn-toggle',
    category: 'Buttons',
    title: 'Segmented Switcher',
    description: 'Dual or triple segmented tab button switcher',
    snippet: 'Add a segmented tab switcher control with a subtle background container (bg-stone-200/60 dark:bg-stone-800) and smooth active state highlight tab for switching views',
    previewType: 'btn-toggle',
  },
  {
    id: 'btn-fab',
    category: 'Buttons',
    title: 'Floating Action Button (FAB)',
    description: 'Circular floating action trigger pinned at bottom right',
    snippet: 'Add a floating action button (FAB) fixed at bottom-6 right-6 w-12 h-12 rounded-full bg-[#d97757] hover:bg-[#c66545] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105',
    previewType: 'btn-fab',
  },

  // Inputs & Forms
  {
    id: 'input-search',
    category: 'Inputs',
    title: 'Search Bar with Icon',
    description: 'Clean search field with prefix magnifier icon and shortcut hint',
    snippet: 'Add a search input bar with a prefix search icon, placeholder "Search anything...", and a right shortcut badge (e.g. ⌘K) styled with rounded-xl border border-stone-200 dark:border-stone-700 px-3.5 py-2 text-sm',
    previewType: 'input-search',
  },
  {
    id: 'input-floating',
    category: 'Inputs',
    title: 'Form Input with Label',
    description: 'Structured form field with top label and helper text',
    snippet: 'Add a styled form input group containing a clean top label ("Email Address"), an input field with rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#d97757]',
    previewType: 'input-floating',
  },
  {
    id: 'input-select',
    category: 'Inputs',
    title: 'Custom Select Dropdown',
    description: 'Dropdown menu with custom chevron and hover states',
    snippet: 'Add a custom select dropdown menu field with rounded-xl border border-stone-300 dark:border-stone-700 px-3.5 py-2.5 text-sm bg-white dark:bg-stone-900 cursor-pointer flex items-center justify-between',
    previewType: 'input-select',
  },
  {
    id: 'input-[#d97757]toggle',
    category: 'Inputs',
    title: 'Toggle Switch',
    description: 'Interactive sliding toggle switch for settings',
    snippet: 'Add a smooth toggle switch component with an active indicator dot and clear title/description label beside it',
    previewType: 'input-toggle',
  },

  // Cards & Layouts
  {
    id: 'card-metric',
    category: 'Cards',
    title: 'KPI Stat Card',
    description: 'Metrics card with big number, trend badge, and label',
    snippet: 'Add a KPI stat metric card with a prominent number ($24,850), a green trend percentage (+12.4%), a subtle icon, and a muted title label inside a rounded-2xl border bg-white dark:bg-stone-900 p-4 shadow-sm',
    previewType: 'card-metric',
  },
  {
    id: 'card-feature',
    category: 'Cards',
    title: 'Feature Card with Icon',
    description: 'Card with icon header, title, description, and link',
    snippet: 'Add an interactive feature card with a colored icon container, bold title, descriptive body text, and a "Learn more →" hover link inside a rounded-2xl border p-5 bg-white dark:bg-stone-900 shadow-sm',
    previewType: 'card-feature',
  },
  {
    id: 'card-user',
    category: 'Cards',
    title: 'User Profile Badge',
    description: 'Compact user card with avatar, role, and status indicator',
    snippet: 'Add a user profile card featuring a circular avatar, online status indicator green dot, name, role badge ("Admin"), and an action menu button',
    previewType: 'card-user',
  },
  {
    id: 'card-pricing',
    category: 'Cards',
    title: 'Pricing Plan Tier',
    description: 'Pricing tier card with badge, feature list, and CTA',
    snippet: 'Add a sleek pricing tier card featuring a "Most Popular" highlight pill, plan title, price tag ($29/mo), bulleted checkmarks feature list, and a full-width CTA button',
    previewType: 'card-pricing',
  },

  // Navigation & Headers
  {
    id: 'nav-topbar',
    category: 'Navigation',
    title: 'Top Navigation Header',
    description: 'Header with logo mark, nav links, search, and user avatar',
    snippet: 'Add a responsive top navigation bar featuring a brand logo, navigation links (Dashboard, Projects, Team), search trigger, and user profile avatar dropdown',
    previewType: 'nav-topbar',
  },
  {
    id: 'nav-sidebar',
    category: 'Navigation',
    title: 'Vertical Sidebar Navigation',
    description: 'Slim sidebar with icons, active state, and footer profile',
    snippet: 'Add a vertical sidebar navigation panel with icon links, count badges, active state highlighting, and a collapsible bottom user status footer',
    previewType: 'nav-sidebar',
  },
  {
    id: 'nav-tabs',
    category: 'Navigation',
    title: 'Underlined Tab Menu',
    description: 'Horizontal tabs with active underline highlight indicator',
    snippet: 'Add an underlined tab menu bar with tabs ("Overview", "Analytics", "Settings") and an animated active bottom border indicator',
    previewType: 'nav-tabs',
  },

  // Feedback & Overlay
  {
    id: 'feedback-banner',
    category: 'Feedback',
    title: 'Alert / Banner Notification',
    description: 'Contextual notification banner with close trigger',
    snippet: 'Add an alert banner notification with a contextual icon (info/warning/success), message text, and a dismiss "X" button styled with rounded-xl p-3 border',
    previewType: 'feedback-banner',
  },
  {
    id: 'feedback-modal',
    category: 'Feedback',
    title: 'Modal Dialog Box',
    description: 'Overlay modal box with backdrop, header, body, and actions',
    snippet: 'Add a modal dialog overlay with a semi-transparent dark backdrop, centered rounded-2xl modal container, header title, body text, and bottom action buttons (Cancel & Confirm)',
    previewType: 'feedback-modal',
  },
  {
    id: 'feedback-table',
    category: 'Feedback',
    title: 'Data Table Header & Row',
    description: 'Clean data table row layout with status tag and menu',
    snippet: 'Add a clean data table component with column headers, striped or hoverable table rows, status pills (Active/Pending), and action menu buttons',
    previewType: 'feedback-table',
  },
];

export const VisualLibraryPanel: React.FC<VisualLibraryPanelProps> = ({
  onInsertSnippet,
  theme = 'light',
  compact = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isLight = theme === 'light';

  const categories = ['All', 'Buttons', 'Inputs', 'Cards', 'Navigation', 'Feedback'];

  const filteredPatterns = UI_PATTERNS.filter((pattern) => {
    const matchesCategory = selectedCategory === 'All' || pattern.category === selectedCategory;
    const matchesSearch = 
      pattern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyInsert = (pattern: UIPattern) => {
    onInsertSnippet(pattern.snippet);
    setCopiedId(pattern.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const renderMiniPreview = (type: string) => {
    switch (type) {
      case 'btn-primary':
        return (
          <div className="flex items-center justify-center p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <div className="px-3 py-1.5 rounded-lg bg-[#d97757] text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Get Started</span>
            </div>
          </div>
        );
      case 'btn-outline':
        return (
          <div className="flex items-center justify-center p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <div className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-[10px] font-medium">
              Secondary
            </div>
          </div>
        );
      case 'btn-toggle':
        return (
          <div className="flex items-center justify-center p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <div className="p-0.5 rounded-lg bg-stone-200 dark:bg-stone-700 flex gap-0.5 text-[9px]">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-900 font-bold shadow-xs">Active</span>
              <span className="px-2 py-0.5 text-stone-500 dark:text-stone-400">List</span>
            </div>
          </div>
        );
      case 'btn-fab':
        return (
          <div className="flex items-center justify-center p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <div className="w-6 h-6 rounded-full bg-[#d97757] text-white flex items-center justify-center shadow-md">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
        );
      case 'input-search':
        return (
          <div className="flex items-center justify-center p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <div className="w-full max-w-[120px] px-2 py-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 flex items-center justify-between text-[9px] text-stone-400">
              <div className="flex items-center gap-1">
                <Search className="w-2.5 h-2.5 text-stone-400" />
                <span>Search...</span>
              </div>
              <span className="px-1 bg-stone-100 dark:bg-stone-800 rounded text-[8px]">⌘K</span>
            </div>
          </div>
        );
      case 'input-floating':
        return (
          <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80 w-full">
            <span className="text-[8px] font-semibold text-stone-500">Label</span>
            <div className="h-5 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 px-1.5 flex items-center text-[9px] text-stone-400">
              Input value...
            </div>
          </div>
        );
      case 'input-select':
        return (
          <div className="flex items-center justify-center p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <div className="w-full max-w-[120px] px-2 py-1 rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 flex items-center justify-between text-[9px] text-stone-700 dark:text-stone-300 font-medium">
              <span>Select Option</span>
              <SlidersHorizontal className="w-2.5 h-2.5 text-stone-400" />
            </div>
          </div>
        );
      case 'input-toggle':
        return (
          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-100 dark:bg-stone-800/80">
            <span className="text-[9px] font-medium text-stone-600 dark:text-stone-300">Enable Feature</span>
            <ToggleLeft className="w-5 h-5 text-[#d97757]" />
          </div>
        );
      case 'card-metric':
        return (
          <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex flex-col gap-0.5">
            <span className="text-[8px] text-stone-400 uppercase font-mono">Total Sales</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100">$24,850</span>
              <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">+12.4%</span>
            </div>
          </div>
        );
      case 'card-feature':
        return (
          <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-start gap-1.5">
            <div className="w-5 h-5 rounded bg-[#d97757]/15 text-[#d97757] flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-stone-800 dark:text-stone-100">Smart Feature</span>
              <span className="text-[8px] text-stone-400 line-clamp-1">AI automated workflows</span>
            </div>
          </div>
        );
      case 'card-user':
        return (
          <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center shrink-0">
              AS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-semibold text-stone-800 dark:text-stone-200 truncate">Alex Smith</span>
              <span className="text-[7px] text-stone-400">Product Designer</span>
            </div>
          </div>
        );
      case 'card-pricing':
        return (
          <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-amber-500/40 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-stone-800 dark:text-stone-200">Pro Tier</span>
              <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-amber-500 text-white uppercase">POPULAR</span>
            </div>
            <span className="text-xs font-black text-stone-900 dark:text-white">$29<span className="text-[8px] font-normal text-stone-400">/mo</span></span>
          </div>
        );
      case 'nav-topbar':
        return (
          <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#d97757]" />
              <span className="text-[8px] font-bold">App</span>
            </div>
            <div className="flex items-center gap-1 text-[7px] text-stone-400">
              <span>Home</span>
              <span>Docs</span>
            </div>
          </div>
        );
      case 'nav-sidebar':
        return (
          <div className="p-1.5 rounded-lg bg-stone-900 text-white flex items-center justify-between text-[8px]">
            <div className="flex items-center gap-1">
              <LayoutGrid className="w-3 h-3 text-[#d97757]" />
              <span>Sidebar Menu</span>
            </div>
            <span className="px-1 bg-stone-800 rounded text-[7px]">v2.0</span>
          </div>
        );
      case 'nav-tabs':
        return (
          <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 flex gap-2 border-b-2 border-[#d97757] text-[8px] font-bold text-[#d97757]">
            <span>Overview</span>
            <span className="text-stone-400 font-normal">Analytics</span>
          </div>
        );
      case 'feedback-banner':
        return (
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-200 flex items-center gap-1 text-[8px]">
            <Bell className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">Important update notice</span>
          </div>
        );
      case 'feedback-modal':
        return (
          <div className="p-2 rounded-lg bg-black/40 flex items-center justify-center">
            <div className="w-full bg-white dark:bg-stone-900 p-1.5 rounded border text-[8px] text-center font-semibold">
              Confirm Action?
            </div>
          </div>
        );
      case 'feedback-table':
        return (
          <div className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex justify-between items-center text-[8px]">
            <span className="font-mono">#INV-8492</span>
            <span className="px-1 rounded bg-emerald-100 text-emerald-800 text-[7px] font-bold">PAID</span>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[9px]">
            <Sparkles className="w-3 h-3 text-[#d97757]" />
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden select-none ${
      isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'
    }`}>
      {/* Panel Header & Category Filters */}
      <div className={`p-3 space-y-2 border-b ${
        isLight ? 'bg-[#ebe6dc]/80 border-[#e6e1d7]' : 'bg-[#1b1a17]/80 border-[#38342e]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold font-serif-claude">
            <LayoutGrid className="w-4 h-4 text-[#d97757]" />
            <span>UI Pattern Library</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
            isLight ? 'bg-white text-[#736e65] border-[#ded8cc]' : 'bg-[#2a2723] text-[#9e978a] border-[#3d3831]'
          }`}>
            Drag or Click +
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9e978a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter components (e.g. card, search)..."
            className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs transition-colors ${
              isLight
                ? 'bg-white border-[#ded8cc] focus:border-[#d97757] text-[#22201d] placeholder-[#9e978a]'
                : 'bg-[#23201c] border-[#3d3831] focus:border-[#d97757] text-[#f4f0ea] placeholder-[#736e65]'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
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

      {/* Patterns Grid */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-2.5 ${
        isLight ? 'bg-[#faf8f5]/60' : 'bg-[#181715]/30'
      }`}>
        {filteredPatterns.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#9e978a] space-y-1">
            <p className="font-semibold">No UI patterns found</p>
            <p className="text-[11px]">Try clearing your search query filter.</p>
          </div>
        ) : (
          filteredPatterns.map((pattern) => (
            <div
              key={pattern.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', pattern.snippet);
                e.dataTransfer.setData('application/json', JSON.stringify(pattern));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className={`group p-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                isLight
                  ? 'bg-white hover:bg-[#fcfaf7] border-[#e6e1d7]'
                  : 'bg-[#2a2723] hover:bg-[#332f2a] border-[#3d3831]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-[#9e978a] shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-bold truncate text-inherit">{pattern.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                    isLight ? 'bg-[#f4f0e8] text-[#736e65]' : 'bg-[#1f1d1a] text-[#9e978a]'
                  }`}>
                    {pattern.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyInsert(pattern)}
                    title="Insert into Prompt"
                    className={`p-1 rounded-lg border transition-all ${
                      copiedId === pattern.id
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isLight
                        ? 'bg-[#f4f0e8] hover:bg-[#d97757] hover:text-white border-[#ded8cc] text-[#575249]'
                        : 'bg-[#201e1b] hover:bg-[#d97757] hover:text-white border-[#38342e] text-[#c4bdae]'
                    }`}
                  >
                    {copiedId === pattern.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mini Interactive Preview Box */}
              <div className="mb-2">
                {renderMiniPreview(pattern.previewType)}
              </div>

              <p className="text-[11px] text-[#736e65] dark:text-[#a39c90] line-clamp-2 leading-tight">
                {pattern.description}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Drag & Drop Hint Footer */}
      <div className={`p-2 border-t text-center text-[10px] font-medium flex items-center justify-center gap-1.5 ${
        isLight ? 'bg-[#ebe6dc]/60 border-[#e6e1d7] text-[#736e65]' : 'bg-[#1b1a17]/60 border-[#38342e] text-[#9e978a]'
      }`}>
        <Sparkles className="w-3 h-3 text-[#d97757]" />
        <span>Drag any pattern card directly into the prompt box</span>
      </div>
    </div>
  );
};
