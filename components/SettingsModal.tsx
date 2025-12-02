
import React, { useState, useEffect } from 'react';
import { AiProvider, AiModel } from '../types';
import { X, Save, Server, Key, Plus, Trash2, Globe, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: AiProvider[];
  onUpdateProviders: (providers: AiProvider[]) => void;
  t: (key: string) => string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  providers,
  onUpdateProviders,
  t
}) => {
  const [localProviders, setLocalProviders] = useState<AiProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  
  // Model editing state
  const [newModelName, setNewModelName] = useState('');

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalProviders(JSON.parse(JSON.stringify(providers)));
      if (providers.length > 0 && !selectedProviderId) {
        setSelectedProviderId(providers[0].id);
      }
    }
  }, [isOpen, providers]);

  const handleSave = () => {
    onUpdateProviders(localProviders);
    onClose();
  };

  const handleAddProvider = () => {
    const newId = `custom-${Date.now()}`;
    const newProvider: AiProvider = {
      id: newId,
      name: 'New Provider',
      type: 'custom',
      baseUrl: 'https://api.openai.com/v1',
      chatUrl: 'https://api.openai.com/v1/chat/completions',
      imageUrl: 'https://api.openai.com/v1/images/generations',
      apiKey: '',
      chatModels: [{ id: 'gpt-3.5-turbo', name: 'GPT-3.5' }],
      imageModels: [{ id: 'dall-e-3', name: 'DALL-E 3' }],
    };
    const updated = [...localProviders, newProvider];
    setLocalProviders(updated);
    setSelectedProviderId(newId);
  };

  const handleDeleteProvider = (id: string) => {
    if (confirmDeleteId === id) {
        // Confirmed
        const updated = localProviders.filter(p => p.id !== id);
        setLocalProviders(updated);
        
        // If we deleted the currently selected one
        if (selectedProviderId === id) {
          setSelectedProviderId(updated.length > 0 ? updated[0].id : null);
        }
        setConfirmDeleteId(null);
    } else {
        // First click
        setConfirmDeleteId(id);
        // Auto reset after 3 seconds if not confirmed
        setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const updateSelectedProvider = (updates: Partial<AiProvider>) => {
    if (!selectedProviderId) return;
    setLocalProviders(prev => prev.map(p => 
      p.id === selectedProviderId ? { ...p, ...updates } : p
    ));
  };

  const handleAddModel = (type: 'chat' | 'image') => {
    if (!newModelName.trim() || !selectedProviderId) return;
    
    const newModel: AiModel = { id: newModelName.trim(), name: newModelName.trim() };
    const provider = localProviders.find(p => p.id === selectedProviderId);
    if (!provider) return;

    const listKey = type === 'chat' ? 'chatModels' : 'imageModels';
    const updatedList = [...provider[listKey], newModel];

    updateSelectedProvider({ [listKey]: updatedList });
    setNewModelName('');
  };

  const handleRemoveModel = (type: 'chat' | 'image', modelId: string) => {
    if (!selectedProviderId) return;
    const provider = localProviders.find(p => p.id === selectedProviderId);
    if (!provider) return;

    const listKey = type === 'chat' ? 'chatModels' : 'imageModels';
    const updatedList = provider[listKey].filter(m => m.id !== modelId);

    updateSelectedProvider({ [listKey]: updatedList });
  };

  const selectedProvider = localProviders.find(p => p.id === selectedProviderId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Sidebar */}
        <div className="w-64 bg-[#F5F5F7] dark:bg-[#2c2c2e] border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
           <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50">
             <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{t('settings.providers')}</h2>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {localProviders.map(p => (
               <button
                 key={p.id}
                 type="button"
                 onClick={() => setSelectedProviderId(p.id)}
                 className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                   selectedProviderId === p.id 
                   ? 'bg-white dark:bg-white/10 shadow-sm text-zinc-900 dark:text-white' 
                   : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/5'
                 }`}
               >
                 {p.name}
               </button>
             ))}
             {localProviders.length === 0 && (
               <div className="px-3 py-4 text-center text-xs text-zinc-500">
                 No providers configured.
               </div>
             )}
           </div>
           <div className="p-3 border-t border-zinc-200 dark:border-zinc-700/50">
             <button type="button" onClick={handleAddProvider} className="w-full flex items-center justify-center gap-2 py-1.5 bg-[#0071e3]/10 text-[#0071e3] rounded-lg text-xs font-semibold hover:bg-[#0071e3]/20 transition-colors">
               <Plus className="w-3.5 h-3.5" />
               {t('settings.addProvider')}
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e]">
          {selectedProvider ? (
            <>
              <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                 <div>
                   <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedProvider.name}</h2>
                   <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">{selectedProvider.type}</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleDeleteProvider(selectedProvider.id)}
                      className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                        confirmDeleteId === selectedProvider.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={t('settings.deleteProvider')}
                    >
                      {confirmDeleteId === selectedProvider.id ? (
                        <>
                           <AlertTriangle className="w-4 h-4" />
                           <span className="text-xs font-bold whitespace-nowrap">{t('settings.confirmDelete')}</span>
                        </>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* General Config */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('settings.general')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">{t('settings.name')}</label>
                      <input 
                        className="w-full px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 rounded-lg text-sm text-zinc-900 dark:text-white border-none focus:ring-2 focus:ring-[#0071e3]"
                        value={selectedProvider.name}
                        onChange={e => updateSelectedProvider({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">{t('settings.type')}</label>
                      <select 
                        className="w-full px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 rounded-lg text-sm text-zinc-900 dark:text-white border-none focus:ring-2 focus:ring-[#0071e3]"
                        value={selectedProvider.type}
                        onChange={e => updateSelectedProvider({ type: e.target.value as any })}
                      >
                        <option value="gemini">{t('settings.gemini')}</option>
                        <option value="custom">{t('settings.custom')}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">{t('settings.apiKey')}</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                      <input 
                        type="password"
                        className="w-full pl-10 px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 rounded-lg text-sm text-zinc-900 dark:text-white border-none focus:ring-2 focus:ring-[#0071e3]"
                        value={selectedProvider.apiKey}
                        onChange={e => updateSelectedProvider({ apiKey: e.target.value })}
                        placeholder="sk-..."
                      />
                    </div>
                  </div>

                  {selectedProvider.type === 'custom' ? (
                     <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center gap-2 text-amber-600 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Enter full URLs for custom providers (no auto-concatenation).</span>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Chat Completion URL <span className="text-red-500">*</span></label>
                         <input 
                           className="w-full px-3 py-2 bg-white dark:bg-black/40 rounded-lg text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#0071e3]"
                           value={selectedProvider.chatUrl || ''}
                           onChange={e => updateSelectedProvider({ chatUrl: e.target.value })}
                           placeholder="https://api.openai.com/v1/chat/completions"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Image Generation URL <span className="text-red-500">*</span></label>
                         <input 
                           className="w-full px-3 py-2 bg-white dark:bg-black/40 rounded-lg text-sm text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#0071e3]"
                           value={selectedProvider.imageUrl || ''}
                           onChange={e => updateSelectedProvider({ imageUrl: e.target.value })}
                           placeholder="https://api.openai.com/v1/images/generations"
                         />
                       </div>
                     </div>
                  ) : (
                    <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">{t('settings.baseUrl')}</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                                <input 
                                  className="w-full pl-10 px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 rounded-lg text-sm text-zinc-900 dark:text-white border-none focus:ring-2 focus:ring-[#0071e3]"
                                  value={selectedProvider.baseUrl || ''}
                                  onChange={e => updateSelectedProvider({ baseUrl: e.target.value })}
                                  placeholder="https://generativelanguage.googleapis.com"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1.5 ml-1">
                               Optional Proxy URL. If set, requests will be sent via raw HTTP to this address instead of using the Google SDK.
                            </p>
                         </div>
                    </div>
                  )}
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Models Config */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('settings.models')}</h3>
                  
                  {/* Chat Models */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">{t('settings.chatModels')}</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedProvider.chatModels.map(m => (
                        <span key={m.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">
                          {m.name}
                          <button type="button" onClick={() => handleRemoveModel('chat', m.id)} className="hover:text-blue-800 dark:hover:text-blue-100"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 px-3 py-1.5 bg-[#F5F5F7] dark:bg-black/20 rounded-lg text-sm border-none focus:ring-2 focus:ring-[#0071e3]"
                         placeholder={t('settings.addModel')}
                         value={newModelName}
                         onChange={e => setNewModelName(e.target.value)}
                         onKeyDown={e => {
                            if(e.key === 'Enter') handleAddModel('chat');
                         }}
                       />
                       <button type="button" onClick={() => handleAddModel('chat')} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700">
                         Add
                       </button>
                    </div>
                  </div>

                  {/* Image Models */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">{t('settings.imageModels')}</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedProvider.imageModels.map(m => (
                        <span key={m.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-medium border border-purple-100 dark:border-purple-800">
                          {m.name}
                          <button type="button" onClick={() => handleRemoveModel('image', m.id)} className="hover:text-purple-800 dark:hover:text-purple-100"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                       <input 
                         className="flex-1 px-3 py-1.5 bg-[#F5F5F7] dark:bg-black/20 rounded-lg text-sm border-none focus:ring-2 focus:ring-[#0071e3]"
                         placeholder={t('settings.addModel')}
                         value={newModelName}
                         onChange={e => setNewModelName(e.target.value)}
                         onKeyDown={e => {
                            if(e.key === 'Enter') handleAddModel('image');
                         }}
                       />
                       <button type="button" onClick={() => handleAddModel('image')} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700">
                         Add
                       </button>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
               <Server className="w-12 h-12 mb-4 opacity-20" />
               <p>Select or add a provider to configure</p>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-black/20">
             <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
             >
                {t('settings.cancel')}
             </button>
             <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white text-sm font-medium shadow-sm flex items-center gap-2"
             >
                <Save className="w-4 h-4" />
                {t('settings.save')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
