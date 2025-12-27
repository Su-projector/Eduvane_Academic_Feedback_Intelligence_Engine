
import React from 'react';
import { IntelligenceInsight, EduvaneMode } from '../../types.ts';
import { TranslationService } from '../../services/TranslationService.ts';
import { Heart, Lock } from 'lucide-react';

interface FamilyPortalProps {
  insights: IntelligenceInsight[];
  mode: EduvaneMode;
}

export const FamilyPortal: React.FC<FamilyPortalProps> = ({ insights, mode }) => {
  const visible = insights.filter(i => i.status === 'RELEASED');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1E3A5F]">Support Partner Portal</h2>
        <p className="text-slate-500">Gently turning assessment data into conversation.</p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            {mode === 'INSTITUTIONAL' ? <Lock size={40} /> : <Heart size={40} />}
          </div>
          <div>
            <h3 className="font-bold text-[#1E3A5F]">No insights released yet.</h3>
            <p className="text-sm text-slate-400 mt-2">
              {mode === 'INSTITUTIONAL' 
                ? "Your teacher is currently reviewing this week's learning patterns."
                : "Begin an assessment to see learning intelligence here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {visible.map(i => {
            const content = TranslationService.forFamily(i);
            return (
              <div key={i.id} className="bg-white p-8 rounded-3xl shadow-sm border border-[#1FA2A6]/10 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Heart className="text-red-100" size={48} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1FA2A6]">{content.headline}</span>
                <p className="text-lg font-medium text-slate-700 leading-relaxed italic font-serif">
                  "{content.narrative}"
                </p>
                <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">How to Support</p>
                  <p className="text-sm font-semibold text-[#1E3A5F]">{content.actionableStep}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
