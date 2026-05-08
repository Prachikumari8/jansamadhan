/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const parseImageData = (imageBase64: string) => {
  const [header, data] = imageBase64.split(',');
  const mimeMatch = header?.match(/data:(image\/[a-zA-Z0-9.+-]+);base64/);

  return {
    data,
    mimeType: mimeMatch?.[1] || 'image/jpeg'
  };
};

const CATEGORY_HINTS: Record<string, string> = {
  'Pothole': 'look for holes, cracks, or craters in the asphalt/road surface.',
  'Streetlight': 'look for broken lamps, dark street lights, leaning poles, or exposed wiring.',
  'Drainage': 'look for clogged drains, flooded streets, overflowing gutters, or broken manhole covers.',
  'Garbage': 'look for piles of trash, overflowing bins, litter in public spaces, or illegal dumping.',
  'Water Supply': 'look for leaking pipes, water main bursts, dry taps, or contaminated water flowing.',
  'Electricity': 'look for dangling wires, sparking transformers, power outages, or broken meters.',
  'Road Damage': 'look for crumbling roads, large cracks, missing pavement, or unsafe road structures.',
  'Other': 'any general civic infrastructure failure or public hazard.'
};

export const verifyCivicIssue = async (imageBase64: string, category: string) => {
  try {
    if (!ai) {
      console.warn('VITE_GEMINI_API_KEY is missing. Skipping image analysis and returning a safe fallback.');
      return {
        confidence: 0.5,
        isCategoryMatch: true,
        aiDescription: 'Image analysis is unavailable because the Gemini API key is not configured. Your report will still be submitted for manual review.',
        detectedIssue: category,
        suggestedPriority: 'Medium',
        isValid: true
      };
    }

    const hint = CATEGORY_HINTS[category] || 'general civic infrastructure issue.';
    const image = parseImageData(imageBase64);
    
    const response = await ai!.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { inlineData: { data: image.data, mimeType: image.mimeType } },
        { text: `You are a helpful civic infrastructure inspector. Analyze the attached photo and determine if it shows an issue belonging to the category: "${category}".
          
          HINT FOR THIS CATEGORY: ${hint}

          VALIDATION CRITERIA:
          1. Set "isCategoryMatch" to true if the photo shows the issue described above, even if there are other objects (cars, people, buildings) in the background.
          2. Set "isCategoryMatch" to true if the photo shows ANY significant civic infrastructure failure, but prioritize the selected category.
          3. Set "isCategoryMatch" to false ONLY if the photo is completely unrelated to city maintenance (e.g., a selfie, a plate of food, an indoor living room, a close-up of a person's face, or a document).
          4. If the photo is too dark or blurry to see anything, set "isCategoryMatch" to false.

          Return JSON only.` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidence: { type: Type.NUMBER, description: "Confidence score from 0-1. High confidence (>0.7) means the issue is very clear." },
            isCategoryMatch: { type: Type.BOOLEAN, description: `True if the image depicts a ${category} or any valid civic infrastructure problem.` },
            aiDescription: { type: Type.STRING, description: "Technical summary of what is seen in the photo for city engineers." },
            detectedIssue: { type: Type.STRING, description: "The specific sub-type of the problem found." },
            suggestedPriority: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Priority based on the danger to the public." }
          },
          required: ["confidence", "isCategoryMatch", "aiDescription", "detectedIssue", "suggestedPriority"]
        }
      }
    });

    let jsonStr = response.text || '';
    jsonStr = jsonStr.replace(/```json\n?|\n?```/g, '').trim();
    
    const result = JSON.parse(jsonStr || '{}');
    const finalIsMatch = result.isCategoryMatch || false;

    return {
      ...result,
      isCategoryMatch: finalIsMatch,
      isValid: (result.confidence || 0) > 0.3 && finalIsMatch
    };
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return {
      confidence: 0,
      isCategoryMatch: true, // Be lenient on technical error
      aiDescription: "Analysis service was temporarily unreachable. Manual review required.",
      detectedIssue: category,
      suggestedPriority: "Medium",
      isValid: false
    };
  }
};

export const generateCityBriefing = async (issueSummary: string) => {
  try {
    if (!ai) {
      console.warn('VITE_GEMINI_API_KEY is missing. Returning fallback briefing.');
      return 'Briefing is unavailable because the Gemini API key is not configured. Please check the raw data metrics.';
    }

    const response = await ai!.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ text: `You are a city management consultant. Analyze the following summary of civic issues and provide: 
      1. A 3-sentence executive summary.
      2. The top 2 most critical departments needing attention.
      3. One specific tactical recommendation for resource allocation.
      
      DATA SUMMARY:
      ${issueSummary}` }],
      config: {
        temperature: 0.7
      }
    });
    let resultText = response.text || '';
    return resultText.trim();
  } catch (error) {
    console.error("Briefing generation failed", error);
    return "Briefing unavailable at this moment. Please check raw data metrics.";
  }
};
