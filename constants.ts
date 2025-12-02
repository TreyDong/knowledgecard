

import { StyleOption, ThemeColor, Language, AiProvider } from './types';

export const DEFAULT_PROVIDERS: AiProvider[] = [
  {
    id: 'google-official',
    name: 'Google Gemini',
    type: 'gemini',
    apiKey: '', // Will fall back to process.env
    baseUrl: '',
    chatModels: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
    ],
    imageModels: [
      { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image' },
      { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image' }
    ]
  },
  {
    id: 'openai-compatible',
    name: 'Custom / OpenAI',
    type: 'custom',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    chatUrl: 'https://api.openai.com/v1/chat/completions',
    imageUrl: 'https://api.openai.com/v1/images/generations',
    chatModels: [
      { id: 'gpt-4o', name: 'GPT-4o' }
    ],
    imageModels: [
      { id: 'dall-e-3', name: 'DALL-E 3' }
    ]
  }
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // App Base
    "app.title": "Knowledge Card",
    "app.subtitle": "AI Content Generator",
    "theme.toggle": "Toggle Theme",
    "lang.toggle": "Switch Language",
    
    // Welcome
    "welcome.title": "Welcome to Knowledge Card",
    "welcome.subtitle": "Create stunning visual assets with Gemini 3 Pro.",
    "welcome.requireKey": "This application uses advanced generative models which require a valid API key.",
    "welcome.btn.connect": "Configure API Key",
    "welcome.billing": "Learn about billing requirements",

    // Input Section
    "mode.html": "HTML Card",
    "mode.image": "AI Image",
    "label.content": "Content",
    "label.prompt": "Prompt",
    "placeholder.content": "Paste your text here...",
    "placeholder.prompt": "Describe your image idea...",
    "chars": "chars",
    "label.style": "Style Preset",
    "btn.manage": "Manage",
    "select.style": "Select a style...",
    "no.styles": "No compatible styles.",
    "label.color": "Accent Color",
    "label.format": "Format",
    "label.aspect": "Aspect",
    "label.radius": "Radius",
    "btn.advanced": "Advanced Options",
    "label.systemPrompt": "System Prompt Override",
    "btn.reset": "Reset",
    "btn.generate": "Generate",
    "btn.processing": "Processing...",
    "btn.confirm": "Confirm",
    "btn.cancel": "Cancel",
    "btn.reconnect": "Change API Key",
    "btn.settings": "Settings",
    "label.model": "Model",
    "label.provider": "Provider",
    "label.refImage": "Reference Image",
    "label.imgCount": "Count",
    "btn.upload": "Upload Image",
    "drag.drop": "Drag & drop or click",

    // Settings Modal
    "settings.title": "Settings",
    "settings.subtitle": "Configure providers and models.",
    "settings.providers": "Providers",
    "settings.addProvider": "Add Provider",
    "settings.general": "General Config",
    "settings.name": "Provider Name",
    "settings.type": "Type",
    "settings.baseUrl": "Base URL",
    "settings.apiKey": "API Key",
    "settings.chatUrl": "Chat Endpoint URL",
    "settings.imageUrl": "Image Endpoint URL",
    "settings.models": "Models",
    "settings.chatModels": "Chat Models",
    "settings.imageModels": "Image Models",
    "settings.addModel": "Add Model ID",
    "settings.save": "Save Changes",
    "settings.cancel": "Close",
    "settings.deleteProvider": "Delete Provider",
    "settings.confirmDelete": "Delete this provider?",
    "settings.gemini": "Google Gemini",
    "settings.custom": "Custom / OpenAI",
    "settings.placeholder.url": "e.g. https://api.openai.com/v1",
    "settings.placeholder.fullUrl": "e.g. https://api.example.com/v1/chat/completions",

    // Error Handling
    "error.provider": "Provider Error",
    "error.checkSettings": "Please check your settings.",
    "error.accessDenied": "Access denied. Check API Key.",

    // Preview
    "preview.loading": "Generating...",
    "preview.loading.desc": "Designing your asset...",
    "preview.empty.title": "Ready to Create",
    "preview.empty.desc": "Enter your content on the left to generate high-quality assets.",
    "preview.tab.visual": "Visual",
    "preview.tab.code": "Source",
    "preview.btn.download": "Download Image",
    "label.preview": "Preview",
    "label.result": "Result",

    // Style Manager
    "manager.title": "Style Settings",
    "manager.subtitle": "Configure generation parameters.",
    "manager.btn.add": "Add Style",
    "manager.btn.delete": "Delete Style",
    "manager.btn.reset": "Reset Defaults",
    "manager.btn.save": "Save Changes",
    "manager.confirm.delete": "Delete this style?",
    "manager.confirm.reset": "Reset all styles?",
    "manager.label.name": "Name",
    "manager.label.icon": "Icon",
    "manager.label.desc": "Description",
    "manager.label.capabilities": "Supported Capabilities",
    "manager.mode.html": "HTML Cards",
    "manager.mode.image": "AI Images",
    "manager.prompt.html": "HTML System Prompt",
    "manager.prompt.image": "Image Generation Prompt",
    "manager.empty": "Select a style to configure",
    "manager.new.name": "New Style",
    "manager.new.desc": "A custom style configuration.",

    // Default Style Names
    "style.apple.name": "Frosted Glass",
    "style.apple.desc": "Modern, minimalist, translucent layers.",
    "style.swiss.name": "Swiss Grid",
    "style.swiss.desc": "Bold typography, asymmetric layouts.",
    "style.editorial.name": "Editorial",
    "style.editorial.desc": "Elegant serif fonts, paper textures.",
    "style.cyberpunk.name": "Cyberpunk",
    "style.cyberpunk.desc": "Dark mode, neon, glitch effects.",
  },
  zh: {
    // App Base
    "app.title": "知识卡片",
    "app.subtitle": "AI 内容生成器",
    "theme.toggle": "切换主题",
    "lang.toggle": "切换语言",

    // Welcome
    "welcome.title": "欢迎使用知识卡片",
    "welcome.subtitle": "使用 Gemini 3 Pro 创建精美素材。",
    "welcome.requireKey": "本应用使用高级生成模型，需要配置有效的 API 密钥。",
    "welcome.btn.connect": "配置 API 密钥",
    "welcome.billing": "了解计费要求",
    
    // Input Section
    "mode.html": "HTML 卡片",
    "mode.image": "AI 绘图",
    "label.content": "内容",
    "label.prompt": "提示词",
    "placeholder.content": "在此粘贴您的文本...",
    "placeholder.prompt": "描述您的图片创意...",
    "chars": "字符",
    "label.style": "预设风格",
    "btn.manage": "管理",
    "select.style": "选择一种风格...",
    "no.styles": "没有兼容的风格",
    "label.color": "主题色",
    "label.format": "版式",
    "label.aspect": "比例",
    "label.radius": "圆角",
    "btn.advanced": "高级选项",
    "label.systemPrompt": "系统提示词覆盖",
    "btn.reset": "重置",
    "btn.generate": "生成",
    "btn.processing": "生成中...",
    "btn.confirm": "确认",
    "btn.cancel": "取消",
    "btn.reconnect": "更换 API 密钥",
    "btn.settings": "设置",
    "label.model": "模型",
    "label.provider": "服务商",
    "label.refImage": "参考图",
    "label.imgCount": "张数",
    "btn.upload": "上传图片",
    "drag.drop": "点击或拖拽上传",

    // Settings Modal
    "settings.title": "设置",
    "settings.subtitle": "配置模型服务商。",
    "settings.providers": "服务商列表",
    "settings.addProvider": "添加服务商",
    "settings.general": "通用配置",
    "settings.name": "名称",
    "settings.type": "类型",
    "settings.baseUrl": "Base URL",
    "settings.apiKey": "API Key",
    "settings.chatUrl": "聊天接口 (URL)",
    "settings.imageUrl": "绘图接口 (URL)",
    "settings.models": "模型列表",
    "settings.chatModels": "对话模型",
    "settings.imageModels": "绘图模型",
    "settings.addModel": "添加模型 ID",
    "settings.save": "保存更改",
    "settings.cancel": "关闭",
    "settings.deleteProvider": "删除服务商",
    "settings.confirmDelete": "确定删除？",
    "settings.gemini": "Google Gemini",
    "settings.custom": "Custom / OpenAI",
    "settings.placeholder.url": "例如 https://api.openai.com/v1",
    "settings.placeholder.fullUrl": "完整链接，例如 .../v1/chat/completions",

    // Error Handling
    "error.provider": "服务商返回错误",
    "error.checkSettings": "请检查设置。",
    "error.accessDenied": "访问被拒绝，请检查 API Key。",

    // Preview
    "preview.loading": "正在生成...",
    "preview.loading.desc": "AI 正在设计您的素材",
    "preview.empty.title": "准备就绪",
    "preview.empty.desc": "在左侧输入内容以生成高质量素材。",
    "preview.tab.visual": "预览",
    "preview.tab.code": "源码",
    "preview.btn.download": "下载图片",
    "label.preview": "预览",
    "label.result": "结果",

    // Style Manager
    "manager.title": "风格设置",
    "manager.subtitle": "配置生成参数",
    "manager.btn.add": "新建风格",
    "manager.btn.delete": "删除风格",
    "manager.btn.reset": "恢复默认",
    "manager.btn.save": "保存更改",
    "manager.confirm.delete": "确定删除？",
    "manager.confirm.reset": "确定重置？",
    "manager.label.name": "名称",
    "manager.label.icon": "图标",
    "manager.label.desc": "描述",
    "manager.label.capabilities": "支持功能",
    "manager.mode.html": "HTML 卡片",
    "manager.mode.image": "AI 图片",
    "manager.prompt.html": "HTML 系统提示词",
    "manager.prompt.image": "图片生成提示词",
    "manager.empty": "请选择左侧风格进行配置",
    "manager.new.name": "新建风格",
    "manager.new.desc": "自定义风格配置。",

    // Default Style Names
    "style.apple.name": "磨砂玻璃",
    "style.apple.desc": "现代、极简、半透明层叠效果。",
    "style.swiss.name": "瑞士网格",
    "style.swiss.desc": "粗体排版，不对称布局。",
    "style.editorial.name": "复古刊物",
    "style.editorial.desc": "优雅衬线字体，纸张纹理。",
    "style.cyberpunk.name": "赛博朋克",
    "style.cyberpunk.desc": "暗黑模式，霓虹灯，故障效果。",
  }
};

const BASE_SYSTEM_PROMPT = `
You are an expert Frontend Engineer and UI Designer specialized in creating single-file, self-contained HTML/CSS components.

Your task is to generate a standalone HTML file representing a "Knowledge Card" based on the user's content.

**1. CONTENT PROCESSING (CRITICAL)**
*   The user's input text may contain Markdown formatting. You **MUST** convert this to valid semantic HTML inside the card body.
    *   Convert \`# Heading\` lines to \`<h2>\` or \`<h3>\` tags with distinct styling (size, weight).
    *   Convert \`**bold**\` text to \`<strong>\` tags.
    *   Convert \`* italics\` to \`<em>\` tags.
    *   Convert lists (\`-\` or \`1.\`) into proper \`<ul>\` or \`<ol>\` tags with styled \`<li>\`.
    *   Convert newlines/paragraphs into \`<p>\` tags with proper spacing (\`mb-4\`).
*   **DO NOT** output raw markdown characters (like *, #, -) in the final HTML. The output must be clean, readable text.
*   **LANGUAGE**: The content of the card MUST remain in the same language as the user's input text. Do not translate the user's content unless explicitly asked.

**2. LAYOUT & DIMENSIONS (CRITICAL FOR IMAGE QUALITY)**
*   **Container**: The main card wrapper \`div\` MUST have a **FIXED WIDTH** of exactly \`600px\` (or Tailwind \`w-[600px]\`). Do NOT use \`w-full\`, \`max-w-md\`, or percentage widths for the card itself, as this causes distortion during image generation.
*   **Aspect Ratio**: The card should accommodate the content but maintain a vertical aesthetic. Ensure a minimum height \`min-h-[800px]\` or \`min-h-[700px]\`.
*   **Centering**: The card should be horizontally and vertically centered in the \`body\`.
*   **Whitespace**: Use generous padding (\`p-10\` or \`p-12\`). Do not cram text against the edges.

**3. TECHNICAL REQUIREMENTS**
*   **Framework**: Use Tailwind CSS (via CDN).
*   **Fonts (CRITICAL)**: 
    *   You **MUST** import fonts via Google Fonts \`<link>\` tags in the \`<head>\`.
    *   For **Chinese characters**, you **MUST** import 'Noto Sans SC' (for sans-serif styles) or 'Noto Serif SC' (for serif styles) to ensure consistent rendering.
    *   Example: \`<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">\`
*   **Structure**: 
    *   \`<body>\` should have a dark background (e.g., bg-zinc-900) to contrast with the card.
    *   Assign \`id="knowledge-card"\` to the main card container.
*   **Download Feature**:
    *   Include: \`<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>\`
    *   Add a "Download Image" button floating fixed at the bottom right of the screen (NOT inside the card).
    *   **Script Logic**: 
        *   Wrap the html2canvas call in \`document.fonts.ready.then(() => { ... })\` to ensure fonts are fully loaded before capturing.
        *   Use configuration: \`{ scale: 3, useCORS: true, backgroundColor: null }\`.
        *   Generate a high-quality PNG download.

**4. OUTPUT FORMAT**
*   Return ONLY the raw HTML string. Do not use markdown code blocks.
`;

export const DEFAULT_STYLES: StyleOption[] = [
  {
    id: 'apple',
    name: 'Frosted Glass',
    description: 'Modern, minimalist, translucent layers.',
    icon: '✨',
    gradient: 'bg-zinc-100',
    supportedModes: ['html', 'image'],
    htmlPrompt: `
    ${BASE_SYSTEM_PROMPT}
    **Design Style: Glassmorphism / Apple-esque**
    *   **Layout**: 
        *   Title: Top Left, large and bold (Inter Tight).
        *   Content: Bottom/Right, clean flow.
        *   Decorative: Subtle glowing orbs or gradients in the background.
    *   **Visuals**:
        *   Background: Soft mesh gradient (blue/purple/pink subtles).
        *   Card Material: White/Light Gray with high transparency (backdrop-filter: blur-2xl), thin white border.
    *   **Typography**:
        *   Font: 'Inter', 'Noto Sans SC' (Chinese), system-ui.
        *   Colors: Dark text (slate-800) on light glass.
    `,
    imagePrompt: `Minimalist abstract 3D composition. Glassmorphism style, frosted glass geometric shapes, soft pastel gradients, clean lines, high-end product design aesthetic, 8k resolution, soft studio lighting, cinematic depth of field.`
  },
  {
    id: 'swiss',
    name: 'Swiss Grid',
    description: 'Bold typography, asymmetric layouts.',
    icon: '🇨🇭',
    gradient: 'bg-red-50',
    supportedModes: ['html', 'image'],
    htmlPrompt: `
    ${BASE_SYSTEM_PROMPT}
    **Design Style: Swiss International Style**
    *   **Layout**: ASYMMETRIC GRID.
        *   Massive Title occupying the top or left half.
        *   Small, structured body text in columns or defined blocks.
    *   **Visuals**:
        *   Background: Bold solid color (Orange/Red/Yellow).
        *   Card: White or Off-white, flat, no shadow.
        *   Decor: Thick horizontal or vertical black lines (\`border-t-4 border-black\`).
    *   **Typography**:
        *   Font: 'Helvetica', 'Noto Sans SC' (Chinese), sans-serif (font-black).
        *   Style: Tight tracking, huge scale contrast.
    `,
    imagePrompt: `Swiss International Style graphic design poster. Bold typography, asymmetric grid layout, high contrast, solid flat colors, minimalism, bauhaus influence, geometric shapes, clean vector style.`
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Elegant serif fonts, paper textures.',
    icon: '📜',
    gradient: 'bg-orange-50',
    supportedModes: ['html', 'image'],
    htmlPrompt: `
    ${BASE_SYSTEM_PROMPT}
    **Design Style: Warm Retro / Editorial**
    *   **Layout**: Magazine / Book page.
        *   Title: Centered Serif or large Drop Cap.
    *   **Visuals**:
        *   Background: Texture (paper/grain).
        *   Colors: Cream, Coffee, Burnt Orange.
        *   Border: Double lines or ornate corners.
    *   **Typography**:
        *   Font: 'Merriweather', 'Playfair Display', 'Noto Serif SC' (Chinese), serif.
        *   Style: Elegant, readable, high line-height.
    `,
    imagePrompt: `Vintage editorial illustration. Grainy paper texture, warm earth tones (orange, cream, brown), retro 70s aesthetic, serif typography elements, visual noise, nostalgic atmosphere, faded colors, classic book cover style.`
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Dark mode, neon, glitch effects.',
    icon: '🤖',
    gradient: 'bg-zinc-900',
    supportedModes: ['html', 'image'],
    htmlPrompt: `
    ${BASE_SYSTEM_PROMPT}
    **Design Style: Cyberpunk / Glitch**
    *   **Layout**: Tech-heavy, grid lines, data corners.
    *   **Visuals**:
        *   Background: #000000.
        *   Card: Black with neon borders.
        *   Effects: Scanlines overlay (CSS), glitch text effects.
    *   **Typography**:
        *   Font: 'JetBrains Mono', 'Noto Sans SC' (Chinese), monospace.
        *   Colors: Neon Green, Cyan, or Hot Pink on Black.
    `,
    imagePrompt: `Cyberpunk city aesthetic. Neon lights, futuristic tech elements, glitch effects, dark background with vibrant cyan and magenta highlights, wet streets reflecting neon, high contrast, cinematic atmosphere, 8k resolution.`
  }
];

export const THEME_COLORS: ThemeColor[] = [
  { id: 'default', name: 'Original', value: 'default', class: 'bg-gradient-to-br from-zinc-200 to-zinc-400' },
  { id: 'blue', name: 'Azure', value: '#0071e3', class: 'bg-[#0071e3]' },
  { id: 'purple', name: 'Iris', value: '#5e5ce6', class: 'bg-[#5e5ce6]' },
  { id: 'pink', name: 'Rose', value: '#ff2d55', class: 'bg-[#ff2d55]' },
  { id: 'orange', name: 'Sunset', value: '#ff9500', class: 'bg-[#ff9500]' },
  { id: 'green', name: 'Sage', value: '#34c759', class: 'bg-[#34c759]' },
  { id: 'slate', name: 'Graphite', value: '#8e8e93', class: 'bg-[#8e8e93]' },
  { id: 'red', name: 'Ruby', value: '#ff3b30', class: 'bg-[#ff3b30]' },
];
