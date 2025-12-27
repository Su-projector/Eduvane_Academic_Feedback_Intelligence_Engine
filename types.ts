
export type EduvaneMode = 'INSTITUTIONAL' | 'STANDALONE';

export type ValidationStatus = 
  | 'DRAFT_GENERATED' 
  | 'PENDING_REVIEW' 
  | 'VALIDATED' 
  | 'RELEASED' 
  | 'DISMISSED';

export type ConceptualCategory = 'CONCEPTUAL' | 'PROCEDURAL' | 'CARELESS';

export type IntelligenceAudience = 'EDUCATOR' | 'FAMILY' | 'LEARNER';

export interface TranslatedIntelligence {
  audience: IntelligenceAudience;
  headline: string;
  narrative: string;
  actionableStep: string;
}

export interface IntelligenceInsight {
  id: string;
  studentId: string;
  artifactId: string;
  timestamp: string;
  
  // Intelligence Metrics
  confidenceScore: number;
  category: ConceptualCategory;
  handwritingClarity: number;
  
  // The Core "Observation" (Single source of truth)
  rawObservation: string;
  
  // Lifecycle
  status: ValidationStatus;
  mode: EduvaneMode;
  
  // Authority Metadata
  teacherNotes?: string;
  adjustedScore?: number;

  // Impact Layer (Used in components/validation/ValidationGate.tsx)
  impactLevel?: 'HIGH' | 'AMBER' | 'LOW';
}

export interface PresentationContent {
  headline: string;
  narrative: string;
  actionableStep: string;
}
