
import React, { useState, useEffect } from 'react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { Submission } from '../../types.ts';
import { Upload, Loader2, CheckCircle, ArrowLeft, Lightbulb, BookOpen, Camera } from 'lucide-react';

interface UploadFlowProps {
  userId: string;
  initialSubject?: string;
  onComplete: (sub: Submission) => void;
  onBack: () => void;
}

export const UploadFlow: React.FC<UploadFlowProps> = ({ userId, initialSubject = '', onComplete, onBack }) => {
  const [state, setState] = useState<'IDLE' | 'PROCESSING' | 'RESULT'>('IDLE');
  const [subject, setSubject] = useState(initialSubject);
  const [result, setResult] = useState<Submission | null>(null);
  const [progressMsg, setProgressMsg] = useState('');

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
  }, [initialSubject]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !subject) return;

    setState('PROCESSING');
    setProgressMsg('Reading image signal...');
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        setProgressMsg('Uploading to secure vault...');
        const publicUrl = await SupabaseService.storage.upload(userId, base64);
        
        setProgressMsg('Activating Intelligence Core...');
        const analysis = await AIOrchestrator.analyzeWork(base64, { subject });
        
        const submission: Submission = {
          ...analysis,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          imageUrl: publicUrl
        };
        
        setProgressMsg('Persisting analysis...');
        await SupabaseService.submissions.save(userId, submission);
        
        setResult(submission);
        onComplete(submission);
        setState('RESULT');
      } catch (err) {
        console.error(err);
        setState('IDLE');
        alert("Evaluation pipeline interrupted. Please check your image clarity.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <Loader2 className="animate-spin text-[#1FA2A6]" size={80} strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <VaneIcon size={32} color="#1FA2A6" className="animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#1E3A5F]">Processing Work</h3>
          <p className="text-slate-500 animate-pulse mt-2 font-mono text-xs uppercase tracking-widest">{progressMsg}</p>
        </div>
      </div>
    );
  }

  if (state === 'RESULT' && result) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-[#1E3A5F]">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="bg-[#1FA2A6]/10 text-[#1FA2A6] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {result.subject} Analysis captured
          </span>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-2xl border-b-8 border-[#1FA2A6]">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - result.score / 100)} className="text-[#1FA2A6] transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1E3A5F]">{result.score}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Mastery</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-4">
              <h2 className="text-3xl font-bold text-[#1E3A5F]">Intelligence Feedback</h2>
              <p className="text-lg text-slate-800 leading-relaxed font-medium insight-narrative">
                "{result.feedback}"
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-[#1FA2A6]">
              <Lightbulb size={20} />
              <h4 className="font-bold text-[#1E3A5F] uppercase text-xs tracking-widest">Growth Pathway</h4>
            </div>
            <ul className="space-y-3">
              {result.improvementSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="font-black text-[#1FA2A6]">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#1E3A5F] p-8 rounded-2xl text-white flex flex-col justify-center items-center text-center shadow-xl">
            {result.imageUrl && (
              <img src={result.imageUrl} alt="Analyzed Work" className="w-full h-32 object-cover rounded-xl mb-4 opacity-50 grayscale" />
            )}
            <CheckCircle size={40} className="text-[#1FA2A6] mb-4" />
            <h4 className="text-xl font-bold mb-2">Saved Permanently</h4>
            <p className="text-slate-400 text-xs mb-6">Your progress for {result.subject} has been updated.</p>
            <button onClick={() => setState('IDLE')} className="w-full py-3 bg-[#1FA2A6] rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#198d91] transition-all">
              Next Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1E3A5F]">Evaluate Work</h2>
        <p className="text-slate-500 mt-2">Upload a photo for instant subject-agnostic intelligence.</p>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Context</label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="e.g. World History, Algebra II, Biology..." 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1FA2A6]/20 transition-all font-medium"
            />
          </div>
        </div>

        <label className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl transition-all group ${!subject ? 'opacity-50 cursor-not-allowed border-slate-100' : 'cursor-pointer border-slate-200 hover:bg-slate-50 hover:border-[#1FA2A6]'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className={`p-5 rounded-3xl mb-4 transition-all ${!subject ? 'bg-slate-50 text-slate-200' : 'bg-slate-100 text-slate-400 group-hover:text-[#1FA2A6] group-hover:bg-[#1FA2A6]/10'}`}>
              <Camera size={40} />
            </div>
            <p className="mb-2 text-sm text-slate-600 font-bold uppercase tracking-widest">
              {!subject ? 'Context Required First' : 'Click to Capture or Upload'}
            </p>
            <p className="text-xs text-slate-400 font-medium italic">Handwritten essays, diagrams, or math problems.</p>
          </div>
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={!subject} />
        </label>
      </div>
    </div>
  );
};

const VaneIcon = ({ color, size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    <path d="M50 5L90 95L50 75L10 95L50 5Z" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 5V75" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);
