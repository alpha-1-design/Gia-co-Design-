import React, { useState } from 'react';
import { Download, FileCode, Archive, FileJson, Copy, Check, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { DesignSession, UIKitDecomposition, PreviewDevice } from '../types';
import { captureDesignPng } from '../lib/screenshot';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeHtml: string;
  activeSession: DesignSession;
  uiKit?: UIKitDecomposition;
  previewDevice: PreviewDevice;
  theme?: 'light' | 'dark';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  codeHtml,
  activeSession,
  uiKit,
  previewDevice,
  theme = 'light',
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pngBusy, setPngBusy] = useState(false);
  const [pngError, setPngError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const safeTitle = activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(`${safeTitle}.html`, codeHtml, 'text/html');
  };

  const handleExportJson = () => {
    const safeTitle = activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(`${safeTitle}-session.json`, JSON.stringify(activeSession, null, 2), 'application/json');
  };

  const handleExportZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const safeTitle = activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Add main index.html
      zip.file('index.html', codeHtml);

      // Add UI Kit files if available
      if (uiKit) {
        const kitFolder = zip.folder(`ui_kits/${uiKit.kitName}`);
        uiKit.files.forEach((f) => {
          kitFolder?.file(f.path, f.content);
        });
      }

      // Add README
      zip.file(
        'README.md',
        `# ${activeSession.title}\nExported from Gia-co-Design (BYOK Standalone Studio).\nCreated at ${new Date().toLocaleString()}.`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle}-bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create ZIP', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportPng = async () => {
    setPngBusy(true);
    setPngError(null);
    try {
      const blob = await captureDesignPng(codeHtml, previewDevice);
      const safeTitle = activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle}-${previewDevice}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setPngError(e.message || 'Screenshot export failed.');
    } finally {
      setPngBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Export & Packaging Hub</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* HTML Standalone Download */}
          <button
            onClick={handleExportHtml}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
              isLight
                ? 'bg-white hover:bg-[#f4f0e8] border-[#ded8cc]'
                : 'bg-[#181715] hover:bg-[#2a2723] border-[#38342e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d97757]/15 text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-colors">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold block text-xs">Single HTML File</span>
                <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Inlined CSS, zero external server dependencies
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#d97757]" />
          </button>

          {/* ZIP Bundle Download */}
          <button
            onClick={handleExportZip}
            disabled={downloading}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
              isLight
                ? 'bg-white hover:bg-[#f4f0e8] border-[#ded8cc]'
                : 'bg-[#181715] hover:bg-[#2a2723] border-[#38342e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d97757]/15 text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-colors">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold block text-xs">ZIP Archive Bundle</span>
                <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Includes HTML, components, tokens.css, and manifest
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#d97757]" />
          </button>

          {/* Session JSON Backup */}
          <button
            onClick={handleExportJson}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
              isLight
                ? 'bg-white hover:bg-[#f4f0e8] border-[#ded8cc]'
                : 'bg-[#181715] hover:bg-[#2a2723] border-[#38342e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d97757]/15 text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-colors">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold block text-xs">JSON Session Backup</span>
                <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Preserves complete prompt history and turns
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#d97757]" />
          </button>

          {/* PNG Screenshot */}
          <button
            onClick={handleExportPng}
            disabled={pngBusy}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
              isLight
                ? 'bg-white hover:bg-[#f4f0e8] border-[#ded8cc]'
                : 'bg-[#181715] hover:bg-[#2a2723] border-[#38342e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d97757]/15 text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-colors">
                {pngBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-semibold block text-xs">PNG Screenshot ({previewDevice})</span>
                <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Renders the live preview at {previewDevice} size for share/mockups
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#d97757]" />
          </button>
          {pngError && (
            <p className={`text-[11px] font-mono px-1 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
              ⚠️ {pngError}
            </p>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
              isLight
                ? 'bg-white hover:bg-[#f4f0e8] border-[#ded8cc]'
                : 'bg-[#181715] hover:bg-[#2a2723] border-[#38342e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-semibold block text-xs">Copy Source Code</span>
                <span className={`text-[11px] ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                  Copy current HTML to clipboard
                </span>
              </div>
            </div>
            {copied && <span className="text-xs text-emerald-600 font-bold">Copied!</span>}
          </button>
        </div>

        <div className={`p-4 border-t flex justify-end ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

