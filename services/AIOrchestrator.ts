
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * ARCHITECTURAL PROVIDER INTERFACE
 * Decouples model identity from architectural role.
 */
interface AIProvider {
  generate(params: GenerateContentParameters): Promise<any>;
}

/**
 * GEMINI PROVIDER ADAPTER
 * Uses process.env.API_KEY exclusively and initializes GoogleGenAI instance right before making calls.
 */
class GeminiProvider implements AIProvider {
  private modelName: string;

  constructor(model: string) {
    this.modelName = model;
  }

  async generate(params: any) {
    // Correctly obtain API key exclusively from process.env.API_KEY
    const apiKey = process.env.API_KEY;
    // Create new instance before each call to ensure up-to-date configuration
    const ai = new GoogleGenAI({ apiKey });
    return await ai.models.generateContent({
      model: this.modelName,
      ...params
    });
  }
}

/**
 * ROLE 1: PERCEPTION SERVICE
 * Responsibility: Mechanical text extraction only. No inference.
 */
class PerceptionService {
  private provider: AIProvider;
  constructor() {
    this.provider = new GeminiProvider("gemini-3-flash-preview");
  }

  async extractVerbatim(imageBuffer: string): Promise<string> {
    const response = await this.provider.generate({
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: "PERCEPTION TASK: VERBATIM EXTRACTION. Extract all text exactly. No correction. No interpretation. No grading. Return raw text markdown." }
        ]
      }
    });
    // Access .text property directly as it returns string | undefined
    return response.text || "";
  }
}

/**
 * ROLE 2: INTERPRETATION SERVICE
 * Responsibility: Subject detection, Intent parsing, OCR Cleanup.
 */
class InterpretationService {
  private provider: AIProvider;
  constructor() {
    this.provider = new GeminiProvider("gemini-3-flash-preview");
  }

  async parseIntent(input: string): Promise<IntentResult> {
    const prompt = `
      INTERPRETATION TASK: Analyze input for structured context.
      INPUT: "${input}"
      
      OUTPUT JSON SCHEMA:
      {
        "intent": "ANALYZE" | "PRACTICE" | "HISTORY" | "CHAT",
        "subject": "Detected Academic Subject",
        "topic": "Specific Concept",
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

    // Access .text property directly
    return JSON.parse(response.text || "{}");
  }
}

/**
 * ROLE 3: PRIMARY REASONING SERVICE
 * Responsibility: Single Voice output. Scoring, Feedback, Question Generation.
 */
class PrimaryReasoningService {
  private provider: AIProvider;
  constructor() {
    this.provider = new GeminiProvider("gemini-3-pro-preview");
  }

  async evaluate(rawText: string, context: IntentResult): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const prompt = `
      ROLE: EDUVANE PRIMARY REASONING VOICE.
      SUBJECT: ${context.subject}. TOPIC: ${context.topic}.
      DATA: ${rawText}
      
      TASK: 
      1. Produce a Mastery Score (0-100).
      2. Provide encouraging, conversational pedagogical feedback.
      3. List 3 specific actionable improvement steps.
      
      CONSTRAINTS:
      - Score MUST appear first.
      - Tone: Encouraging and non-authoritative.
      - Single Voice: Do not mention internal layers.
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

    // Access .text property directly
    const data = JSON.parse(response.text || "{}");
    return {
      subject: context.subject,
      topic: context.topic || "Academic Work",
      score: data.score,
      feedback: data.feedback,
      improvementSteps: data.improvementSteps,
      confidenceScore: data.confidenceScore || 0.9
    };
  }

  async generateQuestions(context: IntentResult): Promise<Question[]> {
    const prompt = `
      ROLE: EDUVANE PRIMARY REASONING VOICE.
      TASK: Generate ${context.count || 5} ${context.difficulty || 'Medium'} questions for ${context.subject}: ${context.topic}.
      
      FORMAT:
      - Plain text. Ordered.
      - No editable UI markers.
      - High academic rigor.
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

    // Access .text property directly
    return JSON.parse(response.text || "[]");
  }
}

/**
 * EXPLICIT AI ORCHESTRATOR
 * Coordinates role-based services in sequential order.
 */
export const AIOrchestrator = {
  perception: new PerceptionService(),
  interpretation: new InterpretationService(),
  reasoning: new PrimaryReasoningService(),

  async validateConfiguration() {
    // Validate exclusively against process.env.API_KEY as per core requirement
    if (!process.env.API_KEY) {
      console.error("AI Orchestrator Initialization Failure: Missing API_KEY");
      return false;
    }
    return true;
  },

  /**
   * FLOW A: UPLOAD EVALUATION
   * Perception -> Interpretation -> Primary Reasoning
   */
  async evaluateWorkFlow(imageBuffer: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const rawText = await this.perception.extractVerbatim(imageBuffer);
    const context = await this.interpretation.parseIntent(rawText);
    return await this.reasoning.evaluate(rawText, context);
  },

  /**
   * FLOW B: QUESTION GENERATION
   * Prompt -> Interpretation -> Primary Reasoning
   */
  async generatePracticeFlow(prompt: string): Promise<Question[]> {
    const context = await this.interpretation.parseIntent(prompt);
    return await this.reasoning.generateQuestions(context);
  }
};
