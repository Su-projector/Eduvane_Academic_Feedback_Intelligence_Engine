
export type UserMode = 'LEARNER' | 'TEACHER';
export type ValidationStatus = 'VALIDATED' | 'PENDING_REVIEW' | 'DRAFT_GENERATED' | 'RELEASED';

// Added missing EduvaneMode definition
export type EduvaneMode = 'STANDALONE' | 'INSTITUTIONAL';

// Added missing IntelligenceAudience definition
export type IntelligenceAudience = 'EDUCATOR' | 'FAMILY' | 'LEARNER';

// Added missing TranslatedIntelligence definition
export interface TranslatedIntelligence {
  audience: IntelligenceAudience;
  headline: string;
  narrative: string;
  actionableStep: string;
}

// Added missing PresentationContent definition
export interface PresentationContent {
  headline: string;
  narrative: string;
  actionableStep: string;
}

export interface UserProfile {
  id: string;
  email: string;
  xp_total: number;
}

export interface IntentResult {
  intent: 'PRACTICE' | 'ANALYZE' | 'HISTORY' | 'UNKNOWN';
  subject?: string;
  topic?: string;
  message?: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
}

export interface Submission {
  id: string;
  user_id?: string;
  timestamp: string;
  subject: string;
  topic?: string;
  score: number;
  feedback: string;
  improvementSteps: string[];
  imageUrl?: string;
  confidenceScore: number;
}

export interface PracticeSet {
  id: string;
  user_id?: string;
  subject: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  timestamp: string;
}

export interface IntelligenceInsight {
  id: string;
  studentId: string;
  artifactId: string;
  timestamp: string;
  confidenceScore: number;
  category: 'CONCEPTUAL' | 'PROCEDURAL' | 'CARELESS';
  handwritingClarity: number;
  rawObservation: string;
  observationalStatement: string; 
  status: ValidationStatus;
  // Added mode property to fix error in IntelligenceCore.ts
  mode: EduvaneMode;
  impactLevel: 'HIGH' | 'AMBER' | 'LOW';
}
