
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * ARCHITECTURAL PROVIDER INTERFACE
 */
interface AIProvider {
  generate(params: GenerateContentParameters): Promise<{ text: string | undefined }>;
}

/**
 * GEMINI PROVIDER ADAPTER
 * Adheres to strict browser initialization guidelines.
 */
class GeminiProvider implements AIProvider {
  private modelName: string;

  constructor(model: string) {
    this.modelName = model;
  }

  async generate(params: GenerateContentParameters) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("ORCHESTRATOR_WARNING: API_KEY is undefined. Requests will fail.");
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey as string });
    return await ai.models.generateContent({
      model: this.modelName,
      ...params
    });
  }
}

/**
 * ROLE: PERCEPTION SERVICE
 * Mechanical OCR / Verbatim extraction with dynamic MIME support.
 */
class PerceptionService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async extractVerbatim(imageBuffer: string, mimeType: string = "image/jpeg"): Promise<string> {
    const response = await this.provider.generate({
      contents: [{
        parts: [
          { inlineData: { data: imageBuffer, mimeType: mimeType } },
          { text: "MECHANICAL TASK: VERBATIM OCR. Return every character exactly as seen. raw string output only." }
        ]
      }]
    });
    return response.text || "";
  }
}

/**
 * ROLE: INTERPRETATION SERVICE
 */
class InterpretationService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async parseIntent(input: string): Promise<IntentResult> {
    const prompt = `CLASSIFY INPUT SIGNAL: "${input}"`;

    const response = await this.provider.generate({
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { 
              type: Type.STRING, 
              description: "The inferred user action: PRACTICE, ANALYZE, HISTORY, or CHAT." 
            },
            subject: { 
              type: Type.STRING, 
              description: "The academic subject (e.g., Biology, Algebra)." 
            },
            topic: { 
              type: Type.STRING, 
              description: "The specific unit or concept." 
            },
            difficulty: { 
              type: Type.STRING, 
              description: "Easy, Medium, or Hard." 
            },
            count: { 
              type: Type.NUMBER, 
              description: "Quantity of items requested." 
            }
          },
          required: ["intent", "subject"],
          propertyOrdering: ["intent", "subject", "topic", "difficulty", "count"]
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
      console.error("Parse Error:", e);
      return { intent: "UNKNOWN", subject: "General" };
    }
  }
}

/**
 * ROLE: PRIMARY REASONING SERVICE
 */
class PrimaryReasoningService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generateNarrativeEvaluation(rawText: string, context: IntentResult): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const prompt = `
      VOICE: EDUVANE CORE.
      CONTEXT: Subject [${context.subject}], Topic [${context.topic}].
      WORK SIGNAL: ${rawText}
      TASK: Evaluate mastery and provide pedagogical growth steps.
    `;

    const response = await this.provider.generate({
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Mastery percentage 0-100." },
            feedback: { type: Type.STRING, description: "Detailed pedagogical feedback." },
            improvementSteps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 concrete next steps."
            },
            confidenceScore: { type: Type.NUMBER, description: "AI confidence in diagnosis." }
          },
          required: ["score", "feedback", "improvementSteps"],
          propertyOrdering: ["score", "feedback", "improvementSteps", "confidenceScore"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      subject: context.subject,
      topic: context.topic || context.subject,
      score: result.score || 0,
      feedback: result.feedback || "Unable to generate feedback for this signal.",
      improvementSteps: result.improvementSteps || ["Review core concepts", "Try a simpler problem", "Consult reference materials"],
      confidenceScore: result.confidenceScore || 0.8
    };
  }

  async generatePracticeItems(context: IntentResult): Promise<Question[]> {
    const prompt = `Synthesize ${context.count} ${context.difficulty} practice items for ${context.subject}: ${context.topic}.`;

    const response = await this.provider.generate({
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
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

// Initialize providers with optimized role mapping
const flashProvider = new GeminiProvider("gemini-3-flash-preview");
const proProvider = new GeminiProvider("gemini-3-pro-preview");

const perception = new PerceptionService(flashProvider);
const interpretation = new InterpretationService(flashProvider);
const reasoning = new PrimaryReasoningService(proProvider);

export const AIOrchestrator = {
  interpretation,
  async validateConfiguration(): Promise<boolean> { return true; },

  async evaluateWorkFlow(imageBuffer: string, mimeType: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const rawText = await perception.extractVerbatim(imageBuffer, mimeType);
    const context = await interpretation.parseIntent(rawText);
    return await reasoning.generateNarrativeEvaluation(rawText, context);
  },

  async generatePracticeFlow(prompt: string): Promise<Question[]> {
    const context = await interpretation.parseIntent(prompt);
    return await reasoning.generatePracticeItems(context);
  }
};
