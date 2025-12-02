
import React, { useState } from 'react';
import { Code, Eye, MonitorPlay, Download, Image as ImageIcon } from 'lucide-react';

interface PreviewSectionProps {
  html: string | null;
  imageSrc: string | null;
  isLoading: boolean;
  mode: 'html' | 'image';
  t: (key: string) => string;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ html, imageSrc, isLoading, mode, t }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-black text-zinc-500 p-8">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-zinc-900 dark:text-white">{t('preview.loading')}</p>
        <p className="text-sm mt-1 text-zinc-500">{t('preview.loading.desc')}</p>
      </div>
    );
  }

  // Empty State
  const hasContent = mode === 'html' ? !!html : !!imageSrc;
  if (!hasContent) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-black p-8">
        <div className="w-24 h-24 bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm flex items-center justify-center mb-6">
          {mode === 'html' ? (
             <MonitorPlay className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
          ) : (
             <ImageIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{t('preview.empty.title')}</h2>
        <p className="text-center max-w-sm text-zinc-500 text-sm">
          {t('preview.empty.desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] dark:bg-black">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500"></span>
           <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
             {mode === 'html' ? t('label.preview') : t('label.result')}
           </span>
        </div>
        
        <div className="flex items-center gap-3">
           {mode === 'html' ? (
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {t('preview.tab.visual')}
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'code'
                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                {t('preview.tab.code')}
              </button>
            </div>
           ) : (
             <a
               href={imageSrc!}
               download={`gemini-image-${Date.now()}.png`}
               className="px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] text-white transition-all shadow-sm active:scale-95"
             >
               <Download className="w-3.5 h-3.5" />
               {t('preview.btn.download')}
             </a>
           )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'html' ? (
          viewMode === 'preview' ? (
            <div className="w-full h-full bg-[#F5F5F7] dark:bg-black overflow-hidden flex items-center justify-center p-4 lg:p-8">
               {/* Phone/Device Frame Simulation could go here, simplified for now */}
              <iframe
                srcDoc={html!}
                title="Card Preview"
                className="w-full h-full border-0 shadow-2xl rounded-xl bg-white dark:bg-zinc-900"
                sandbox="allow-scripts allow-modals allow-downloads allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-auto p-0 bg-[#1e1e1e]">
              <pre className="text-xs font-mono text-zinc-300 p-6 whitespace-pre-wrap leading-relaxed">
                {html}
              </pre>
            </div>
          )
        ) : (
          <div className="w-full h-full bg-[#F5F5F7] dark:bg-black flex items-center justify-center p-8">
             <img 
               src={imageSrc!} 
               alt="Generated Result" 
               className="max-w-full max-h-full rounded-lg shadow-2xl object-contain ring-1 ring-black/5 dark:ring-white/10"
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSection;