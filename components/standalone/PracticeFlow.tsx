
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, Save, Plus, Trash2, CheckCircle, BookOpen } from 'lucide-react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { Question, PracticeSet } from '../../types.ts';

interface PracticeFlowProps {
  onSave: (set: PracticeSet) => void;
  onBack: () => void;
}

export const PracticeFlow: React.FC<PracticeFlowProps> = ({ onSave, onBack }) => {
  const [state, setState] = useState<'SETUP' | 'GENERATING' | 'REVIEW' | 'SAVED'>('SETUP');
  const [config, setConfig] = useState({
    subject: '',
    topic: '',
    difficulty: 'Medium',
    count: 5
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    if (!config.topic || !config.subject) return;
    setState('GENERATING');
    try {
      const generated = await AIOrchestrator.generateQuestions({
        subject: config.subject,
        topic: config.topic,
        difficulty: config.difficulty,
        count: config.count
      });
      setQuestions(generated);
      setState('REVIEW');
    } catch (err) {
      console.error(err);
      setState('SETUP');
      alert("Failed to generate questions. Please try again.");
    }
  };

  const handleSave = () => {
    const newSet: PracticeSet = {
      id: `SET-${Date.now()}`,
      subject: config.subject,
      topic: config.topic,
      difficulty: config.difficulty,
      questions: questions,
      timestamp: new Date().toISOString()
    };
    onSave(newSet);
    setState('SAVED');
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  if (state === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={64} />
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#1E3A5F]">Designing Assessment...</h3>
          <p className="text-slate-500 animate-pulse mt-2">AI is tailoring items for {config.subject}: {config.topic}.</p>
        </div>
      </div>
    );
  }

  if (state === 'SAVED') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[#1FA2A6]/10 rounded-full flex items-center justify-center mx-auto text-[#1FA2A6]">
          <CheckCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#1E3A5F]">Assessment Saved!</h2>
          <p className="text-slate-500 mt-2">Your practice set is now available in your history.</p>
        </div>
        <div className="pt-6 flex gap-4">
          <button onClick={onBack} className="flex-1 py-3 bg-[#1E3A5F] text-white rounded-xl font-bold uppercase text-xs tracking-widest">Done</button>
          <button onClick={() => setState('SETUP')} className="flex-1 py-3 border border-slate-200 text-slate-400 rounded-xl font-bold uppercase text-xs tracking-widest">Create Another</button>
        </div>
      </div>
    );
  }

  if (state === 'REVIEW') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-center">
          <button onClick={() => setState('SETUP')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-[#1E3A5F]">
            <ArrowLeft size={16} /> Reconfigure
          </button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-[#1E3A5F]">{config.topic}</h2>
            <p className="text-[10px] font-bold text-[#1FA2A6] uppercase tracking-widest">{config.subject} • {config.difficulty} • {questions.length} Items</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="group flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-[#1FA2A6]/30 transition-all">
              <div className="flex flex-col items-center mt-1">
                <span className="text-xs font-black text-slate-300">{idx + 1}.</span>
                <span className="text-[8px] font-bold text-slate-200 uppercase mt-1">{q.type}</span>
              </div>
              <textarea 
                value={q.text}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                className="flex-grow bg-transparent text-sm font-medium text-[#1E3A5F] focus:outline-none resize-none h-20"
              />
              <button onClick={() => deleteQuestion(q.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => setQuestions([...questions, { id: Date.now().toString(), text: 'New assessment item...', type: 'GENERAL' }])}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-[#1FA2A6]/50 transition-all"
          >
            <Plus size={16} /> ADD ITEM
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onBack} className="px-8 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Discard</button>
          <button onClick={handleSave} className="bg-[#1FA2A6] text-white px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-3">
            <Save size={16} /> Save to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1E3A5F]">Practice Engine</h2>
        <p className="text-slate-500 mt-2">Generate tailored assessments for any academic discipline.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</span>
            <div className="relative mt-2">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="e.g. Sociology, Chemistry, Literature..." 
                value={config.subject}
                onChange={(e) => setConfig({...config, subject: e.target.value})}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1FA2A6]/20 transition-all"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Specific Topic</span>
            <input 
              type="text" 
              placeholder="e.g., French Revolution, Organic Synthesis" 
              value={config.topic}
              onChange={(e) => setConfig({...config, topic: e.target.value})}
              className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1FA2A6]/20 transition-all placeholder:text-slate-300"
            />
          </label>

          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Difficulty</span>
              <select 
                value={config.difficulty}
                onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#1E3A5F] focus:outline-none appearance-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</span>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={config.count}
                onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#1E3A5F] focus:outline-none"
              />
            </label>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!config.topic || !config.subject}
          className="w-full py-4 bg-[#1FA2A6] text-white rounded-2xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          <Sparkles size={18} /> Generate Questions
        </button>
      </div>
    </div>
  );
};
