import React from 'react';
import { X, Download, Rocket, RefreshCw } from 'lucide-react';
import { AppRelease, openReleaseDownload } from '../lib/updater';

interface UpdateModalProps {
  isOpen: boolean;
  currentVersion: string;
  release: AppRelease | null;
  onClose: () => void;
  onRetry: () => void;
  theme?: 'light' | 'dark';
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  currentVersion,
  release,
  onClose,
  onRetry,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleDownload = () => {
    if (!release?.apkUrl) return;
    openReleaseDownload(release.apkUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border transition-colors ${
        isLight ? 'bg-[#faf8f5] border-[#e6e1d7] text-[#22201d]' : 'bg-[#22201d] border-[#38342e] text-[#f4f0ea]'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-[#f4f0e8] border-[#e6e1d7]' : 'bg-[#1b1a17] border-[#38342e]'
        }`}>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#d97757]" />
            <h2 className="text-base font-serif-claude font-bold">Update Available</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {release ? (
            <>
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-white border-[#e6e1d7]' : 'bg-[#2a2723] border-[#3d3831]'
              }`}>
                <div>
                  <div className="text-xs font-semibold">
                    v{release.version}
                    <span className={`ml-2 text-[10px] font-mono ${isLight ? 'text-[#827c70]' : 'text-[#9e978a]'}`}>
                      current: v{currentVersion}
                    </span>
                  </div>
                  {release.publishedAt && (
                    <div className={`text-[10px] mt-0.5 ${isLight ? 'text-[#827c70]' : 'text-[#9e978a]'}`}>
                      Released {new Date(release.publishedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <span className="px-2 py-1 rounded-full bg-[#d97757]/15 text-[#d97757] text-[10px] font-bold">
                  NEW
                </span>
              </div>

              {release.body && (
                <div className={`max-h-40 overflow-y-auto p-3 rounded-xl border text-[11px] leading-relaxed whitespace-pre-wrap ${
                  isLight ? 'bg-white border-[#e6e1d7]' : 'bg-[#2a2723] border-[#3d3831]'
                }`}>
                  {release.body}
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={!release.apkUrl}
                className="w-full py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {release.apkUrl ? 'Download & Install v' + release.version : 'No APK attached to this release'}
              </button>

              <div className={`text-[10px] leading-relaxed text-center ${isLight ? 'text-[#827c70]' : 'text-[#8c8577]'}`}>
                Opens in your system browser to download the APK — then tap it to install the update.
                Future versions will check for updates automatically on launch.
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#d97757]" />
              <p className="text-xs text-center text-[#827c70]">
                Couldn't reach the release server. Check your connection and try again.
              </p>
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-[#d97757] hover:bg-[#c66545] text-white text-xs font-semibold transition-all shadow-md"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
