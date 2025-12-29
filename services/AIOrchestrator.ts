
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * AI ORCHESTRATOR - PRODUCTION HARDENED
 * Responsibility: Manages all interactions with the Google GenAI SDK.
 */

const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';

/**
 * Internal helper to get a fresh AI instance
 */
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("EDUVANE_CORE_ERROR: process.env.API_KEY is missing. Check Vercel environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const AIOrchestrator = {
  /**
   * INTERPRETATION LAYER
   * Decodes user intent from natural language prompts.
   */
  interpretation: {
    parseIntent: async (input: string): Promise<IntentResult> => {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: [{ parts: [{ text: `TASK: Classify this user intent for a learning platform. Input: "${input}"` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING, description: "One of: PRACTICE, ANALYZE, HISTORY, CHAT" },
              subject: { type: Type.STRING, description: "The academic subject" },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              count: { type: Type.NUMBER }
            },
            required: ["intent", "subject"]
          }
        }
      });

      try {
        const data = JSON.parse(response.text || "{}");
        return {
          intent: (data.intent?.toUpperCase() as any) || "UNKNOWN",
          subject: data.subject || "General",
          topic: data.topic || "General",
          difficulty: (data.difficulty as any) || "Medium",
          count: data.count || 5
        };
      } catch (e) {
        console.error("Intent Parse Failure:", e);
        return { intent: "UNKNOWN", subject: "General" };
      }
    }
  },

  /**
   * EVALUATION WORKFLOW
   * Processes image signals into pedagogical feedback.
   */
  evaluateWorkFlow: async (imageBuffer: string, mimeType: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> => {
    const ai = getClient();
    
    // Step 1: Perception (OCR)
    const perceptionResponse = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: [{
        parts: [
          { inlineData: { data: imageBuffer, mimeType: mimeType } },
          { text: "OCR TASK: Extract all handwritten or printed text from this academic work. Raw text output only." }
        ]
      }]
    });

    const rawText = perceptionResponse.text || "";
    if (!rawText.trim()) throw new Error("PERCEPTION_EMPTY: No text detected.");

    // Step 2: Interpretation
    const context = await AIOrchestrator.interpretation.parseIntent(rawText);

    // Step 3: Reasoning (Evaluation)
    const evaluationResponse = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [{ 
        parts: [{ text: `Evaluate this ${context.subject} work on "${context.topic}": ${rawText}` }] 
      }],
      config: {
        systemInstruction: "You are Eduvane Core, a helpful, encouraging academic diagnostic engine.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["score", "feedback", "improvementSteps"]
        }
      }
    });

    const result = JSON.parse(evaluationResponse.text || "{}");
    return {
      subject: context.subject,
      topic: context.topic || context.subject,
      score: result.score || 0,
      feedback: result.feedback || "Diagnosis inconclusive.",
      improvementSteps: result.improvementSteps || ["Review core concepts"],
      confidenceScore: result.confidenceScore || 0.8
    };
  },

  /**
   * GENERATION WORKFLOW
   * Synthesizes practice items from a prompt.
   */
  generatePracticeFlow: async (prompt: string): Promise<Question[]> => {
    const ai = getClient();
    const context = await AIOrchestrator.interpretation.parseIntent(prompt);

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [{ 
        parts: [{ text: `Generate ${context.count} ${context.difficulty} questions for ${context.subject}: ${context.topic}.` }] 
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["id", "text", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  }
};
