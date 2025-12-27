
import React, { useState } from 'react';
import { EduvaneMode, IntelligenceInsight } from './types.ts';
import { EducatorDashboard } from './components/delivery/EducatorDashboard.tsx';
import { FamilyPortal } from './components/delivery/FamilyPortal.tsx';
import { AssessmentCreator } from './components/delivery/AssessmentCreator.tsx';
import { VaneIcon } from './constants.tsx';

const MOCK_INSIGHTS: IntelligenceInsight[] = [
  {
    id: 'INS-001',
    studentId: 'ST-99',
    artifactId: 'SCAN-A',
    timestamp: new Date().toISOString(),
    confidenceScore: 0.92,
    category: 'PROCEDURAL',
    handwritingClarity: 0.85,
    rawObservation: 'Consistent mastery of long division; minor variance in remainder notation',
    status: 'PENDING_REVIEW',
    mode: 'INSTITUTIONAL'
  }
];

const App: React.FC = () => {
  const [mode, setMode] = useState<EduvaneMode>('INSTITUTIONAL');
  const [view, setView] = useState<'CREATOR' | 'DASHBOARD' | 'FAMILY'>('DASHBOARD');
  const [insights, setInsights] = useState<IntelligenceInsight[]>(MOCK_INSIGHTS);

  const updateInsight = (id: string, updates: Partial<IntelligenceInsight>) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <header className="bg-[#1E3A5F] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <VaneIcon color="#1FA2A6" size={32} />
            <div>
              <h1 className="text-xl font-bold leading-none">EDUVANE</h1>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">Learning Intelligence Engine</p>
            </div>
          </div>
          
          <div className="flex bg-black/20 rounded-lg p-1">
            <button 
              onClick={() => setMode('INSTITUTIONAL')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${mode === 'INSTITUTIONAL' ? 'bg-[#1FA2A6] text-white' : 'text-slate-400'}`}
            >INSTITUTIONAL</button>
            <button 
              onClick={() => setMode('STANDALONE')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${mode === 'STANDALONE' ? 'bg-[#1FA2A6] text-white' : 'text-slate-400'}`}
            >STANDALONE</button>
          </div>

          <nav className="flex gap-6">
            <button onClick={() => setView('CREATOR')} className={`text-xs font-bold uppercase tracking-widest ${view === 'CREATOR' ? 'text-[#1FA2A6]' : 'text-slate-300'}`}>Create</button>
            <button onClick={() => setView('DASHBOARD')} className={`text-xs font-bold uppercase tracking-widest ${view === 'DASHBOARD' ? 'text-[#1FA2A6]' : 'text-slate-300'}`}>Review</button>
            <button onClick={() => setView('FAMILY')} className={`text-xs font-bold uppercase tracking-widest ${view === 'FAMILY' ? 'text-[#1FA2A6]' : 'text-slate-300'}`}>Family</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        {view === 'CREATOR' && <AssessmentCreator />}
        {view === 'DASHBOARD' && (
          <EducatorDashboard 
            insights={insights} 
            mode={mode}
            onUpdate={updateInsight}
          />
        )}
        {view === 'FAMILY' && <FamilyPortal insights={insights} mode={mode} />}
      </main>

      <footer className="bg-white border-t p-4 text-center text-[10px] text-slate-400 font-mono tracking-widest">
        SYSTEM MODE: {mode} | BUILD 2025.A1 | DETOVA LABS
      </footer>
    </div>
  );
};

export default App;
