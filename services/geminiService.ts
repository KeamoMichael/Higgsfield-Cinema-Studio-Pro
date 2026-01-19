
import { GoogleGenAI } from "@google/genai";
import { Resolution, AspectRatio } from "../types";

// Helper to ensure we have a key or prompt for one
export const ensureApiKey = async (): Promise<boolean> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog interaction as per race condition notes
      return true;
    }
    return true;
  }
  return false;
};

export const generateImage = async (
  prompt: string,
  resolution: Resolution,
  aspectRatio: AspectRatio = AspectRatio.LANDSCAPE,
  attachmentBase64s?: string[]
): Promise<string> => {
  try {
    // Ensure Key logic
    await ensureApiKey();

    // Re-instantiate to grab the fresh key injected into process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // "Cinema Studio Pro" implies high quality, so we default to the Pro Image model
    // especially since 2K/4K is requested.
    const modelName = 'gemini-3-pro-image-preview';

    const parts: any[] = [{ text: prompt }];

    // Handle reference images if provided
    if (attachmentBase64s && attachmentBase64s.length > 0) {
      attachmentBase64s.forEach(att => {
        const base64Data = att.split(',')[1];
        const mimeType = att.split(',')[0].split(':')[1].split(';')[0];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === AspectRatio.WIDE ? '16:9' : aspectRatio,
          imageSize: resolution,
        },
      },
    });

    // Extract image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data received from the model.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // If it's a "Requested entity was not found" (often key related), we might want to trigger key selection again
    if (error.message && error.message.includes("Requested entity was not found")) {
         if (window.aistudio) {
             await window.aistudio.openSelectKey();
         }
         throw new Error("API Key issue detected. Please re-select your key.");
    }
    throw error;
  }
};
