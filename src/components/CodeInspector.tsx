import React, { useState } from 'react';
import { FileCode2, Copy, Check, X, File, Edit3 } from 'lucide-react';
import { UIKitDecomposition, UIKitFile } from '../types';

interface CodeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  codeHtml: string;
  uiKit?: UIKitDecomposition;
  onUpdateCode: (newCode: string) => void;
  theme?: 'light' | 'dark';
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  isOpen,
  onClose,
  codeHtml,
  uiKit,
  onUpdateCode,
  theme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<string>('index.html');
  const [copied, setCopied] = useState(false);
  const [editingContent, setEditingContent] = useState<string>(codeHtml);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const currentFile: UIKitFile = uiKit?.files.find((f) => f.path === activeTab) || {
    path: 'index.html',
    content: codeHtml,
    language: 'html',
  };

  const displayContent = activeTab === 'index.html' && !uiKit ? codeHtml : currentFile.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApplyEdits = () => {
    if (activeTab === 'index.html') {
      onUpdateCode(editingContent);
    }
  };

  return (
    <div className={`w-full lg:w-96 xl:w-[480px] border-l flex flex-col h-full shrink-0 z-20 shadow-xl transition-colors ${
      isLight ? 'bg-[#f4f0e8] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
    }`}>
      {/* Inspector Header */}
      <div className={`p-3 border-b flex items-center justify-between ${
        isLight ? 'bg-[#ebe6dc] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
      }`}>
        <div className="flex items-center gap-2 text-xs font-serif-claude font-bold tracking-wide text-inherit">
          <FileCode2 className="w-4 h-4 text-[#d97757]" />
          <span>Code Inspector & Files</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors ${
              isLight
                ? 'bg-white hover:bg-[#faf8f5] text-[#575249] border-[#e2ddd3]'
                : 'bg-[#2a2723] hover:bg-[#332f2a] text-[#b3ac9f] border-[#3d3831]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Tree / File Tabs Bar */}
      <div className={`px-2 py-1.5 border-b flex items-center gap-1 overflow-x-auto text-xs ${
        isLight ? 'bg-[#f7f4ec] border-[#e6e1d7]' : 'bg-[#181715] border-[#38342e]'
      }`}>
        <button
          onClick={() => {
            setActiveTab('index.html');
            setEditingContent(codeHtml);
          }}
          className={`px-3 py-1 rounded-md flex items-center gap-1.5 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'index.html'
              ? 'bg-[#d97757] text-white shadow-sm'
              : isLight
              ? 'text-[#736e65] hover:bg-white'
              : 'text-[#9e978a] hover:bg-[#2a2723]'
          }`}
        >
          <File className="w-3.5 h-3.5" />
          <span>index.html</span>
        </button>

        {uiKit?.files
          .filter((f) => f.path !== 'index.html')
          .map((f) => (
            <button
              key={f.path}
              onClick={() => {
                setActiveTab(f.path);
                setEditingContent(f.content);
              }}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 font-medium whitespace-nowrap transition-colors ${
                activeTab === f.path
                  ? 'bg-[#d97757] text-white shadow-sm'
                  : isLight
                  ? 'text-[#736e65] hover:bg-white'
                  : 'text-[#9e978a] hover:bg-[#2a2723]'
              }`}
            >
              <File className="w-3.5 h-3.5" />
              <span>{f.path}</span>
            </button>
          ))}
      </div>

      {/* Editor Content Box */}
      <div className={`flex-1 overflow-hidden p-2 flex flex-col ${
        isLight ? 'bg-[#faf8f5]' : 'bg-[#181715]'
      }`}>
        <textarea
          value={editingContent}
          onChange={(e) => setEditingContent(e.target.value)}
          className={`w-full h-full p-3 rounded-lg focus:outline-none resize-none font-mono-claude text-xs leading-relaxed border ${
            isLight
              ? 'bg-[#1e1c19] text-[#e8e2d5] border-[#38342e]'
              : 'bg-[#141311] text-[#e8e2d5] border-[#2a2723]'
          }`}
          spellCheck={false}
        />
      </div>

      {/* Footer Edits apply button */}
      {activeTab === 'index.html' && (
        <div className={`p-3 border-t flex items-center justify-between ${
          isLight ? 'bg-[#ebe6dc] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
            Edit HTML directly and click Apply
          </span>
          <button
            onClick={handleApplyEdits}
            className="px-3.5 py-1.5 bg-[#d97757] hover:bg-[#c66545] text-white font-semibold rounded-lg text-xs transition-all shadow-md flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Apply to Preview</span>
          </button>
        </div>
      )}
    </div>
  );
};

