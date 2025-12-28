
import { IntelligenceInsight } from '../types.ts';

/**
 * INTELLIGENCE CORE DOMAIN
 * Responsibility: Processing signals into structured subject-agnostic insights.
 */
export const IntelligenceCore = {
  /**
   * Generates confidence-aware intelligence from processed artifacts.
   */
  generateInsight: (data: any): IntelligenceInsight => {
    const confidence = calculateConfidence(data);
    
    return {
      id: `INS-${Math.random().toString(36).substr(2, 9)}`,
      studentId: data.studentId || 'ANON',
      artifactId: data.refId,
      timestamp: new Date().toISOString(),
      confidenceScore: confidence,
      category: determineCategory(data),
      handwritingClarity: data.clarity || 0.85,
      rawObservation: data.rawObservation,
      observationalStatement: data.rawObservation,
      status: confidence >= 0.85 ? 'VALIDATED' : 'PENDING_REVIEW',
      mode: data.mode || 'INSTITUTIONAL',
      impactLevel: confidence < 0.7 ? 'HIGH' : (confidence < 0.85 ? 'AMBER' : 'LOW')
    };
  }
};

const calculateConfidence = (data: any): number => {
  return data.confidence || 0.85;
};

const determineCategory = (data: any): 'CONCEPTUAL' | 'PROCEDURAL' | 'CARELESS' => {
  // Broadened definitions:
  // CONCEPTUAL: Misunderstanding of core subject principles.
  // PROCEDURAL: Error in execution flow, structural logic, or grammar.
  // CARELESS: Transient slip despite underlying mastery.
  if (data.errorPattern === 'logic' || data.errorPattern === 'argument') return 'CONCEPTUAL';
  if (data.errorPattern === 'arithmetic' || data.errorPattern === 'syntax' || data.errorPattern === 'structure') return 'PROCEDURAL';
  return 'CARELESS';
};
