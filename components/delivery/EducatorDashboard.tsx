
import React from 'react';
import { IntelligenceInsight, EduvaneMode } from '../../types.ts';
import { ValidationGate } from '../validation/ValidationGate.tsx';
import { ClipboardList, Send } from 'lucide-react';

interface EducatorDashboardProps {
  insights: IntelligenceInsight[];
  mode: EduvaneMode;
  onUpdate: (id: string, updates: Partial<IntelligenceInsight>) => void;
}

export const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ insights, mode, onUpdate }) => {
  const pending = insights.filter(i => i.status === 'PENDING_REVIEW' || i.status === 'DRAFT_GENERATED');
  const validated = insights.filter(i => i.status === 'VALIDATED');
  const released = insights.filter(i => i.status === 'RELEASED');

  const releaseAll = () => {
    validated.forEach(i => onUpdate(i.id, { status: 'RELEASED' }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1E3A5F]">Intelligence Review</h2>
          <p className="text-slate-500">Analyze and validate draft academic insights.</p>
        </div>
        
        {mode === 'INSTITUTIONAL' && validated.length > 0 && (
          <button 
            onClick={releaseAll}
            className="bg-[#1FA2A6] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Send size={16} /> Release {validated.length} Insights to Families
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-tighter">
            <ClipboardList size={14} /> Review Queue ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-sm">
              All intelligence drafts processed.
            </div>
          ) : (
            pending.map(i => (
              <ValidationGate 
                key={i.id} 
                insight={i} 
                onApprove={() => onUpdate(i.id, { status: 'VALIDATED' })}
              />
            ))
          )}
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-tighter">
            Released Intelligence ({released.length})
          </h3>
          <div className="space-y-4 opacity-60 pointer-events-none">
            {released.map(i => (
              <ValidationGate key={i.id} insight={i} isReadOnly />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
