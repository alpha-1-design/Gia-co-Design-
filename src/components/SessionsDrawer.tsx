import React, { useState } from 'react';
import { FolderKanban, Plus, X, Trash2, Edit2, Check } from 'lucide-react';
import { DesignSession } from '../types';

interface SessionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: DesignSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  theme?: 'light' | 'dark';
}

export const SessionsDrawer: React.FC<SessionsDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  theme = 'light',
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleStartRename = (session: DesignSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
      <div className={`w-80 sm:w-96 border-r h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        {/* Drawer Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-sm font-serif-claude font-bold tracking-wide">Design Workspace Sessions</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: Create New Session */}
        <div className={`p-3 border-b ${
          isLight ? 'bg-[#f7f4ec] border-[#e6e1d7]' : 'bg-[#181715] border-[#38342e]'
        }`}>
          <button
            onClick={() => {
              onCreateSession();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Design Session</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 group ${
                  isActive
                    ? 'bg-[#d97757]/15 border-[#d97757] text-[#d97757] font-semibold shadow-sm'
                    : isLight
                    ? 'bg-white hover:bg-[#f4f0e8] border-[#ded8cc] text-[#22201d]'
                    : 'bg-[#181715] hover:bg-[#2a2723] border-[#38342e] text-[#f4f0ea]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={`w-full px-2 py-1 rounded border text-xs focus:outline-none focus:border-[#d97757] ${
                          isLight ? 'bg-white border-[#ded8cc] text-[#22201d]' : 'bg-[#181715] border-[#38342e] text-[#f4f0ea]'
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(session.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className="cursor-pointer"
                    >
                      <h3 className="font-semibold text-xs truncate">{session.title}</h3>
                      <p className={`text-[10px] mt-0.5 ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                        {session.screens.length} screen{session.screens.length !== 1 ? 's' : ''} • {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartRename(session)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Rename Session"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1 text-gray-400 hover:text-rose-600"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={`p-4 border-t text-[11px] text-center ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#827c70]' : 'bg-[#1b1a17] border-[#38342e] text-[#8c8577]'
        }`}>
          Gia-co-Design • BYOK Local Storage
        </div>
      </div>
    </div>
  );
};

