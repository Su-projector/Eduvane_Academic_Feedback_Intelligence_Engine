
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * EDUVANE AI ORCHESTRATOR (MANDATORY SPEC V1)
 * 1. Perception Layer (OCR - Tesseract Proxy)
 * 2. Interpretation Layer (Classification - Qwen Proxy)
 * 3. Primary Reasoning Layer (Voice/Scoring - LLaMA 3 Proxy)
 */
export const AIOrchestrator = {
  /**
   * LAYER 1: PERCEPTION (Simulates Tesseract OCR)
   * Task: Extract raw text only. No reasoning.
   */
  async perceptionLayer(imageBuffer: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: "PERCEPTION LAYER TASK: Extract all text from this image exactly as it appears. Do not interpret, do not correct, do not evaluate. Return raw text markdown." }
        ]
      }
    });
    return response.text || "";
  },

  /**
   * LAYER 2: INTERPRETATION (Simulates Qwen)
   * Task: Clean text, detect intent/subject, provide structured machine context.
   */
  async interpretationLayer(input: string): Promise<IntentResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      INTERPRETATION LAYER TASK: Analyze the following signal for intent routing.
      Signal: "${input}"
      
      Determine:
      1. Intent: "ANALYZE" (evaluation), "PRACTICE" (generation), "HISTORY" (status), "CHAT" (generic).
      2. Subject: The academic discipline (Math, History, etc.).
      3. Topic: Specific core concept.
      4. Metadata: Count (if items requested), Difficulty (Easy/Medium/Hard).
      
      Output valid JSON only.
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
            count: { type: Type.NUMBER },
            difficulty: { type: Type.STRING }
          },
          required: ["intent", "subject"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return {
        intent: (data.intent as any) || "CHAT",
        subject: data.subject || "General Study",
        topic: data.topic || "Unknown",
        count: data.count || 5,
        difficulty: (data.difficulty as any) || "Medium"
      };
    } catch (e) {
      return { intent: "CHAT", subject: "General", topic: "Unknown" };
    }
  },

  /**
   * LAYER 3: PRIMARY REASONING (Simulates LLaMA 3 8B)
   * Task: This is the ONLY layer allowed to produce user-facing responses.
   * Voice: Encouraging, non-authoritative, conversational.
   */
  async evaluateWorkFlow(imageBuffer: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    // 1. OCR Extraction (Internal)
    const rawText = await this.perceptionLayer(imageBuffer);
    
    // 2. Intent/Subject Detection (Internal)
    const context = await this.interpretationLayer(rawText);
    
    // 3. Primary Reasoning (User-Facing Voice)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const reasoningPrompt = `
      ROLE: Eduvane Primary Reasoning Engine.
      CONTEXT: Subject: ${context.subject}, Topic: ${context.topic}.
      DATA: ${rawText}
      
      TASK:
      1. Score the work (0-100).
      2. Provide conversational, encouraging pedagogical feedback.
      3. List 3 specific actionable improvement steps.
      
      VOICE RULES:
      - Encouraging and supportive.
      - Not an "AI replacement" but a helper.
      - Score MUST appear before the narrative feedback.
      
      Output JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: reasoningPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["score", "feedback", "improvementSteps"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      subject: context.subject,
      topic: context.topic,
      score: result.score,
      feedback: result.feedback,
      improvementSteps: result.improvementSteps,
      confidenceScore: result.confidenceScore || 0.9
    };
  },

  /**
   * ORCHESTRATION FLOW B: Question Generation
   */
  async generatePracticeFlow(prompt: string): Promise<Question[]> {
    // 1. Interpretation
    const context = await this.interpretationLayer(prompt);
    
    // 2. Primary Reasoning
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const genPrompt = `
      ROLE: Eduvane Primary Content Engine.
      REQUEST: Create ${context.count} ${context.difficulty} practice items for ${context.subject} (${context.topic}).
      
      FORMAT RULES:
      - Output as plain text questions.
      - Ordered 1, 2, 3...
      - No UI controls, no editable markers.
      - High academic rigor.
      
      Output JSON array of {id, text, type}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: genPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
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
