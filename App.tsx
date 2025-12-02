
import React, { useState, useEffect, useCallback } from 'react';
import InputSection from './components/InputSection';
import PreviewSection from './components/PreviewSection';
import StyleManager from './components/StyleManager';
import SettingsModal from './components/SettingsModal';
import { StyleOption, Language, AiProvider } from './types';
import { generateCardHtml, generateImage } from './services/geminiService';
import { DEFAULT_STYLES, TRANSLATIONS, DEFAULT_PROVIDERS } from './constants';

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

  // 3. Providers (New)
  const [providers, setProviders] = useState<AiProvider[]>(() => {
    const saved = localStorage.getItem('knowledge_card_providers');
    if (saved) {
       try {
         return JSON.parse(saved);
       } catch (e) {}
    }
    return DEFAULT_PROVIDERS;
  });

  // 4. Mode
  const [mode, setMode] = useState<'html' | 'image'>(() => {
    return (localStorage.getItem('knowledge_card_mode') as 'html' | 'image') || 'html';
  });

  // 5. Active Provider & Model
  const [activeProviderId, setActiveProviderId] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_active_provider_id') || 'google-official';
  });

  const [activeModelId, setActiveModelId] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_active_model_id') || 'gemini-3-pro-preview';
  });

  // 6. Content
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_content') || '';
  });

  // 7. Selected Style ID
  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_selected_style_id') || 'apple';
  });

  // 8. Theme Color
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_theme_color') || 'default';
  });

  // 9. Corner Radius
  const [cornerRadius, setCornerRadius] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_corner_radius') || 'rounded-2xl';
  });

  // 10. Card Size
  const [cardSize, setCardSize] = useState<string>(() => {
    return localStorage.getItem('knowledge_card_size') || 'standard';
  });

  // 11. Prompts
  const [htmlPrompt, setHtmlPrompt] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState<string>('');

  // 12. Output
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 13. Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('theme') === 'light') return 'light';
      if (document.documentElement.classList.contains('dark')) return 'dark';
    }
    return 'dark';
  });

  // 14. Modals
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Helpers ---
  const t = useCallback((key: string): string => {
    return TRANSLATIONS[lang][key] || key;
  }, [lang]);

  // --- Effects ---

  useEffect(() => { localStorage.setItem('knowledge_card_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('knowledge_card_styles_config', JSON.stringify(styles)); }, [styles]);
  useEffect(() => { localStorage.setItem('knowledge_card_providers', JSON.stringify(providers)); }, [providers]);
  useEffect(() => { localStorage.setItem('knowledge_card_mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('knowledge_card_content', content); }, [content]);
  useEffect(() => { localStorage.setItem('knowledge_card_selected_style_id', selectedStyleId); }, [selectedStyleId]);
  useEffect(() => { localStorage.setItem('knowledge_card_theme_color', themeColor); }, [themeColor]);
  useEffect(() => { localStorage.setItem('knowledge_card_corner_radius', cornerRadius); }, [cornerRadius]);
  useEffect(() => { localStorage.setItem('knowledge_card_size', cardSize); }, [cardSize]);
  useEffect(() => { localStorage.setItem('knowledge_card_active_provider_id', activeProviderId); }, [activeProviderId]);
  useEffect(() => { localStorage.setItem('knowledge_card_active_model_id', activeModelId); }, [activeModelId]);

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

  // Handle Prompt Initialization
  useEffect(() => {
    const currentStyle = styles.find(s => s.id === selectedStyleId) || styles[0];
    if (currentStyle) {
      setHtmlPrompt(currentStyle.htmlPrompt);
      setImagePrompt(currentStyle.imagePrompt);
    }
  }, [selectedStyleId, styles]);

  // Ensure selected style is valid
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

  const handleUpdateProviders = (newProviders: AiProvider[]) => {
    setProviders(newProviders);
    // Ensure active provider still exists
    if (!newProviders.find(p => p.id === activeProviderId)) {
      setActiveProviderId(newProviders[0]?.id || '');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedHtml(null); 
    setGeneratedImage(null);

    const provider = providers.find(p => p.id === activeProviderId);

    try {
      if (!provider) throw new Error("No provider selected");
      
      if (mode === 'html') {
        const result = await generateCardHtml({
          content,
          systemInstruction: htmlPrompt,
          themeColor,
          appTheme: theme,
          cornerRadius,
          cardSize
        }, provider, activeModelId);
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
        }, provider, activeModelId);
        setGeneratedImage(result.imageUri);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.message || String(error);
      const confirmMsg = `${t('error.provider')}\n\n${msg}\n\n${t('error.checkSettings')}`;
      
      // Sandbox fix: window.confirm is blocked. 
      // We log the error clearly and open settings automatically to help the user.
      console.warn(confirmMsg);
      setIsSettingsOpen(true);
      
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
        providers={providers}
        onUpdateProviders={handleUpdateProviders}
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
          // New Props
          providers={providers}
          activeProviderId={activeProviderId}
          setActiveProviderId={setActiveProviderId}
          activeModelId={activeModelId}
          setActiveModelId={setActiveModelId}
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
