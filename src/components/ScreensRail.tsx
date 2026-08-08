import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Pencil, Smartphone, Globe, LayoutDashboard, PanelTop, Component, MoreHorizontal } from 'lucide-react';
import { DesignScreen } from '../types';

interface ScreensRailProps {
  screens: DesignScreen[];
  activeScreenId: string;
  onSelectScreen: (id: string) => void;
  onAddScreen: () => void;
  onRenameScreen: (id: string, name: string) => void;
  onDeleteScreen: (id: string) => void;
  theme: 'light' | 'dark';
}

const KIND_ICON: Record<DesignScreen['kind'], React.ElementType> = {
  website: Globe,
  mobile: Smartphone,
  dashboard: LayoutDashboard,
  landing: PanelTop,
  component: Component,
  other: PanelTop,
};

export const ScreensRail: React.FC<ScreensRailProps> = ({
  screens,
  activeScreenId,
  onSelectScreen,
  onAddScreen,
  onRenameScreen,
  onDeleteScreen,
  theme,
}) => {
  const isLight = theme === 'light';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

  const startRename = (screen: DesignScreen) => {
    setEditingId(screen.id);
    setEditValue(screen.name);
    setMenuOpenId(null);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRenameScreen(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  // Only a single screen left in the whole project can't be deleted - a
  // project always needs at least one design to make sense.
  const canDelete = screens.length > 1;

  return (
    <div
      className={`h-11 px-2 border-b flex items-center gap-1.5 overflow-x-auto shrink-0 z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
      }`}
    >
      {screens.map((screen) => {
        const Icon = KIND_ICON[screen.kind] || PanelTop;
        const active = screen.id === activeScreenId;
        const isEditing = editingId === screen.id;
        return (
          <div key={screen.id} className="relative shrink-0">
            {isEditing ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium border w-32 focus:outline-none focus:border-[#d97757] ${
                  isLight ? 'bg-white border-[#d97757] text-[#22201d]' : 'bg-[#2a2723] border-[#d97757] text-[#f4f0ea]'
                }`}
              />
            ) : (
              <button
                onClick={() => onSelectScreen(screen.id)}
                onDoubleClick={() => startRename(screen)}
                className={`h-8 pl-2.5 pr-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors max-w-[160px] ${
                  active
                    ? 'bg-[#d97757] text-white border-[#c66545]'
                    : isLight
                    ? 'bg-white hover:bg-[#f4f0e8] text-[#575249] border-[#e2ddd3]'
                    : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
                }`}
                title={screen.name}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{screen.name}</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === screen.id ? null : screen.id);
                  }}
                  className={`p-0.5 rounded shrink-0 ${active ? 'hover:bg-white/20' : isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </span>
              </button>
            )}
            {menuOpenId === screen.id && (
              <div
                ref={menuRef}
                className={`absolute left-0 top-full mt-1 w-36 rounded-lg border shadow-xl overflow-hidden z-30 ${
                  isLight ? 'bg-white border-[#e2ddd3]' : 'bg-[#2a2723] border-[#3d3831]'
                }`}
              >
                <button
                  onClick={() => startRename(screen)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left ${isLight ? 'hover:bg-[#f4f0e8] text-[#22201d]' : 'hover:bg-[#332f2a] text-[#f4f0ea]'}`}
                >
                  <Pencil className="w-3 h-3" /> Rename
                </button>
                <button
                  onClick={() => { if (canDelete) { onDeleteScreen(screen.id); setMenuOpenId(null); } }}
                  disabled={!canDelete}
                  title={canDelete ? undefined : "Can't delete the only screen in a project"}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-500/10 text-red-400'
                  }`}
                >
                  <X className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        );
      })}
      <button
        onClick={onAddScreen}
        className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border transition-colors ${
          isLight ? 'bg-white hover:bg-[#f4f0e8] text-[#d97757] border-[#e2ddd3]' : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#d97757] border-[#3d3831]'
        }`}
        title="Add a new screen to this project"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
