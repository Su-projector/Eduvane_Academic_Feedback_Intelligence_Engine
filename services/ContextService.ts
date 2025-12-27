
import { EduvaneMode, ValidationStatus } from '../types.ts';

export const ContextService = {
  getInitialStatus: (mode: EduvaneMode, confidence: number): ValidationStatus => {
    if (mode === 'STANDALONE') return 'RELEASED';
    return confidence >= 0.95 ? 'PENDING_REVIEW' : 'PENDING_REVIEW'; // Institutional always requires a look
  },
  
  shouldShowReleaseGate: (mode: EduvaneMode): boolean => mode === 'INSTITUTIONAL'
};
