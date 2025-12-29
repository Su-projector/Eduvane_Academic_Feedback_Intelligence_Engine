
import React, { useState } from 'react';
import { Sparkles, TrendingUp, Clock, Send, Loader2, Command } from 'lucide-react';
import { Submission, UserProfile } from '../../types.ts';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';

interface DashboardProps {
  onAction: (view: 'UPLOAD' | 'PRACTICE' | 'HISTORY') => void;
  onCommand: (intent: string, subject?: string, topic?: string) => void;
  submissions: Submission[];
  profile: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAction, onCommand, submissions, profile }) => {
  const [command, setCommand] = useState('');
  const [isRouting, setIsRouting] = useState(false);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setIsRouting(true);
    try {
      // TRIGGER INTERPRETATION LAYER - Corrected from 'interpret' to 'interpretationLayer' to match the service interface
      const result = await AIOrchestrator.interpretationLayer(command);
      setCommand('');
      onCommand(result.intent, result.subject, result.topic);
    } catch (e) {
      console.error("Routing Error:", e);
      alert("Command not understood. Use simple prompts like 'Practice Science'.");
    } finally {
      setIsRouting(false);
    }
  };

  const avgScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#1E3A5F] p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden border-b-8 border-[#1FA2A6]">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-2">
            <Command size={16} className="text-[#1FA2A6]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1FA2A6]">Eduvane Intelligence Link</span>
          </div>
          
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Welcome, {profile?.email.split('@')[0]}</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg mt-2 font-medium italic">Conversational command bar active. Speak to the Core.</p>
          </div>
          
          <form onSubmit={handleCommandSubmit} className="relative">
            <input 
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., 'Evaluate my chemistry work' or 'Need 5 physics questions'..."
              className="w-full bg-white text-[#1E3A5F] rounded-2xl py-6 px-8 pr-20 outline-none focus:ring-4 focus:ring-[#1FA2A6]/20 transition-all placeholder:text-slate-400 font-bold shadow-2xl text-lg"
              disabled={isRouting}
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 md:p-5 bg-[#1E3A5F] rounded-xl text-[#1FA2A6] shadow-lg disabled:opacity-50"
              disabled={isRouting}
            >
              {isRouting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-[#1FA2A6]" />
            <h3 className="font-black text-[#1E3A5F] text-xs uppercase tracking-widest">Growth Mastery</h3>
          </div>
          <p className="text-6xl font-black text-[#1E3A5F]">{avgScore}%</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Aggregated Score across {submissions.length} signals</p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-[#1E3A5F]" />
            <h3 className="font-black text-[#1E3A5F] text-xs uppercase tracking-widest">Recent Signals</h3>
          </div>
          <div className="space-y-4">
            {submissions.slice(0, 3).map(s => (
              <div key={s.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="font-bold text-[#1E3A5F] text-sm">{s.subject}</span>
                <span className="font-black text-[#1FA2A6]">{s.score}%</span>
              </div>
            ))}
            {submissions.length === 0 && <p className="text-slate-400 text-xs italic">Waiting for your first upload signal.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};
