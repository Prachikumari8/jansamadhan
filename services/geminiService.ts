
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseImageData = (imageBase64: string) => {
  const [header, data] = imageBase64.split(',');
  const mimeMatch = header?.match(/data:(image\/[a-zA-Z0-9.+-]+);base64/);

  return {
    data,
    mimeType: mimeMatch?.[1] || 'image/jpeg'
  };
};

export const verifyCivicIssue = async (imageBase64: string, category: string) => {
  try {
    const image = parseImageData(imageBase64);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: image.data, mimeType: image.mimeType } },
          { text: `Analyze this photo for visible civic infrastructure issues. Focus on whether a ${category} issue is clearly present, but also accept related damage or defects that a city authority should review. Rate confidence from 0 to 1, where 0 means no civic issue is visible, 0.5 means the photo is ambiguous, and 1 means the issue is clearly visible. Return concise JSON only.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidence: { type: Type.NUMBER, description: "Confidence score from 0-1. Values above 0.15 indicate a likely civic issue." },
            aiDescription: { type: Type.STRING, description: "Professional description of what was detected in the image for authorities." },
            detectedIssue: { type: Type.STRING, description: "Specific civic issue type detected." },
            suggestedPriority: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Suggested priority level based on severity." }
          },
          required: ["confidence", "aiDescription", "detectedIssue", "suggestedPriority"]
        }
      }
    });

    const jsonStr = response.text;
    const result = JSON.parse(jsonStr || '{}');
    
    return {
      ...result,
      isValid: (result.confidence || 0) > 0.15 || Boolean(result.detectedIssue || result.aiDescription)
    };
  } catch (error) {
    console.error("Gemini analysis failed", error);
    // On error, return a lenient response to allow user to submit
    return {
      confidence: 0.5,
      aiDescription: "Image analysis temporarily unavailable. Your report will still be submitted for manual review.",
      detectedIssue: category,
      suggestedPriority: "Medium",
      isValid: true
    };
  }
};

export const generateCityBriefing = async (issueSummary: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a city management consultant. Analyze the following summary of civic issues and provide: 
      1. A 3-sentence executive summary.
      2. The top 2 most critical departments needing attention.
      3. One specific tactical recommendation for resource allocation.
      
      DATA SUMMARY:
      ${issueSummary}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Briefing generation failed", error);
    return "Briefing unavailable at this moment. Please check raw data metrics.";
  }
};
