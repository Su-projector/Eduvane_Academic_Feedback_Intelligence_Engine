
import { IntelligenceInsight, PresentationContent } from '../types.ts';

export const TranslationService = {
  forFamily: (insight: IntelligenceInsight): PresentationContent => ({
    headline: "This Week's Discovery",
    narrative: `Your child is mastering how numbers relate! Currently, they are focusing on the 'why' behind multi-step problems.`,
    actionableStep: "Try asking: 'How did you decide which step to do first?'"
  }),
  
  forLearner: (insight: IntelligenceInsight): PresentationContent => ({
    headline: "Growth Milestone",
    narrative: `You've got the process down! Now, let's strengthen the core concepts to make these problems feel even easier.`,
    actionableStep: "Check out the 'Visual Ratios' challenge on your map."
  }),
  
  forEducator: (insight: IntelligenceInsight): PresentationContent => ({
    headline: `Diagnostic: ${insight.category}`,
    narrative: `Pattern detected: ${insight.rawObservation}. AI Confidence: ${(insight.confidenceScore * 100).toFixed(0)}%.`,
    actionableStep: "Targeted small-group intervention recommended."
  })
};
