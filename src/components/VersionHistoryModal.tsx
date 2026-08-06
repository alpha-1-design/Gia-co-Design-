import React, { useState } from 'react';
import { GitBranch, Clock, Bookmark, Trash2, ExternalLink, ChevronRight, Plus } from 'lucide-react';
import { VersionSnapshot, DesignSession } from '../types';

interface VersionHistoryModalProps {
  session: DesignSession;
  currentTurnIndex: number;
  onClose: () => void;
  onSelectVersion: (turnIndex: number, snapshotId?: string) => void;
  onCreateBranch: (turnIndex: number) => void;
  onBookmarkVersion: (snapshotId: string) => void;
  onDeleteVersion: (snapshotId: string) => void;
  theme: 'light' | 'dark';
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  session,
  currentTurnIndex,
  onClose,
  onSelectVersion,
  onCreateBranch,
  onBookmarkVersion,
  onDeleteVersion,
  theme = 'light',
}) => {
  const [selectedTurnIndex, setSelectedTurnIndex] = useState(currentTurnIndex);
  const isLight = theme === 'light';

  const allVersions: Array<{
    id: string;
    label: string;
    timestamp: number;
    turnIndex: number;
    isCurrent: boolean;
    isBookmarked: boolean;
    snapshot?: VersionSnapshot;
  }> = [];

  // Add snapshots from each turn
  session.turns.forEach((turn, idx) => {
    if (turn.versionSnapshots) {
      turn.versionSnapshots.forEach((snap) => {
        allVersions.push({
          id: snap.id,
          label: snap.label || `v${idx + 1}.${allVersions.filter((v) => v.turnIndex === idx).length + 1}`,
          timestamp: snap.timestamp,
          turnIndex: idx,
          isCurrent: idx === currentTurnIndex,
          isBookmarked: snap.isBookmarked,
          snapshot: snap,
        });
      });
    } else {
      // Treat each turn as a version even without explicit snapshots
      allVersions.push({
        id: turn.id,
        label: `Turn ${idx + 1}${idx === 0 ? ' (Initial)' : ''}`,
        timestamp: turn.timestamp,
        turnIndex: idx,
        isCurrent: idx === currentTurnIndex,
        isBookmarked: false,
      });
    }
  });

  const bookmarkedVersions = allVersions.filter((v) => v.isBookmarked);
  const chronologicalVersions = allVersions.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
        isLight ? 'bg-[#faf8f5]' : 'bg-[#181715]'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'border-[#e6e1d7]' : 'border-[#38342e]'
        }`}>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#d97757]" />
            <h2 className={`text-lg font-bold ${isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'}`}>
              Version History — {session.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isLight ? 'hover:bg-[#e6e1d7]' : 'hover:bg-[#38342e]'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Bookmarks */}
          <div className={`w-48 border-r p-4 overflow-y-auto ${
            isLight ? 'border-[#e6e1d7] bg-[#f4f0e8]' : 'border-[#38342e] bg-[#22201d]'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4 text-[#d97757]" />
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-[#575249]' : 'text-[#b3ac9f]'
              }`}>
                Bookmarks
              </span>
            </div>
            {bookmarkedVersions.length === 0 ? (
              <p className={`text-xs ${isLight ? 'text-[#8b8575]' : 'text-[#6b6355]'}`}>
                No bookmarks yet
              </p>
            ) : (
              <ul className="space-y-2">
                {bookmarkedVersions.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => {
                        setSelectedTurnIndex(v.turnIndex);
                        onSelectVersion(v.turnIndex, v.snapshot?.id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedTurnIndex === v.turnIndex
                          ? 'bg-[#d97757] text-white'
                          : isLight
                          ? 'hover:bg-[#e6e1d7] text-[#575249]'
                          : 'hover:bg-[#38342e] text-[#b3ac9f]'
                      }`}
                    >
                      {v.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Main Timeline */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {chronologicalVersions.map((v, idx) => (
                <div
                  key={v.id}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedTurnIndex === v.turnIndex
                      ? isLight
                        ? 'border-[#d97757] bg-[#d97757]/10'
                        : 'border-[#d97757] bg-[#d97757]/15'
                      : isLight
                      ? 'border-[#e6e1d7] hover:border-[#d97757]/50'
                      : 'border-[#38342e] hover:border-[#d97757]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold ${
                          isLight ? 'text-[#22201d]' : 'text-[#f4f0ea]'
                        }`}>
                          {v.label}
                        </span>
                        {v.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#d97757] text-white">
                            Current
                          </span>
                        )}
                        {v.isBookmarked && (
                          <Bookmark className="w-3.5 h-3.5 text-[#d97757]" />
                        )}
                      </div>
                      <p className={`text-xs ${isLight ? 'text-[#8b8575]' : 'text-[#6b6355]'}`}>
                        {new Date(v.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTurnIndex(v.turnIndex);
                          onSelectVersion(v.turnIndex, v.snapshot?.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          selectedTurnIndex === v.turnIndex
                            ? 'bg-[#d97757] text-white'
                            : isLight
                            ? 'bg-white hover:bg-[#d97757] hover:text-white text-[#575249] border border-[#e2ddd3]'
                            : 'bg-[#2a2723] hover:bg-[#d97757] hover:text-white text-[#b3ac9f] border border-[#3d3831]'
                        }`}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onCreateBranch(v.turnIndex)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight
                            ? 'hover:bg-[#e6e1d7] text-[#575249]'
                            : 'hover:bg-[#38342e] text-[#b3ac9f]'
                        }`}
                        title="Create branch from this version"
                      >
                        <GitBranch className="w-4 h-4" />
                      </button>
                      {!v.isCurrent && (
                        <>
                          <button
                            onClick={() => onBookmarkVersion(v.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              v.isBookmarked
                                ? 'text-[#d97757]'
                                : isLight
                                ? 'text-[#8b8575] hover:text-[#d97757]'
                                : 'text-[#6b6355] hover:text-[#d97757]'
                            }`}
                            title={v.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          {v.snapshot && (
                            <button
                              onClick={() => onDeleteVersion(v.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isLight
                                  ? 'text-[#8b8575] hover:text-red-600'
                                  : 'text-[#6b6355] hover:text-red-400'
                              }`}
                              title="Delete snapshot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isLight ? 'border-[#e6e1d7] bg-[#f4f0e8]' : 'border-[#38342e] bg-[#22201d]'
        }`}>
          <button
            onClick={() => onCreateBranch(currentTurnIndex)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#d97757] hover:bg-[#c66545] text-white transition-colors flex items-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Create Branch from Current
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isLight
                ? 'bg-white hover:bg-[#e6e1d7] text-[#575249] border border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#38342e] text-[#b3ac9f] border border-[#3d3831]'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
