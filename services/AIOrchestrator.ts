
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

export const AIOrchestrator = {
  /**
   * Routes user free-text intent to a specific platform flow.
   */
  async routeIntent(input: string): Promise<IntentResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Act as an Eduvane Intent Router.
      Analyze this user request: "${input}"
      
      Identify if the user wants to:
      1. PRACTICE: Generate practice questions or exercises.
      2. ANALYZE: Upload work, score an answer, or get feedback on a submission.
      3. HISTORY: View past work or progress.
      
      Return a JSON object with:
      - intent: "PRACTICE", "ANALYZE", "HISTORY", or "UNKNOWN"
      - subject: (Optional) The detected academic subject.
      - topic: (Optional) The detected specific topic.
      - message: A friendly, intelligence-first confirmation of what the system is about to do.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["intent", "message"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  },

  async generateQuestions(config: { subject: string; topic: string; difficulty: string; count: number }): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Expert Educator Role: ${config.subject}.
      Generate ${config.count} ${config.difficulty} level items for "${config.topic}".
      Items should be high-rigor, convention-appropriate (e.g., Analysis for History, Problems for Math, Translation for Language).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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

  async analyzeWork(imageBuffer: string, metadata: { subject: string }): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Eduvane Intelligence Engine Evaluation.
      Subject: ${metadata.subject}
      1. OCR the image.
      2. Provide score (0-100).
      3. Feedback: Growth-oriented, subject-appropriate (Rigor for STEM, Argument for Humanities).
      4. Improvement Steps: 3 specific, actionable growth points.
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
      subject: metadata.subject,
      score: result.score,
      feedback: result.feedback,
      improvementSteps: result.improvementSteps,
      confidenceScore: result.confidenceScore
    };
  }
};
