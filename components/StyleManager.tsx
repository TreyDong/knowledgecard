
import React, { useState, useEffect } from 'react';
import { StyleOption } from '../types';
import { DEFAULT_STYLES } from '../constants';
import { X, Save, Plus, Trash2, LayoutTemplate, Image as ImageIcon, Check, Search, AlertTriangle } from 'lucide-react';

interface StyleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  styles: StyleOption[];
  onSaveStyle: (style: StyleOption) => void;
  onDeleteStyle: (id: string) => void;
  onResetStyles: () => void;
  t: (key: string) => string;
}

const StyleManager: React.FC<StyleManagerProps> = ({
  isOpen,
  onClose,
  styles,
  onSaveStyle,
  onDeleteStyle,
  onResetStyles,
  t
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [editState, setEditState] = useState<StyleOption | null>(null);
  
  // Confirmation states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Initialize selection when opening
  useEffect(() => {
    if (isOpen && styles.length > 0 && !selectedId) {
      setSelectedId(styles[0].id);
    }
  }, [isOpen, styles, selectedId]);

  // Handle case where selection becomes invalid (e.g. after deletion)
  // But strictly allow "new style creation" where ID doesn't exist in styles yet.
  useEffect(() => {
    if (isOpen && styles.length > 0) {
      const existsInStyles = styles.some(s => s.id === selectedId);
      // We are creating a new style if the selected ID matches the editState (which holds the new style)
      // and it is NOT in the saved styles list.
      const isCreatingNew = editState && editState.id === selectedId && !existsInStyles;

      if (selectedId && !existsInStyles && !isCreatingNew) {
        setSelectedId(styles[0].id);
      } else if (!selectedId) {
        setSelectedId(styles[0].id);
      }
    }
  }, [isOpen, styles, selectedId, editState]);

  // Sync editState when selection changes and apply localization
  useEffect(() => {
    if (!selectedId) return;

    // First, check if we are selecting an existing style
    const style = styles.find(s => s.id === selectedId);
    
    if (style) {
      // Localized display logic
      let displayName = style.name;
      let displayDesc = style.description;

      const defaultStyle = DEFAULT_STYLES.find(ds => ds.id === style.id);
      if (defaultStyle) {
         // If current matches default (English), try to show translation
         const transName = t(`style.${style.id}.name`);
         if (style.name === defaultStyle.name && transName && transName !== `style.${style.id}.name`) {
             displayName = transName;
         }

         const transDesc = t(`style.${style.id}.desc`);
         if (style.description === defaultStyle.description && transDesc && transDesc !== `style.${style.id}.desc`) {
             displayDesc = transDesc;
         }
      }

      setEditState({ ...style, name: displayName, description: displayDesc });
      // Clear confirmations
      setConfirmDeleteId(null);
    } 
    // If not found in styles, we might be in "creation mode", 
    // effectively editState is already set by handleCreateNew, so we do nothing here.
    
  }, [selectedId, styles, t]);

  if (!isOpen) return null;

  const handleCreateNew = () => {
    const newId = `custom-${Date.now()}`;
    const newStyle: StyleOption = {
      id: newId,
      name: t('manager.new.name'),
      description: t('manager.new.desc'),
      icon: '🎨',
      gradient: 'bg-zinc-100',
      htmlPrompt: 'You are an expert designer...',
      imagePrompt: 'A high quality image of...',
      supportedModes: ['html', 'image']
    };
    
    // Set edit state first
    setEditState(newStyle);
    // Then set selection to this new ID
    setSelectedId(newId);
    setConfirmDeleteId(null);
  };

  const handleSave = () => {
    if (editState) {
      onSaveStyle(editState);
    }
  };

  const handleDeleteClick = () => {
    if (!editState) return;
    
    if (confirmDeleteId === editState.id) {
      const idToDelete = editState.id;
      
      // Execute deletion
      onDeleteStyle(idToDelete);
      
      // Reset confirmation
      setConfirmDeleteId(null);
      
      // Important: Immediately switch selection to avoid the component thinking we are "creating" this style 
      // (since it will vanish from styles list but match editState).
      const fallback = styles.find(s => s.id !== idToDelete) || styles[0];
      if (fallback) {
        setSelectedId(fallback.id);
      }
    } else {
      setConfirmDeleteId(editState.id);
      // Timeout to auto-reset confirmation
      setTimeout(() => setConfirmDeleteId(null), 4000);
    }
  };

  const handleResetClick = () => {
    if (confirmReset) {
      onResetStyles();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  const toggleMode = (mode: 'html' | 'image') => {
    if (!editState) return;
    const current = editState.supportedModes;
    let next: ('html' | 'image')[];

    if (current.includes(mode)) {
      if (current.length === 1) return; // Must have at least one mode
      next = current.filter(m => m !== mode);
    } else {
      next = [...current, mode];
    }
    setEditState({ ...editState, supportedModes: next });
  };

  const getStyleName = (style: StyleOption) => t(`style.${style.id}.name`) !== `style.${style.id}.name` ? t(`style.${style.id}.name`) : style.name;

  // Combine existing styles with the potential new style for the list display
  // We only add editState to the list if it's NOT in styles.
  const displayList = [...styles];
  if (editState && !styles.find(s => s.id === editState.id)) {
    displayList.push(editState);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl flex overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Sidebar */}
        <div className="w-64 bg-[#F5F5F7] dark:bg-[#2c2c2e] border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white pl-2">{t('manager.title')}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {displayList.map(style => {
              const isSelected = selectedId === style.id;
              // If it's the new temporary style, use the name from editState directly
              const name = (editState && style.id === editState.id && !styles.find(s => s.id === style.id)) 
                ? editState.name 
                : getStyleName(style);

              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedId(style.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all ${
                    isSelected 
                      ? 'bg-[#0071e3] text-white shadow-sm' 
                      : 'hover:bg-zinc-200/50 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="text-lg">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : ''}`}>
                      {name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-zinc-200 dark:border-zinc-700/50">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/20 border border-zinc-200 dark:border-zinc-600 rounded-lg text-xs font-medium text-zinc-700 dark:text-white transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('manager.btn.add')}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1c1c1e]">
          {/* Header */}
          <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
             <div>
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {editState ? editState.name : t('manager.title')}
                </h1>
                <p className="text-sm text-zinc-500 mt-1">{t('manager.subtitle')}</p>
             </div>
             <button 
                onClick={onClose}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-8">
            {editState ? (
              <div className="max-w-2xl space-y-8">
                
                {/* Basic Info Group */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{t('manager.label.name')}</label>
                      <input
                        type="text"
                        value={editState.name}
                        onChange={(e) => setEditState({...editState, name: e.target.value})}
                        className="w-full px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                      />
                    </div>
                    <div className="w-24">
                       <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{t('manager.label.icon')}</label>
                       <input
                        type="text"
                        value={editState.icon}
                        onChange={(e) => setEditState({...editState, icon: e.target.value})}
                        className="w-full px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-center text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{t('manager.label.desc')}</label>
                    <input
                      type="text"
                      value={editState.description}
                      onChange={(e) => setEditState({...editState, description: e.target.value})}
                      className="w-full px-3 py-2 bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#0071e3] transition-all"
                    />
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Capabilities */}
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">{t('manager.label.capabilities')}</label>
                  <div className="flex gap-3">
                     <button
                        onClick={() => toggleMode('html')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-all ${
                          editState.supportedModes.includes('html')
                            ? 'bg-[#0071e3]/10 border-[#0071e3] text-[#0071e3]'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                        }`}
                      >
                        {editState.supportedModes.includes('html') && <Check className="w-4 h-4" />}
                        {t('manager.mode.html')}
                      </button>
                      <button
                        onClick={() => toggleMode('image')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-all ${
                          editState.supportedModes.includes('image')
                            ? 'bg-[#0071e3]/10 border-[#0071e3] text-[#0071e3]'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                        }`}
                      >
                        {editState.supportedModes.includes('image') && <Check className="w-4 h-4" />}
                        {t('manager.mode.image')}
                      </button>
                  </div>
                </div>

                {/* Prompts */}
                <div className="space-y-6">
                   {editState.supportedModes.includes('html') && (
                     <div>
                       <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide flex items-center justify-between">
                         <span>{t('manager.prompt.html')}</span>
                         <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">HTML Mode</span>
                       </label>
                       <textarea
                          value={editState.htmlPrompt}
                          onChange={(e) => setEditState({...editState, htmlPrompt: e.target.value})}
                          className="w-full h-40 font-mono text-xs leading-relaxed bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg p-4 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-[#0071e3] outline-none resize-none"
                          placeholder="Instructions for the AI..."
                        />
                     </div>
                   )}
                   
                   {editState.supportedModes.includes('image') && (
                     <div>
                       <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide flex items-center justify-between">
                         <span>{t('manager.prompt.image')}</span>
                         <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">Image Mode</span>
                       </label>
                       <textarea
                          value={editState.imagePrompt}
                          onChange={(e) => setEditState({...editState, imagePrompt: e.target.value})}
                          className="w-full h-32 font-mono text-xs leading-relaxed bg-[#F5F5F7] dark:bg-black/20 border-none rounded-lg p-4 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-[#0071e3] outline-none resize-none"
                          placeholder="Style description for the image model..."
                        />
                     </div>
                   )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>{t('manager.empty')}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20 flex justify-between items-center">
             <div>
                {editState && styles.find(s => s.id === editState.id) && (
                  <button 
                    onClick={handleDeleteClick}
                    className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      confirmDeleteId === editState.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10'
                    }`}
                  >
                    {confirmDeleteId === editState.id ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        {t('manager.confirm.delete')}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        {t('manager.btn.delete')}
                      </>
                    )}
                  </button>
                )}
             </div>
             <div className="flex gap-3">
               <button 
                 onClick={handleResetClick}
                 className={`text-sm font-medium px-4 py-2 transition-colors rounded-lg ${
                    confirmReset 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                 }`}
               >
                 {confirmReset ? t('manager.confirm.reset') : t('manager.btn.reset')}
               </button>
               <button 
                  onClick={handleSave}
                  className="bg-[#0071e3] hover:bg-[#0077ED] text-white text-sm font-medium px-6 py-2 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
               >
                  {t('manager.btn.save')}
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StyleManager;
