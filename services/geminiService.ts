
import { GoogleGenAI } from "@google/genai";
import { GenerateCardRequest, GenerateCardResponse, GenerateImageRequest, GenerateImageResponse, AiConfig } from "../types";

// --- Gemini Specific Implementations ---

const generateCardHtmlGemini = async (
  request: GenerateCardRequest
): Promise<GenerateCardResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { content, systemInstruction, themeColor, appTheme, cornerRadius, cardSize } = request;

  let promptText = `Here is the content for the knowledge card:\n\n${content}`;
  
  if (themeColor && themeColor !== 'default') {
    promptText += `\n\n**IMPORTANT VISUAL OVERRIDE**: The user has strictly requested a specific color theme. \nYOU MUST USE **${themeColor}** as the primary accent/brand color for backgrounds, borders, highlights, or text as appropriate for the style. Override the default style colors with this choice.`;
  }
  const bodyBg = appTheme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900';
  promptText += `\n\n**BACKGROUND REQUIREMENT**: The <body> tag of the generated HTML MUST have the class '${bodyBg}' to match the user's interface mode. Do not use the default dark background if the user is in light mode.`;

  if (cornerRadius) {
    promptText += `\n\n**SHAPE REQUIREMENT**: The main card container (id="knowledge-card") MUST strictly use the Tailwind border-radius class: '${cornerRadius}'. Replace any default radius with this class.`;
  }
  if (cardSize) {
    let sizeClasses = "w-[600px] min-h-[700px]";
    if (cardSize === 'tall') sizeClasses = "w-[450px] min-h-[800px]";
    if (cardSize === 'wide') sizeClasses = "w-[800px] min-h-[500px]";
    promptText += `\n\n**DIMENSION REQUIREMENT**: The main card container (id="knowledge-card") MUST have the following fixed dimensions/classes: '${sizeClasses}'. Ensure the layout adjusts to fit these dimensions.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    config: { systemInstruction: systemInstruction, temperature: 0.7 }
  });

  let rawHtml = response.text || '';
  rawHtml = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();
  return { html: rawHtml };
};

const generateImageGemini = async (
  request: GenerateImageRequest
): Promise<GenerateImageResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { content, stylePrompt, themeColor, aspectRatio } = request;

  let prompt = `${stylePrompt}\n\nSubject/Concept to visualize: "${content}"\n`;
  if (themeColor && themeColor !== 'default') {
    prompt += `\nColor Palette Requirement: Please incorporate ${themeColor} as a dominant or accent color in the composition.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
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
  config: AiConfig
): Promise<GenerateCardResponse> => {
  const { content, systemInstruction, themeColor, appTheme, cornerRadius, cardSize } = request;

  let promptText = `Here is the content for the knowledge card:\n\n${content}`;
  // Identical prompt logic to maintain consistency
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

  // Construct URL
  const baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1';
  const url = `${baseUrl}/chat/completions`;

  const payload = {
    model: config.chatModel || 'gpt-4o',
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
      'Authorization': `Bearer ${config.apiKey}`
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
     throw new Error(errMsg);
  }

  const data = await response.json();
  let rawHtml = data.choices?.[0]?.message?.content || '';
  rawHtml = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();

  return { html: rawHtml };
};

const generateImageCustom = async (
  request: GenerateImageRequest,
  config: AiConfig
): Promise<GenerateImageResponse> => {
   const { content, stylePrompt, themeColor, aspectRatio } = request;

   let prompt = `${stylePrompt}\n\nSubject: "${content}"\n`;
   if (themeColor && themeColor !== 'default') {
     prompt += `\nColor Palette: ${themeColor}.`;
   }
   // Note: OpenAI DALL-E 3 supports standard sizes like 1024x1024, 1024x1792, 1792x1024
   // We map our aspect ratios to the closest DALL-E equivalents
   let size = "1024x1024";
   if (aspectRatio === '9:16' || aspectRatio === '3:4') size = "1024x1792"; 
   if (aspectRatio === '16:9' || aspectRatio === '4:3') size = "1792x1024";

   const baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1';
   const url = `${baseUrl}/images/generations`;

   const payload = {
     model: config.imageModel || 'dall-e-3',
     prompt: prompt,
     n: 1,
     size: size,
     response_format: "b64_json" // Request base64 directly
   };
   
   // Console log for debugging custom providers
   console.debug('Custom Image Request Payload:', payload);

   const response = await fetch(url, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${config.apiKey}`
     },
     body: JSON.stringify(payload)
   });

   if (!response.ok) {
     const errText = await response.text();
     let errMsg = errText;
     try {
        const json = JSON.parse(errText);
        // Common OpenAI error structure: { error: { message: "...", type: "...", ... } }
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
     throw new Error(errMsg);
   }

   const data = await response.json();
   const b64 = data.data?.[0]?.b64_json;
   
   if (!b64) {
      // Fallback if provider returns URL instead of b64 (standard OpenAI behavior if response_format not supported by proxy)
      const imgUrl = data.data?.[0]?.url;
      if (imgUrl) {
         return { imageUri: imgUrl };
      }
      throw new Error("No image data returned from custom provider.");
   }

   return { imageUri: `data:image/png;base64,${b64}` };
};


// --- Main Exported Facades ---

export const generateCardHtml = async (
  request: GenerateCardRequest,
  config: AiConfig
): Promise<GenerateCardResponse> => {
  if (config.provider === 'custom') {
    return generateCardHtmlCustom(request, config);
  }
  return generateCardHtmlGemini(request);
};

export const generateImage = async (
  request: GenerateImageRequest,
  config: AiConfig
): Promise<GenerateImageResponse> => {
  if (config.provider === 'custom') {
    return generateImageCustom(request, config);
  }
  return generateImageGemini(request);
};