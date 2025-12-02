
import { GoogleGenAI } from "@google/genai";
import { GenerateCardRequest, GenerateCardResponse, GenerateImageRequest, GenerateImageResponse, AiProvider } from "../types";

// --- Gemini Specific Implementations ---

const generateCardHtmlGemini = async (
  request: GenerateCardRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateCardResponse> => {
  // Support API Key override from provider settings
  const apiKey = provider.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is required for Google Gemini.");

  const options: any = { apiKey };
  
  // Support Base URL override for official Google endpoint (e.g. for proxies)
  if (provider.baseUrl) {
    options.baseUrl = provider.baseUrl;
  }
  
  const ai = new GoogleGenAI(options);
  const { content, systemInstruction, themeColor, appTheme, cornerRadius, cardSize } = request;

  let promptText = `Here is the content for the knowledge card:\n\n${content}`;
  
  if (themeColor && themeColor !== 'default') {
    promptText += `\n\n**IMPORTANT VISUAL OVERRIDE**: The user has strictly requested a specific color theme. \nYOU MUST USE **${themeColor}** as the primary accent/brand color for backgrounds, borders, highlights, or text as appropriate for the style. Override the default style colors with this choice.`;
  }
  const bodyBg = appTheme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900';
  promptText += `\n\n**BACKGROUND REQUIREMENT**: The <body> tag of the generated HTML MUST have the class '${bodyBg}' to match the user's interface mode.`;

  if (cornerRadius) {
    promptText += `\n\n**SHAPE REQUIREMENT**: The main card container (id="knowledge-card") MUST strictly use the Tailwind border-radius class: '${cornerRadius}'.`;
  }
  if (cardSize) {
    let sizeClasses = "w-[600px] min-h-[700px]";
    if (cardSize === 'tall') sizeClasses = "w-[450px] min-h-[800px]";
    if (cardSize === 'wide') sizeClasses = "w-[800px] min-h-[500px]";
    promptText += `\n\n**DIMENSION REQUIREMENT**: The main card container (id="knowledge-card") MUST have the following fixed dimensions/classes: '${sizeClasses}'.`;
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    config: { systemInstruction: systemInstruction, temperature: 0.7 }
  });

  let rawHtml = response.text || '';
  rawHtml = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();
  return { html: rawHtml };
};

const generateImageGemini = async (
  request: GenerateImageRequest,
  provider: AiProvider,
  modelId: string
): Promise<GenerateImageResponse> => {
  const apiKey = provider.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is required for Google Gemini.");

  const options: any = { apiKey };
  if (provider.baseUrl) {
    options.baseUrl = provider.baseUrl;
  }
  const ai = new GoogleGenAI(options);
  const { content, stylePrompt, themeColor, aspectRatio } = request;

  let prompt = `${stylePrompt}\n\nSubject/Concept to visualize: "${content}"\n`;
  if (themeColor && themeColor !== 'default') {
    prompt += `\nColor Palette Requirement: Please incorporate ${themeColor} as a dominant or accent color.`;
  }

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

  // STRICT URL LOGIC: Use chatUrl if present, otherwise fallback to baseUrl (assuming it's the full URL).
  // We do NOT automatically append /chat/completions here to respect the "completely use user provided url" requirement.
  const url = provider.chatUrl || provider.baseUrl;
  
  if (!url) {
    throw new Error("Missing API URL. Please configure the Chat Endpoint URL in settings.");
  }

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
     let errMsg = errText;
     try {
        const json = JSON.parse(errText);
        if (json.error && typeof json.error === 'object') {
            errMsg = json.error.message || JSON.stringify(json.error);
        } else if (json.error) {
            errMsg = json.error;
        } else if (json.message) {
            errMsg = json.message;
        }
     } catch (e) {
        // use raw text
     }
     throw new Error(`Provider Error (${response.status}): ${errMsg}`);
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

   // STRICT URL LOGIC
   const url = provider.imageUrl || provider.baseUrl;

   if (!url) {
     throw new Error("Missing API URL. Please configure the Image Endpoint URL in settings.");
   }

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
     let errMsg = errText;
     try {
        const json = JSON.parse(errText);
        if (json.error && typeof json.error === 'object') {
            errMsg = json.error.message || JSON.stringify(json.error);
        } else if (json.error) {
            errMsg = json.error;
        } else if (json.message) {
            errMsg = json.message;
        }
     } catch (e) {
        // use raw text
     }
     throw new Error(`Provider Error (${response.status}): ${errMsg}`);
   }

   const data = await response.json();
   const b64 = data.data?.[0]?.b64_json;
   
   if (!b64) {
      const imgUrl = data.data?.[0]?.url;
      if (imgUrl) return { imageUri: imgUrl };
      throw new Error("No image data returned from custom provider.");
   }

   // Robust Base64 Handling
   // 1. If it already starts with 'data:', use it as is.
   if (typeof b64 === 'string' && b64.trim().startsWith('data:')) {
      return { imageUri: b64 };
   }

   // 2. Otherwise, assume it's raw base64. Detect MIME type if possible (JPEG starts with /9j/)
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
