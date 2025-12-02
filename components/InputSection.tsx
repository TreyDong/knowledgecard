

import React, { useState, useRef, useEffect } from 'react';
import { StyleOption, Language, AiProvider } from '../types';
import { THEME_COLORS } from '../constants';
import { Wand2, Loader2, Settings2, RotateCcw, Check, Moon, Sun, Smartphone, Monitor, Square, LayoutTemplate, Image as ImageIcon, Settings, ChevronDown, ChevronUp, Languages, Sliders, Box, Upload, X, Copy } from 'lucide-react';

interface InputSectionProps {
  content: string;
  setContent: (val: string) => void;
  selectedStyle: string;
  setSelectedStyle: (val: string) => void;
  themeColor: string;
  setThemeColor: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  currentPrompt: string;
  onUpdatePrompt: (val: string) => void;
  onResetPrompt: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  cornerRadius: string;
  setCornerRadius: (val: string) => void;
  cardSize: string;
  setCardSize: (val: string) => void;
  mode: 'html' | 'image';
  setMode: (val: 'html' | 'image') => void;
  styles: StyleOption[];
  onOpenStyleManager: () => void;
  onOpenSettings: () => void;
  t: (key: string) => string;
  // Provider Props
  providers: AiProvider[];
  activeProviderId: string;
  setActiveProviderId: (id: string) => void;
  activeModelId: string;
  setActiveModelId: (id: string) => void;
  // Image Props
  referenceImage: string | null;
  setReferenceImage: (val: string | null) => void;
  imageCount: number;
  setImageCount: (val: number) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  content,
  setContent,
  selectedStyle,
  setSelectedStyle,
  themeColor,
  setThemeColor,
  onGenerate,
  isGenerating,
  currentPrompt,
  onUpdatePrompt,
  onResetPrompt,
  theme,
  toggleTheme,
  lang,
  toggleLang,
  cornerRadius,
  setCornerRadius,
  cardSize,
  setCardSize,
  mode,
  setMode,
  styles,
  onOpenStyleManager,
  onOpenSettings,
  t,
  providers,
  activeProviderId,
  setActiveProviderId,
  activeModelId,
  setActiveModelId,
  referenceImage,
  setReferenceImage,
  imageCount,
  setImageCount
}) => {
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableStyles = styles.filter(s => s.supportedModes.includes(mode));
  const currentStyleObj = styles.find(s => s.id === selectedStyle);

  // Derive available models based on selected provider and mode
  const activeProvider = providers.find(p => p.id === activeProviderId) || providers[0];
  const availableModels = activeProvider ? (mode === 'html' ? activeProvider.chatModels : activeProvider.imageModels) : [];

  // Ensure active model is valid when switching providers/modes
  useEffect(() => {
    if (availableModels.length > 0) {
      const exists = availableModels.find(m => m.id === activeModelId);
      if (!exists) {
        setActiveModelId(availableModels[0].id);
      }
    }
  }, [activeProviderId, mode, availableModels, activeModelId, setActiveModelId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStyleName = (style: StyleOption) => t(`style.${style.id}.name`) !== `style.${style.id}.name` ? t(`style.${style.id}.name`) : style.name;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1e] text-zinc-900 dark:text-zinc-100 p-8 overflow-y-auto custom-scrollbar transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {t('app.title')}
          </h1>
          <p className="text-zinc-500 text-xs mt-1 font-medium">
            {t('app.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
           <button
            onClick={toggleLang}
            className="px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-[10px] font-semibold flex items-center gap-1"
            title={t('lang.toggle')}
          >
            <Languages className="w-3 h-3" />
            {lang === 'en' ? 'EN' : 'CN'}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title={t('theme.toggle')}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Provider / Model Selection Row */}
      <div className="mb-6 grid grid-cols-2 gap-3">
         <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">{t('label.provider')}</label>
            <div className="relative">
               <select
                  value={activeProviderId}
                  onChange={(e) => setActiveProviderId(e.target.value)}
                  className="w-full appearance-none bg-[#F5F5F7] dark:bg-[#2c2c2e] text-xs font-medium px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-[#0071e3] text-zinc-700 dark:text-zinc-200"
               >
                  {providers.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </select>
               <Settings className="absolute right-3 top-2.5 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
         </div>
         <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">{t('label.model')}</label>
            <div className="relative">
               <select
                  value={activeModelId}
                  onChange={(e) => setActiveModelId(e.target.value)}
                  className="w-full appearance-none bg-[#F5F5F7] dark:bg-[#2c2c2e] text-xs font-medium px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-[#0071e3] text-zinc-700 dark:text-zinc-200"
               >
                  {availableModels.map(m => (
                     <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
               </select>
               <Box className="absolute right-3 top-2.5 w-3 h-3 text-zinc-400 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Mode Switcher */}
      <div className="mb-6 bg-[#F5F5F7] dark:bg-zinc-800 p-1 rounded-lg flex relative">
        <div 
          className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white dark:bg-[#2c2c2e] rounded shadow-sm transition-all duration-300 ease-out top-1"
          style={{ left: mode === 'html' ? '4px' : 'calc(50% + 0px)' }}
        />
        <button
          onClick={() => setMode('html')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium z-10 transition-colors ${
            mode === 'html' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          {t('mode.html')}
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium z-10 transition-colors ${
            mode === 'image' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          {t('mode.image')}
        </button>
      </div>

      {/* Content Input */}
      <div className="mb-6 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {mode === 'html' ? t('label.content') : t('label.prompt')}
        </label>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={mode === 'html' ? t('placeholder.content') : t('placeholder.prompt')}
            className="w-full h-32 bg-[#F5F5F7] dark:bg-[#2c2c2e] border-none rounded-xl p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-[#0071e3] resize-none transition-all"
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-zinc-400 font-medium bg-zinc-200/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
            {content.length} {t('chars')}
          </div>
        </div>
      </div>
      
      {/* Image Reference Upload (Image Mode Only) */}
      {mode === 'image' && (
        <div className="mb-6 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t('label.refImage')}
          </label>
          {referenceImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
               <img src={referenceImage} alt="Reference" className="w-full h-32 object-cover opacity-80" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setReferenceImage(null)}
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
            </div>
          ) : (
            <div 
              onClick={triggerFileUpload}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <Upload className="w-6 h-6 text-zinc-400 group-hover:text-[#0071e3] mb-2 transition-colors" />
              <p className="text-xs text-zinc-500 font-medium group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                {t('drag.drop')}
              </p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </div>
      )}

      {/* Style Dropdown */}
      <div className="mb-6 space-y-3 relative z-20" ref={dropdownRef}>
         <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t('label.style')}
            </label>
            <button 
              onClick={onOpenStyleManager}
              className="text-xs text-[#0071e3] font-medium hover:underline flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              {t('btn.manage')}
            </button>
         </div>
         
         <button
            onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#2c2c2e] hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-colors group text-left"
          >
            {currentStyleObj ? (
              <div className="flex items-center gap-3">
                <span className="text-xl">{currentStyleObj.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                    {getStyleName(currentStyleObj)}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-zinc-500 text-sm pl-1">{t('select.style')}</span>
            )}
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isStyleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isStyleDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
               {availableStyles.length === 0 ? (
                 <div className="p-4 text-center text-zinc-500 text-sm">{t('no.styles')}</div>
               ) : (
                 availableStyles.map(style => (
                   <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setIsStyleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#0071e3] hover:text-white transition-colors group"
                   >
                     <span className="text-lg">{style.icon}</span>
                     <span className={`text-sm font-medium ${selectedStyle === style.id ? 'text-[#0071e3] group-hover:text-white' : 'text-zinc-700 dark:text-zinc-200 group-hover:text-white'}`}>
                       {getStyleName(style)}
                     </span>
                     {selectedStyle === style.id && <Check className="w-4 h-4 ml-auto text-[#0071e3] group-hover:text-white" />}
                   </button>
                 ))
               )}
            </div>
          )}
      </div>

      {/* Color Selection */}
      <div className="mb-6 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t('label.color')}
        </label>
        <div className="flex flex-wrap gap-3">
          {THEME_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setThemeColor(color.value)}
              className={`w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${color.class} ${
                themeColor === color.value ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-zinc-500' : ''
              }`}
              title={color.name}
            >
              {themeColor === color.value && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Controls (Size / Radius / Count) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {mode === 'html' ? t('label.format') : t('label.aspect')}
          </label>
          <div className="flex bg-[#F5F5F7] dark:bg-[#2c2c2e] rounded-lg p-1">
             {[
               { id: 'tall', icon: <Smartphone className="w-3.5 h-3.5" /> },
               { id: 'standard', icon: <Square className="w-3.5 h-3.5" /> },
               { id: 'wide', icon: <Monitor className="w-3.5 h-3.5" /> },
             ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCardSize(opt.id)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs transition-all ${
                    cardSize === opt.id
                    ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                >
                  {opt.icon}
                </button>
             ))}
          </div>
        </div>

        {mode === 'html' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t('label.radius')}
            </label>
            <div className="flex bg-[#F5F5F7] dark:bg-[#2c2c2e] rounded-lg p-1">
              {[
                { id: 'rounded-none', label: '0' },
                { id: 'rounded-xl', label: '12' },
                { id: 'rounded-[2.5rem]', label: '40' },
              ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCornerRadius(opt.id)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs transition-all ${
                      cornerRadius === opt.id
                      ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span className={`w-3 h-3 border border-current mr-1 ${opt.id === 'rounded-none' ? 'rounded-none' : opt.id === 'rounded-xl' ? 'rounded-sm' : 'rounded-full'}`}></span>
                  </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
             <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
               {t('label.imgCount')}
             </label>
             <div className="flex bg-[#F5F5F7] dark:bg-[#2c2c2e] rounded-lg p-1">
                {[1, 2, 3, 4].map(num => (
                   <button
                     key={num}
                     onClick={() => setImageCount(num)}
                     className={`flex-1 flex items-center justify-center py-1.5 rounded text-xs font-medium transition-all ${
                       imageCount === num 
                       ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                       : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                     }`}
                   >
                     {num}
                   </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Advanced Prompt Toggle */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowPromptEditor(!showPromptEditor)}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1"
        >
          <Settings2 className="w-3 h-3" />
          {showPromptEditor ? t('btn.advanced').replace('Options', '') : t('btn.advanced')}
        </button>

        <button 
          onClick={onOpenSettings}
          className="text-xs text-zinc-400 hover:text-[#0071e3] flex items-center gap-1 transition-colors"
        >
           <Sliders className="w-3 h-3" />
           {t('btn.settings')}
        </button>
      </div>

      {showPromptEditor && (
        <div className="mb-6 p-3 bg-[#F5F5F7] dark:bg-[#2c2c2e] rounded-xl animate-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-zinc-500">{t('label.systemPrompt')}</span>
              <button onClick={onResetPrompt} className="text-[10px] text-[#0071e3] hover:underline flex items-center gap-1">
                 <RotateCcw className="w-2.5 h-2.5" /> {t('btn.reset')}
              </button>
           </div>
           <textarea
             value={currentPrompt}
             onChange={(e) => onUpdatePrompt(e.target.value)}
             className="w-full h-32 text-xs font-mono bg-white dark:bg-black/30 border-none rounded-lg p-2 text-zinc-600 dark:text-zinc-400 focus:ring-1 focus:ring-[#0071e3]"
           />
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !content.trim()}
          className={`w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isGenerating || !content.trim()
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wand2 className="w-5 h-5" />
          )}
          {isGenerating ? t('btn.processing') : t('btn.generate')}
        </button>
      </div>

    </div>
  );
};

export default InputSection;