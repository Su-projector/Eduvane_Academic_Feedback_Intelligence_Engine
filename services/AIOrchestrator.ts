
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission } from "../types.ts";

/**
 * AI ORCHESTRATOR SERVICE
 * Responsibility: Single gateway for all LLM interactions.
 * Adheres to: Subject-Agnostic Intelligence Architecture.
 */
export const AIOrchestrator = {
  /**
   * Generates subject-relevant practice questions.
   * Adapts question format based on the subject (e.g., essays for history, problems for physics).
   */
  async generateQuestions(config: { subject: string; topic: string; difficulty: string; count: number }): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as an expert educator in ${config.subject}.
      Generate ${config.count} ${config.difficulty} level assessment items for the topic: "${config.topic}".
      
      Instructions:
      1. Tailor the question type to the subject conventions (e.g., multiple choice, short answer, essay prompts, or worked problems).
      2. Ensure rigor matches the ${config.difficulty} level.
      3. Provide clear, concise question text.
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
              type: { type: Type.STRING, description: "The convention-specific type of question (e.g., ESSAY, PROBLEM, ANALYSIS)" }
            },
            required: ["id", "text", "type"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  },

  /**
   * Evaluates student work with subject-aware intelligence.
   * Dynamically adjusts scoring rubrics based on metadata.
   */
  async analyzeWork(imageBuffer: string, metadata: { subject: string }): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as an encouraging AI Learning Intelligence Engine. 
      Subject Context: ${metadata.subject}

      1. OCR and analyze the work in this image.
      2. Evaluate based on subject-appropriate criteria:
         - STEM: Accuracy, procedural logic, and variable handling.
         - Humanities/Arts: Clarity of argument, structural coherence, interpretation, and evidence usage.
         - General: Completeness and conceptual grasp.
      3. Score out of 100.
      4. Provide feedback that is conversational, identifying specific strengths and conceptual gaps.
      5. List 3 actionable steps for growth.
      
      Tone: Encouraging, non-judgmental, intellectual partner.
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
            confidenceScore: { type: Type.NUMBER },
            detectedCategory: { type: Type.STRING, description: "The core nature of the observation (e.g., CONCEPTUAL, STRUCTURAL, CARELESS)" }
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
