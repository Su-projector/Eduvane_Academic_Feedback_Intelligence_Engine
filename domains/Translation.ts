
import { IntelligenceInsight, TranslatedIntelligence, IntelligenceAudience } from '../types.ts';

/**
 * TRANSLATION DOMAIN
 * Responsibility: Adapting central intelligence for different stakeholders.
 * Design Mandate: One insight, many voices.
 */
export const TranslationAdapters = {
  // Fix: conceptualCategory -> category and observationalStatement -> rawObservation to match IntelligenceInsight interface
  EDUCATOR: (insight: IntelligenceInsight): TranslatedIntelligence => ({
    audience: 'EDUCATOR',
    headline: `Intervention Signal: ${insight.category}`,
    narrative: `The learner demonstrates ${insight.rawObservation}. Confidence: ${(insight.confidenceScore * 100).toFixed(0)}%.`,
    actionableStep: 'Deploy Targeted Small-Group Instruction on unit conversion.'
  }),

  // FIX: Use 'FAMILY' as key to satisfy property access in delivery components.
  FAMILY: (insight: IntelligenceInsight): TranslatedIntelligence => ({
    audience: 'FAMILY',
    headline: 'Conversation Catalyst',
    narrative: `In math this week, your child is exploring how units relate to one another. They are currently bridging the gap between calculation and application.`,
    actionableStep: 'Ask: "How many inches are in half a foot?" while cooking together.'
  }),

  // FIX: Use 'LEARNER' as key.
  LEARNER: (insight: IntelligenceInsight): TranslatedIntelligence => ({
    audience: 'LEARNER',
    headline: 'Mastery Milestone',
    narrative: `You've mastered the procedural steps! We're now focusing on the "Why" behind unit conversions to unlock the next level.`,
    actionableStep: 'Try the "Spatial Reasoning" challenge on your mastery map.'
  })
};
