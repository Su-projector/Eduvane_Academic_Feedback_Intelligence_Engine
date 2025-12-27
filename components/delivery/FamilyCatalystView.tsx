
import React from 'react';
import { IntelligenceInsight } from '../../types.ts';
import { TranslationAdapters } from '../../domains/Translation.ts';
import { MessageSquare, Heart } from 'lucide-react';

interface FamilyCatalystViewProps {
  insights: IntelligenceInsight[];
}

export const FamilyCatalystView: React.FC<FamilyCatalystViewProps> = ({ insights }) => {
  const validatedInsights = insights.filter(i => i.status === 'VALIDATED');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#1E3A5F]">Conversation Catalysts</h2>
        <p className="text-slate-500 text-sm">Your child's intelligence insights translated for family growth.</p>
      </div>

      {validatedInsights.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Heart size={32} />
          </div>
          <p className="text-slate-400 font-medium italic">Pending teacher-validated insights for this week...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {validatedInsights.map(insight => {
            // FIX: Accessing .FAMILY on TranslationAdapters now works correctly after type fixes in Translation.ts
            const translation = TranslationAdapters.FAMILY(insight);
            return (
              <div key={insight.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#1FA2A6]/10 space-y-4">
                <div className="flex items-center gap-3 text-[#1FA2A6]">
                  <MessageSquare size={20} />
                  <h3 className="font-bold text-lg">{translation.headline}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {translation.narrative}
                </p>
                <div className="bg-[#1FA2A6]/5 p-4 rounded-xl border border-[#1FA2A6]/20">
                  <p className="text-[10px] font-bold text-[#1FA2A6] uppercase tracking-widest mb-1">Try This at Home</p>
                  <p className="text-sm font-semibold text-[#1E3A5F]">
                    {translation.actionableStep}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
