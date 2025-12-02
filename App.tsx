
import React, { useState, useEffect, useCallback } from 'react';
import InputSection from './components/InputSection';
import PreviewSection from './components/PreviewSection';
import StyleManager from './components/StyleManager';
import SettingsModal from './components/SettingsModal';
import { StyleOption, Language, AiConfig } from './types';
import { generateCardHtml, generateImage } from './services/geminiService';
import { DEFAULT_STYLES, TRANSLATIONS, DEFAULT_AI_CONFIG } from './constants';
import { Sparkles, Key } from 'lucide-react';

const App: React.FC = () => {
  // --- State Initialization with LocalStorage Persistence ---

  // 1. Language
  const [lang, setLang] = useState<Language>(() => {
     return (localStorage.getItem('knowledge_card_lang') as Language) || 'en';
  });

  // 2. Styles
  const [styles, setStyles] = useState<StyleOption[]>(() => {
    const saved = localStorage.getItem('knowledge_card_styles_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse saved styles", e);
      }
    }
    return DEFAULT_STYLES;
  });

  // 3. AI Config (New)
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => {
    const saved = localStorage.getItem('knowledge_card_ai_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure merged defaults for backward compatibility
        return { ...DEFAULT_AI_CONFIG, ...parsed };
      } catch (e) {
        console.error("Failed to parse ai config", e);
      }
    }
    return DEFAULT_AI_CONFIG;
  });

  // 4. Mode
  const [mode, setMode] = useState<'html' | 'image'>(() => {
    return (localStorage.getItem('knowledge_card_mode') as 'html' | 'image') || 'html';
  });

  // 5. Content
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_content') || '';
  });

  // 6. Selected Style ID
  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_selected_style_id') || 'apple';
  });

  // 7. Theme Color
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_theme_color') || 'default';
  });

  // 8. Corner Radius
  const [cornerRadius, setCornerRadius] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_corner_radius') || 'rounded-2xl';
  });

  // 9. Card Size
  const [cardSize, setCardSize] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_size') || 'standard';
  });

  // 10. Active Prompts
  const [htmlPrompt, setHtmlPrompt] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState<string>('');

  // 11. Output Data
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 12. App Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('theme') === 'light') return 'light';
      if (document.documentElement.classList.contains('dark')) return 'dark';
    }
    return 'dark';
  });

  // 13. Modals
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 14. API Key State (Only strictly required if Provider is Gemini)
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  // --- Helpers ---
  const t = useCallback((key: string): string => {
    return TRANSLATIONS[lang][key] || key;
  }, [lang]);

  // --- Effects ---

  useEffect(() => { localStorage.setItem('knowledge_card_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('knowledge_card_styles_config', JSON.stringify(styles)); }, [styles]);
  useEffect(() => { localStorage.setItem('knowledge_card_ai_config', JSON.stringify(aiConfig)); }, [aiConfig]);
  useEffect(() => { localStorage.setItem('knowledge_card_mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('knowledge_card_content', content); }, [content]);
  useEffect(() => { localStorage.setItem('knowledge_card_selected_style_id', selectedStyleId); }, [selectedStyleId]);
  useEffect(() => { localStorage.setItem('knowledge_card_theme_color', themeColor); }, [themeColor]);
  useEffect(() => { localStorage.setItem('knowledge_card_corner_radius', cornerRadius); }, [cornerRadius]);
  useEffect(() => { localStorage.setItem('knowledge_card_size', cardSize); }, [cardSize]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Check API Key on Mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          setHasApiKey(false); 
        }
      } catch (e) {
        console.error("Error checking API key:", e);
        setHasApiKey(false);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  // Handle Prompt Initialization & Updates when Style Changes
  useEffect(() => {
    const currentStyle = styles.find(s => s.id === selectedStyleId) || styles[0];
    if (currentStyle) {
      setHtmlPrompt(currentStyle.htmlPrompt);
      setImagePrompt(currentStyle.imagePrompt);
    }
  }, [selectedStyleId, styles]);

  // Ensure selected style is valid for current mode
  useEffect(() => {
    const currentStyle = styles.find(s => s.id === selectedStyleId);
    if (!currentStyle || !currentStyle.supportedModes.includes(mode)) {
      const validStyle = styles.find(s => s.supportedModes.includes(mode));
      if (validStyle) {
        setSelectedStyleId(validStyle.id);
      }
    }
  }, [mode, styles, selectedStyleId]);


  // --- Handlers ---

  const handleConnectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    } else {
      alert("AI Studio environment not detected.");
    }
  };

  const handleSaveStyle = (style: StyleOption) => {
    setStyles(prev => {
      const index = prev.findIndex(s => s.id === style.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = style;
        return next;
      }
      return [...prev, style];
    });
  };

  const handleDeleteStyle = (id: string) => {
    const newStyles = styles.filter(s => s.id !== id);
    if (newStyles.length === 0) {
      setStyles(DEFAULT_STYLES);
      setSelectedStyleId(DEFAULT_STYLES[0].id);
      return;
    }
    setStyles(newStyles);
    if (selectedStyleId === id) {
      setSelectedStyleId(newStyles[0].id);
    }
  };

  const handleResetStyles = () => {
    setStyles(DEFAULT_STYLES);
    setSelectedStyleId(DEFAULT_STYLES[0].id);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedHtml(null); 
    setGeneratedImage(null);

    try {
      if (mode === 'html') {
        const result = await generateCardHtml({
          content,
          systemInstruction: htmlPrompt,
          themeColor,
          appTheme: theme,
          cornerRadius,
          cardSize
        }, aiConfig);
        setGeneratedHtml(result.html);
      } else {
        let ratio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1';
        if (cardSize === 'tall') ratio = '9:16';
        if (cardSize === 'wide') ratio = '16:9';

        const result = await generateImage({
          content,
          stylePrompt: imagePrompt,
          themeColor,
          aspectRatio: ratio
        }, aiConfig);
        setGeneratedImage(result.imageUri);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.message || String(error);

      // 1. Custom Provider Errors (e.g. Model not supported, 401, 404)
      if (aiConfig.provider === 'custom') {
         const confirmMsg = `${t('error.customProvider')}\n\n${msg}\n\n${t('error.checkSettings')}`;
         if (window.confirm(confirmMsg)) {
            setIsSettingsOpen(true);
         }
         return;
      }
      
      // 2. Gemini Permission Errors
      if (aiConfig.provider === 'gemini' && (msg.includes('403') || msg.includes('permission') || msg.includes('not found'))) {
        if (window.confirm(t('error.accessDenied'))) {
           handleConnectKey();
        }
        return;
      }

      // 3. Generic Error
      alert(`Generation failed: ${msg}`);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetPrompt = () => {
    const currentStyle = styles.find(s => s.id === selectedStyleId);
    if (currentStyle) {
      if (mode === 'html') {
        setHtmlPrompt(currentStyle.htmlPrompt);
      } else {
        setImagePrompt(currentStyle.imagePrompt);
      }
    }
  };

  const activePrompt = mode === 'html' ? htmlPrompt : imagePrompt;
  const setActivePrompt = (val: string) => {
    if (mode === 'html') setHtmlPrompt(val);
    else setImagePrompt(val);
  };

  // --- Render Loading / Login Screen ---
  if (isCheckingKey) {
    return <div className="flex h-screen w-screen items-center justify-center bg-[#F5F5F7] dark:bg-black"></div>;
  }

  // Allow bypass if using custom provider
  if (!hasApiKey && aiConfig.provider === 'gemini') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F5F5F7] dark:bg-black p-4 font-sans text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
             <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('welcome.title')}</h1>
            <p className="text-zinc-500 font-medium">{t('welcome.subtitle')}</p>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('welcome.requireKey')}
          </p>
          <button
            onClick={handleConnectKey}
            className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30"
          >
            <Key className="w-4 h-4" />
            {t('welcome.btn.connect')}
          </button>
          
          <div className="relative flex py-2 items-center">
             <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
             <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs">OR</span>
             <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
          </div>
          
          <button
             onClick={() => setIsSettingsOpen(true)}
             className="w-full py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
             {t('settings.custom')}
          </button>

          <div className="text-xs text-zinc-400 hover:text-blue-500 transition-colors mt-4">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer">
              {t('welcome.billing')}
            </a>
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
             <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                {t('lang.toggle')}
             </button>
          </div>
          
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            config={aiConfig}
            onSave={setAiConfig}
            t={t}
          />
        </div>
      </div>
    );
  }

  // --- Render Main App ---
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F7] dark:bg-black font-sans selection:bg-blue-100 selection:text-blue-900">
      
      <StyleManager 
        isOpen={isStyleManagerOpen}
        onClose={() => setIsStyleManagerOpen(false)}
        styles={styles}
        onSaveStyle={handleSaveStyle}
        onDeleteStyle={handleDeleteStyle}
        onResetStyles={handleResetStyles}
        t={t}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={aiConfig}
        onSave={setAiConfig}
        t={t}
      />

      {/* Input Panel */}
      <div className="w-full md:w-[480px] h-full flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 shadow-xl z-20">
        <InputSection
          content={content}
          setContent={setContent}
          selectedStyle={selectedStyleId}
          setSelectedStyle={setSelectedStyleId}
          themeColor={themeColor}
          setThemeColor={setThemeColor}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          currentPrompt={activePrompt}
          onUpdatePrompt={setActivePrompt}
          onResetPrompt={handleResetPrompt}
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          lang={lang}
          toggleLang={() => setLang(lang === 'en' ? 'zh' : 'en')}
          cornerRadius={cornerRadius}
          setCornerRadius={setCornerRadius}
          cardSize={cardSize}
          setCardSize={setCardSize}
          mode={mode}
          setMode={setMode}
          styles={styles}
          onOpenStyleManager={() => setIsStyleManagerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          t={t}
        />
      </div>

      {/* Preview Panel */}
      <div className="flex-1 h-full relative min-w-0">
        <PreviewSection
          html={generatedHtml}
          imageSrc={generatedImage}
          isLoading={isGenerating}
          mode={mode}
          t={t}
        />
      </div>
    </div>
  );
};

export default App;