
import React, { useState, useEffect } from 'react';
import { AiConfig } from '../types';
import { X, Save, Server, Key, Cpu, Image as ImageIcon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiConfig;
  onSave: (config: AiConfig) => void;
  t: (key: string) => string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  t
}) => {
  const [localConfig, setLocalConfig] = useState<AiConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {t('settings.title')}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {t('settings.desc')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t('settings.provider')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalConfig({ ...localConfig, provider: 'gemini' })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  localConfig.provider === 'gemini'
                    ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                    : 'border-zinc-100 dark:border-zinc-700 bg-[#F5F5F7] dark:bg-[#2c2c2e] text-zinc-500'
                }`}
              >
                <span className="font-semibold text-sm mb-1">Google Gemini</span>
                <span className="text-[10px] opacity-70">Official SDK</span>
              </button>
              <button
                onClick={() => setLocalConfig({ ...localConfig, provider: 'custom' })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  localConfig.provider === 'custom'
                    ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                    : 'border-zinc-100 dark:border-zinc-700 bg-[#F5F5F7] dark:bg-[#2c2c2e] text-zinc-500'
                }`}
              >
                <span className="font-semibold text-sm mb-1">Custom / OpenAI</span>
                <span className="text-[10px] opacity-70">Compatible API</span>
              </button>
            </div>
          </div>

          {localConfig.provider === 'custom' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
              
              {/* Base URL */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                  <Server className="w-3.5 h-3.5" />
                  {t('settings.baseUrl')}
                </label>
                <input
                  type="text"
                  value={localConfig.baseUrl || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  placeholder={t('settings.placeholder.url')}
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                  <Key className="w-3.5 h-3.5" />
                  {t('settings.apiKey')}
                </label>
                <input
                  type="password"
                  value={localConfig.apiKey || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  placeholder={t('settings.placeholder.key')}
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

              {/* Chat Model */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  {t('settings.chatModel')}
                </label>
                <input
                  type="text"
                  value={localConfig.chatModel || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, chatModel: e.target.value })}
                  placeholder={t('settings.placeholder.chat')}
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

               {/* Image Model */}
               <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {t('settings.imageModel')}
                </label>
                <input
                  type="text"
                  value={localConfig.imageModel || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, imageModel: e.target.value })}
                  placeholder={t('settings.placeholder.image')}
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                />
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {t('settings.cancel')}
          </button>
          <button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white text-sm font-medium shadow-sm active:scale-95 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {t('settings.save')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
