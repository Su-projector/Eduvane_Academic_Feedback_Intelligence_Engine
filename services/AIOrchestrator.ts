
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission } from "../types.ts";

/**
 * AI ORCHESTRATOR SERVICE
 * Responsibility: Single gateway for all LLM interactions in Standalone MVP.
 * Adheres to: Sec III.B.1 (Confidence-Aware Diagnosis).
 */
export const AIOrchestrator = {
  /**
   * Generates curriculum-aligned practice questions.
   */
  async generateQuestions(config: { subject: string; topic: string; difficulty: string; count: number }): Promise<Question[]> {
    // Initialize inside method to ensure the latest API_KEY is used and prevent top-level crashes
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${config.count} ${config.difficulty} level practice questions for ${config.subject} on the topic of "${config.topic}".`,
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
  },

  /**
   * Analyzes uploaded work for scoring and qualitative feedback.
   */
  async analyzeWork(imageBuffer: string, metadata: { subject?: string }): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as an encouraging AI learning assistant. 
      1. OCR the handwritten text in this image.
      2. Score the work out of 100 based on accuracy and understanding.
      3. Identify specific conceptual or procedural errors.
      4. Provide conversational, encouraging feedback (max 3 sentences).
      5. List 3 clear, actionable improvement steps.
      
      Maintain a non-judgmental tone. Do not claim absolute authority.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["score", "feedback", "improvementSteps", "confidenceScore"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      subject: metadata.subject || "General",
      score: result.score,
      feedback: result.feedback,
      improvementSteps: result.improvementSteps,
      confidenceScore: result.confidenceScore
    };
  }
};
