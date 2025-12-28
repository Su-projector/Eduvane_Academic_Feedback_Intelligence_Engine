
import React from 'react';
import { AlertCircle, CheckCircle2, FileSearch, TrendingUp } from 'lucide-react';
import { DiagnosticCard } from './DiagnosticCard.tsx';

const MOCK_DATA = [
  {
    id: 'ST-001',
    student: 'A. Miller',
    confidence: 0.92,
    status: 'auto-validated',
    insight: 'The analysis correctly identifies primary historical themes but lacks explicit evidence synthesis—a pattern suggesting developmental needs in argumentative rigor.',
    clarityNote: 'Observation: Conceptual synthesis is emerging. Action: Model evidence-driven claims.',
    priority: 'low'
  },
  {
    id: 'ST-002',
    student: 'J. Doe',
    confidence: 0.68,
    status: 'insight-review',
    insight: 'The learner demonstrates emerging mastery of thesis construction but struggles with logical transitions—a pattern to address before multi-source synthesis.',
    clarityNote: 'Clarity check: Structural logic requires educator reinforcement.',
    priority: 'high'
  },
  {
    id: 'ST-003',
    student: 'S. Chen',
    confidence: 0.81,
    status: 'insight-review',
    insight: 'Work shows mastery of basic terminology; however, application of theoretical frameworks appears inconsistent in comparative analysis.',
    clarityNote: 'Observation: Framework application is in draft phase.',
    priority: 'amber'
  }
];

export const InterventionMatrix: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Intervention Matrix</h2>
          <p className="text-slate-500 text-sm">Cross-disciplinary diagnostic signals for adaptive instruction.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#F2A900]"></span>
            High Priority: {MOCK_DATA.filter(d => d.priority === 'high' || d.priority === 'amber').length}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle2 size={14} className="text-[#1FA2A6]" />
            Validated: {MOCK_DATA.filter(d => d.status === 'auto-validated').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileSearch size={18} className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-[#1E3A5F] uppercase tracking-wider text-sm">Review Queue</h3>
          </div>
          <div className="space-y-4">
            {MOCK_DATA.filter(d => d.status === 'insight-review').map(item => (
              <DiagnosticCard key={item.id} data={item} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-[#1E3A5F] uppercase tracking-wider text-sm">Intelligence Trends</h3>
          </div>
          <div className="space-y-4 opacity-75">
            {MOCK_DATA.filter(d => d.status === 'auto-validated').map(item => (
              <DiagnosticCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
