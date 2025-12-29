
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, Save, Send, Command } from 'lucide-react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { Question, PracticeSet } from '../../types.ts';

interface PracticeFlowProps {
  initialSubject?: string;
  onSave: (set: PracticeSet) => void;
  onBack: () => void;
}

export const PracticeFlow: React.FC<PracticeFlowProps> = ({ initialSubject = '', onSave, onBack }) => {
  const [state, setState] = useState<'SETUP' | 'GENERATING' | 'REVIEW' | 'SAVED'>('SETUP');
  const [prompt, setPrompt] = useState(initialSubject ? `Generate 5 items for ${initialSubject}` : '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [metadata, setMetadata] = useState<{ subject: string; topic: string }>({ subject: '', topic: '' });

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setState('GENERATING');
    try {
      const generated = await AIOrchestrator.generatePracticeFlow(prompt);
      // We assume the Reasoning layer provides the metadata context now
      const interpretation = await AIOrchestrator.interpretation.parseIntent(prompt);
      setMetadata({ subject: interpretation.subject, topic: interpretation.topic || interpretation.subject });
      setQuestions(generated);
      setState('REVIEW');
    } catch (err) {
      console.error(err);
      setState('SETUP');
      alert("Orchestrator failed to synthesize items. Try a more specific prompt.");
    }
  };

  const handleSave = () => {
    const newSet: PracticeSet = {
      id: `SET-${Date.now()}`,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: 'Dynamic',
      questions: questions,
      timestamp: new Date().toISOString()
    };
    onSave(newSet);
    setState('SAVED');
  };

  if (state === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-10 animate-in zoom-in-95 duration-500">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={100} strokeWidth={1} />
        <div className="text-center">
          <h3 className="text-3xl font-black text-[#1E3A5F]">Orchestrating Pedagogical Rigor</h3>
          <p className="text-slate-500 animate-pulse font-mono text-xs uppercase tracking-[0.3em] mt-2">Primary Reasoning Engine Active</p>
        </div>
      </div>
    );
  }

  if (state === 'REVIEW') {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20">
        <div className="text-right">
          <h2 className="text-3xl font-black text-[#1E3A5F] tracking-tight">{metadata.topic}</h2>
          <p className="text-xs font-black text-[#1FA2A6] uppercase tracking-[0.2em]">{metadata.subject}</p>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 font-medium text-xl text-[#1E3A5F] leading-relaxed">
              <span className="text-[10px] font-black text-slate-300 uppercase block mb-6 tracking-[0.4em]">Item {idx + 1}</span>
              {/* Plain text output - No editable controls as per spec */}
              <p>{q.text}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-6 pt-10">
          <button onClick={() => setState('SETUP')} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#1E3A5F]">Discard</button>
          <button onClick={handleSave} className="bg-[#1FA2A6] text-white px-14 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl">
            Index Practice Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-10 px-4">
      <div className="text-center space-y-3">
        <h2 className="text-5xl font-black text-[#1E3A5F] tracking-tighter">Command Generation</h2>
        <p className="text-slate-400 font-medium text-xl italic">Agnostic synthesis. Any subject, any level.</p>
      </div>

      <div className="bg-[#1E3A5F] p-12 rounded-[3.5rem] shadow-2xl text-white">
        <form onSubmit={handleExecute} className="relative">
          <Command className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1FA2A6]" size={28} />
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., '10 Physics problems' or 'Literature test on 1984'"
            className="w-full bg-white text-[#1E3A5F] rounded-[2rem] py-8 px-16 outline-none focus:ring-8 focus:ring-[#1FA2A6]/20 transition-all font-black shadow-2xl text-xl placeholder:text-slate-300"
          />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-6 bg-[#1E3A5F] rounded-2xl text-[#1FA2A6]"
          >
            <Send size={28} />
          </button>
        </form>
      </div>
      
      <button onClick={onBack} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] hover:text-[#1E3A5F]">Exit engine</button>
    </div>
  );
};
