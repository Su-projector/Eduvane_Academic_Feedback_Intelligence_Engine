
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * ARCHITECTURAL PROVIDER INTERFACE
 * Decouples model identity from architectural role.
 * Any model (LLaMA, Qwen, GPT) can satisfy this interface.
 */
interface AIProvider {
  generate(params: GenerateContentParameters): Promise<{ text: string | undefined }>;
}

/**
 * GEMINI PROVIDER ADAPTER
 * Concrete implementation of the AIProvider using Google GenAI SDK.
 */
class GeminiProvider implements AIProvider {
  private modelName: string;

  constructor(model: string) {
    this.modelName = model;
  }

  async generate(params: GenerateContentParameters) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY is not defined in the environment.");
    
    const ai = new GoogleGenAI({ apiKey });
    return await ai.models.generateContent({
      model: this.modelName,
      ...params
    });
  }
}

/**
 * ROLE: PERCEPTION SERVICE
 * Responsibility: Mechanical OCR / Verbatim text extraction.
 * Constraint: MUST NOT interpret, correct, or normalize text. 
 * Purpose: Acts as a swappable interface for Tesseract or other OCR engines.
 */
class PerceptionService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async extractVerbatim(imageBuffer: string): Promise<string> {
    const response = await this.provider.generate({
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: "MECHANICAL TASK: VERBATIM OCR. Return every character exactly as seen. Do not fix grammar. Do not interpret. Do not format. Raw string output only." }
        ]
      }
    });
    return response.text || "";
  }
}

/**
 * ROLE: INTERPRETATION SERVICE
 * Responsibility: Structured Context & Intent Classification.
 * Constraint: MUST output machine-readable JSON. MUST be subject-agnostic.
 */
class InterpretationService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async parseIntent(input: string): Promise<IntentResult> {
    const prompt = `
      TASK: CLASSIFY INPUT SIGNAL.
      INPUT: "${input}"
      
      OUTPUT FORMAT: STRICT JSON.
      SCHEMA:
      {
        "intent": "ANALYZE" | "PRACTICE" | "HISTORY" | "CHAT" | "UNKNOWN",
        "subject": string,
        "topic": string,
        "difficulty": "Easy" | "Medium" | "Hard",
        "count": number
      }
    `;

    const response = await this.provider.generate({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            subject: { type: Type.STRING },
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
        intent: data.intent as any || "UNKNOWN",
        subject: data.subject || "General",
        topic: data.topic || "Undetermined",
        difficulty: data.difficulty as any || "Medium",
        count: data.count || 5
      };
    } catch (e) {
      return { intent: "UNKNOWN", subject: "General" };
    }
  }
}

/**
 * ROLE: PRIMARY REASONING SERVICE
 * Responsibility: THE SINGLE VOICE OF EDUVANE.
 * Constraint: ONLY layer permitted to generate user-facing narrative text.
 */
class PrimaryReasoningService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generateNarrativeEvaluation(rawText: string, context: IntentResult): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const prompt = `
      VOICE: EDUVANE PRIMARY REASONING CORE.
      TONE: Encouraging, Pedagogical, Precise.
      CONTEXT: Subject [${context.subject}], Topic [${context.topic}].
      DATA: ${rawText}
      
      TASK:
      1. Mastery Score (0-100).
      2. Narrative feedback (The "Voice").
      3. 3 Growth Steps.
    `;

    const response = await this.provider.generate({
      contents: prompt,
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
      confidenceScore: result.confidenceScore || 0.95
    };
  }

  async generatePracticeItems(context: IntentResult): Promise<Question[]> {
    const prompt = `
      VOICE: EDUVANE PRIMARY REASONING CORE.
      TASK: Synthesize ${context.count} ${context.difficulty} practice items.
      SUBJECT: ${context.subject}. TOPIC: ${context.topic}.
      
      CONSTRAINTS: Plain text, rigorous, ordered.
    `;

    const response = await this.provider.generate({
      contents: prompt,
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
}

/**
 * EXPLICIT AI ORCHESTRATOR (DETOVA LABS Standard)
 * Logic flows strictly through role-based services. 
 * Providers are injected to ensure portability.
 */

// Initialize providers with role-specific model assignments
const flashProvider = new GeminiProvider("gemini-3-flash-preview");
const proProvider = new GeminiProvider("gemini-3-pro-preview");

// Instantiate services with injected providers
const perception = new PerceptionService(flashProvider);
const interpretation = new InterpretationService(flashProvider);
const reasoning = new PrimaryReasoningService(proProvider);

export const AIOrchestrator = {
  // Public access to interpretation for routing
  interpretation,

  async validateConfiguration(): Promise<boolean> {
    const key = process.env.API_KEY;
    if (!key || key.length < 10) {
      console.error("ORCHESTRATOR_INIT_FAILURE: API_KEY is invalid or missing.");
      return false;
    }
    return true;
  },

  /**
   * EVALUATION PIPELINE: Perception -> Interpretation -> Reasoning
   */
  async evaluateWorkFlow(imageBuffer: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    // Stage 1: Mechanical Perception
    const rawText = await perception.extractVerbatim(imageBuffer);
    
    // Stage 2: Intent Interpretation
    const context = await interpretation.parseIntent(rawText);
    
    // Stage 3: Voice Reasoning (Single point of truth for narrative)
    return await reasoning.generateNarrativeEvaluation(rawText, context);
  },

  /**
   * PRACTICE PIPELINE: Interpretation -> Reasoning
   */
  async generatePracticeFlow(prompt: string): Promise<Question[]> {
    const context = await interpretation.parseIntent(prompt);
    return await reasoning.generatePracticeItems(context);
  }
};
