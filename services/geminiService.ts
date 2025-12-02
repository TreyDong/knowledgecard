
import { GoogleGenAI } from "@google/genai";
import { GenerateCardRequest, GenerateCardResponse, GenerateImageRequest, GenerateImageResponse, AiProvider } from "../types";

// --- Helper: Standard SDK Client ---
// Only used when NO Base URL is configured.
const getGeminiSdkClient = (provider: AiProvider) => {
  const apiKey = provider.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is required for Google Gemini.");
  return new GoogleGenAI({ apiKey });
};

// --- Helper: Raw HTTP Client for Gemini Proxies ---
// Used when a Base URL IS configured.
const fetchGeminiRaw = async (
  provider: AiProvider, 
  modelId: string, 
  payload: any
) => {
  const apiKey = provider.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is required.");

  // Clean URL handling
  let baseUrl = (provider.baseUrl || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
  
  // If the user provided a root domain like "https://yunwu.ai", we append the standard path.
  // If they provided a full path ending in v1beta/..., we might need to adjust, 
  // but standard practice for "Base URL" is the host or host/api prefix.
  // We assume standard Gemini REST structure: {base}/v1beta/models/{model}:generateContent
  
  // Handle cases where user might have added /v1beta to the base url already
  if (baseUrl.endsWith('/v1beta')) {
    baseUrl = baseUrl.replace('/v1beta', '');
  }

  const url = `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(errText);
      if (json.error && json.error.message) errMsg = json.error.message;
    } catch (e) {}
    throw new Error(`Gemini Proxy Error: ${errMsg}`);
  }

  return await response.json();
};

// --- Gemini Implementation (Dual Mode) ---

const generateCardHtmlGemini = async (
  request: GenerateCardRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateCardResponse> => {
  const { content, systemInstruction, themeColor, appTheme, cornerRadius, cardSize } = request;

  // 1. Prepare Prompt
  let promptText = `Here is the content for the knowledge card:\n\n${content}`;
  
  if (themeColor && themeColor !== 'default') {
    promptText += `\n\n**IMPORTANT VISUAL OVERRIDE**: The user has strictly requested a specific color theme. \nYOU MUST USE **${themeColor}** as the primary accent/brand color.`;
  }
  const bodyBg = appTheme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900';
  promptText += `\n\n**BACKGROUND REQUIREMENT**: The <body> tag MUST have the class '${bodyBg}'.`;

  if (cornerRadius) {
    promptText += `\n\n**SHAPE REQUIREMENT**: The main card container MUST use class: '${cornerRadius}'.`;
  }
  if (cardSize) {
    let sizeClasses = "w-[600px] min-h-[700px]";
    if (cardSize === 'tall') sizeClasses = "w-[450px] min-h-[800px]";
    if (cardSize === 'wide') sizeClasses = "w-[800px] min-h-[500px]";
    promptText += `\n\n**DIMENSION REQUIREMENT**: The main card container MUST have classes: '${sizeClasses}'.`;
  }

  // 2. Execution
  // CASE A: Custom Proxy (Base URL Present) -> Raw Fetch
  if (provider.baseUrl && provider.baseUrl.trim() !== '') {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.7
      }
    };

    const data = await fetchGeminiRaw(provider, modelId, payload);
    
    // Parse REST Response
    let rawHtml = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      rawHtml = data.candidates[0].content.parts[0].text || '';
    }
    rawHtml = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();
    return { html: rawHtml };
  } 
  
  // CASE B: Official Google API -> SDK
  else {
    const ai = getGeminiSdkClient(provider);
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: { systemInstruction: systemInstruction, temperature: 0.7 }
    });

    let rawHtml = response.text || '';
    rawHtml = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();
    return { html: rawHtml };
  }
};

const generateImageGemini = async (
  request: GenerateImageRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateImageResponse> => {
  const { content, stylePrompt, themeColor, aspectRatio } = request;

  let prompt = `${stylePrompt}\n\nSubject/Concept to visualize: "${content}"\n`;
  if (themeColor && themeColor !== 'default') {
    prompt += `\nColor Palette Requirement: Please incorporate ${themeColor} as a dominant or accent color.`;
  }

  // CASE A: Custom Proxy (Base URL Present) -> Raw Fetch
  if (provider.baseUrl && provider.baseUrl.trim() !== '') {
    // Note: Gemini Image models via REST API use the same generateContent endpoint structure
    // but the parameters for image generation might vary slightly by model version.
    // For 2.5/3 Pro, we send text prompt and expect inlineData in return.
    
    // We map aspect ratio to string description or specific config if supported by the proxy's model version
    // Standard Gemini 2.5/3.0 accept imageConfig in generationConfig.
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        // "imageConfig" might not be supported by all 3rd party proxies or older versions, 
        // but it is the official field.
        // If the proxy fails, we might need to simplify.
      }
    };
    
    // Attempt to inject specific config
    // @ts-ignore
    payload.generationConfig['mediaResolution'] = 'MEDIA_RESOLUTION_UNSPECIFIED'; 
    // @ts-ignore
    // We try to pass aspect ratio via prompt instructions as a fallback for stability via proxies,
    // but also attempt the config parameter.
    
    const data = await fetchGeminiRaw(provider, modelId, payload);

    let imageUri = '';
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUri = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }
    }

    if (!imageUri) throw new Error("No image data found in proxy response. The model might not have returned an image.");
    return { imageUri };
  }

  // CASE B: Official Google API -> SDK
  else {
    const ai = getGeminiSdkClient(provider);
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9" }
      }
    });

    let imageUri = '';
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUri = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }
    }

    if (!imageUri) throw new Error("No image data found in response");
    return { imageUri };
  }
};

// --- Custom / OpenAI Compatible Implementations ---

const generateCardHtmlCustom = async (
  request: GenerateCardRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateCardResponse> => {
  const { content, systemInstruction, themeColor, appTheme, cornerRadius, cardSize } = request;

  let promptText = `Here is the content for the knowledge card:\n\n${content}`;
  
  if (themeColor && themeColor !== 'default') {
    promptText += `\n\n**IMPORTANT VISUAL OVERRIDE**: Use **${themeColor}** as the primary color.`;
  }
  const bodyBg = appTheme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900';
  promptText += `\n\n**BACKGROUND REQUIREMENT**: The <body> tag MUST have the class '${bodyBg}'.`;
  if (cornerRadius) {
    promptText += `\n\n**SHAPE REQUIREMENT**: Use class '${cornerRadius}' for id="knowledge-card".`;
  }
  if (cardSize) {
    let sizeClasses = "w-[600px] min-h-[700px]";
    if (cardSize === 'tall') sizeClasses = "w-[450px] min-h-[800px]";
    if (cardSize === 'wide') sizeClasses = "w-[800px] min-h-[500px]";
    promptText += `\n\n**DIMENSION REQUIREMENT**: Use classes '${sizeClasses}' for id="knowledge-card".`;
  }

  const url = provider.chatUrl || provider.baseUrl;
  if (!url) throw new Error("Missing API URL for Custom Provider.");

  const payload = {
    model: modelId,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: promptText }
    ],
    temperature: 0.7
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
     const errText = await response.text();
     throw new Error(`Provider Error (${response.status}): ${errText.slice(0, 100)}...`);
  }

  const data = await response.json();
  let rawHtml = data.choices?.[0]?.message?.content || '';
  rawHtml = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();

  return { html: rawHtml };
};

const generateImageCustom = async (
  request: GenerateImageRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateImageResponse> => {
   const { content, stylePrompt, themeColor, aspectRatio } = request;

   let prompt = `${stylePrompt}\n\nSubject: "${content}"\n`;
   if (themeColor && themeColor !== 'default') {
     prompt += `\nColor Palette: ${themeColor}.`;
   }
   
   let size = "1024x1024";
   if (aspectRatio === '9:16' || aspectRatio === '3:4') size = "1024x1792"; 
   if (aspectRatio === '16:9' || aspectRatio === '4:3') size = "1792x1024";

   const url = provider.imageUrl || provider.baseUrl;
   if (!url) throw new Error("Missing API URL for Custom Provider.");

   const payload = {
     model: modelId,
     prompt: prompt,
     n: 1,
     size: size,
     response_format: "b64_json" 
   };
   
   const response = await fetch(url, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${provider.apiKey}`
     },
     body: JSON.stringify(payload)
   });

   if (!response.ok) {
     const errText = await response.text();
     throw new Error(`Provider Error (${response.status}): ${errText.slice(0, 100)}...`);
  }

   const data = await response.json();
   const b64 = data.data?.[0]?.b64_json;
   
   if (!b64) {
      const imgUrl = data.data?.[0]?.url;
      if (imgUrl) return { imageUri: imgUrl };
      throw new Error("No image data returned.");
   }

   if (typeof b64 === 'string' && b64.trim().startsWith('data:')) {
      return { imageUri: b64 };
   }

   const isJpeg = typeof b64 === 'string' && b64.trim().startsWith('/9j/');
   const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

   return { imageUri: `data:${mimeType};base64,${b64}` };
};


// --- Main Exported Facades ---

export const generateCardHtml = async (
  request: GenerateCardRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateCardResponse> => {
  if (provider.type === 'custom') {
    return generateCardHtmlCustom(request, provider, modelId);
  }
  return generateCardHtmlGemini(request, provider, modelId);
};

export const generateImage = async (
  request: GenerateImageRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateImageResponse> => {
  if (provider.type === 'custom') {
    return generateImageCustom(request, provider, modelId);
  }
  return generateImageGemini(request, provider, modelId);
};
