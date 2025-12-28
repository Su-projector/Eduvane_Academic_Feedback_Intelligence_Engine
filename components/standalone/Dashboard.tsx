
import React, { useState } from 'react';
import { Upload, Sparkles, TrendingUp, Clock, Search, Send, Loader2 } from 'lucide-react';
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

  const avgScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
    : 0;

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setIsRouting(true);
    try {
      const result = await AIOrchestrator.routeIntent(command);
      setCommand('');
      onCommand(result.intent, result.subject, result.topic);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Conversational Command Bar */}
      <div className="bg-[#1E3A5F] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-bold">Welcome back, {profile?.email.split('@')[0]}</h2>
          <p className="text-slate-300 text-sm max-w-lg">What would you like to learn or evaluate today? Just type it below.</p>
          
          <form onSubmit={handleCommandSubmit} className="relative group">
            <input 
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., 'Help me practice calculus' or 'Score my history essay'..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 pr-16 outline-none focus:bg-white/15 focus:border-[#1FA2A6] transition-all text-white placeholder:text-slate-400 font-medium"
              disabled={isRouting}
            />
            <button 
              type="submit"
              disabled={isRouting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#1FA2A6] rounded-xl text-white shadow-lg hover:bg-[#198d91] transition-all disabled:opacity-50"
            >
              {isRouting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Intent Routing Active</span>
            <span className="text-[#1FA2A6]">Gemini-3 Pro v2.1</span>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Sparkles size={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-[#1FA2A6]" />
            <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wider">Learning Snapshot</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-5xl font-black text-[#1FA2A6]">{avgScore}%</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Overall Mastery</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#1E3A5F]">{submissions.length}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Intelligence Signals</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-[#1E3A5F]" />
            <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wider">Recent Signals</h3>
          </div>
          <div className="space-y-4">
            {submissions.slice(0, 3).map(s => (
              <div key={s.id} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-all">
                <div>
                  <h4 className="font-bold text-[#1E3A5F] text-sm">{s.subject}</h4>
                  <p className="text-[10px] text-slate-400 uppercase">{new Date(s.timestamp).toLocaleDateString()}</p>
                </div>
                <span className={`font-black text-lg ${s.score >= 80 ? 'text-[#1FA2A6]' : 'text-amber-500'}`}>{s.score}%</span>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 italic">No work captured yet.</p>
                <button onClick={() => onAction('UPLOAD')} className="text-[#1FA2A6] text-[10px] font-bold uppercase tracking-widest mt-2">Begin First Analysis</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
