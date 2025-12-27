
import React from 'react';
import { IntelligenceInsight } from '../../types.ts';
import { ShieldCheck, Zap, AlertCircle, Check } from 'lucide-react';

interface ValidationGateProps {
  insight: IntelligenceInsight;
  onApprove?: () => void;
  isReadOnly?: boolean;
}

export const ValidationGate: React.FC<ValidationGateProps> = ({ insight, onApprove, isReadOnly }) => {
  const isHighImpact = insight.impactLevel === 'HIGH';

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 transition-all ${isHighImpact ? 'border-amber-400' : 'border-slate-100'}`}>
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isHighImpact ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertCircle size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Impact Layer</p>
              <h4 className="text-xs font-bold text-[#1E3A5F] uppercase">{insight.impactLevel} PRIORITY</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">AI Confidence</p>
            <span className={`text-xs font-mono font-bold ${(insight.confidenceScore * 100) >= 85 ? 'text-[#1FA2A6]' : 'text-amber-500'}`}>
              {(insight.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="bg-[#F7F9FC] p-4 rounded-lg border border-slate-100 italic font-serif text-slate-700 leading-relaxed shadow-inner">
          <Zap size={14} className="text-[#1FA2A6] mb-2" />
          "{insight.observationalStatement}"
        </div>

        {!isReadOnly && onApprove && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={onApprove}
              className="flex-grow bg-[#1FA2A6] text-white text-[10px] font-bold py-2 rounded uppercase tracking-widest hover:bg-[#198d91] transition-all flex items-center justify-center gap-2"
            >
              <Check size={14} /> APPROVE FOR GROWTH PATHWAY
            </button>
            <button className="px-4 py-2 text-[10px] font-bold text-slate-400 border border-slate-200 rounded uppercase tracking-widest hover:bg-slate-50">
              EDIT
            </button>
          </div>
        )}

        {isReadOnly && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#1FA2A6] uppercase tracking-widest pt-2">
            <ShieldCheck size={14} /> Validated Intelligence | Propagating to Stakeholders
          </div>
        )}
      </div>
    </div>
  );
};
