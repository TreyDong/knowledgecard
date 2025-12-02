
export type Language = 'en' | 'zh';

export type ProviderType = 'gemini' | 'custom';

export interface AiModel {
  id: string;
  name: string;
}

export interface AiProvider {
  id: string;
  name: string;
  type: ProviderType;
  apiKey: string;
  baseUrl?: string; // Optional base override
  
  // Custom Provider Specifics (Full URLs preferred)
  chatUrl?: string; 
  imageUrl?: string;
  
  chatModels: AiModel[];
  imageModels: AiModel[];
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  // Templates
  htmlPrompt: string;
  imagePrompt: string;
  // Configuration
  supportedModes: ('html' | 'image')[];
}

export interface ThemeColor {
  id: string;
  name: string;
  value: string; // Hex code or 'default'
  class: string; // Tailwind class for UI display
}

export interface GenerateCardRequest {
  content: string;
  systemInstruction: string;
  themeColor?: string; // Optional color override
  appTheme?: 'light' | 'dark'; // To match the generated body background
  cornerRadius?: string; // e.g., 'rounded-none', 'rounded-2xl'
  cardSize?: string; // e.g., 'standard', 'tall', 'wide'
}

export interface GenerateCardResponse {
  html: string;
}

export interface GenerateImageRequest {
  content: string;
  stylePrompt: string; // Full style instruction
  themeColor?: string;
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
}

export interface GenerateImageResponse {
  imageUri: string; // Data URL
}
