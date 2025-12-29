
import React, { useState } from 'react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { Submission } from '../../types.ts';
import { Loader2, CheckCircle, ArrowLeft, Lightbulb, Camera, Info } from 'lucide-react';
import { VaneIcon } from '../../constants.tsx';

interface UploadFlowProps {
  userId: string;
  onComplete: (sub: Submission) => void;
  onBack: () => void;
}

export const UploadFlow: React.FC<UploadFlowProps> = ({ userId, onComplete, onBack }) => {
  const [state, setState] = useState<'IDLE' | 'PROCESSING' | 'RESULT'>('IDLE');
  const [result, setResult] = useState<Submission | null>(null);
  const [progressMsg, setProgressMsg] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState('PROCESSING');
    setProgressMsg('Securing work signal...');
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        setProgressMsg('Uploading to vault...');
        const publicUrl = await SupabaseService.storage.upload(userId, base64);
        
        setProgressMsg('Triggering AI Orchestrator Pipeline...');
        // TRIGGER SEQUENTIAL ORCHESTRATION: Perception -> Interpretation -> Primary Reasoning
        const analysis = await AIOrchestrator.evaluateWorkFlow(base64);
        
        const submission: Submission = {
          ...analysis,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          imageUrl: publicUrl
        };
        
        await SupabaseService.submissions.save(userId, submission);
        
        setResult(submission);
        onComplete(submission);
        setState('RESULT');
      } catch (err) {
        console.error("Orchestration Pipeline Failure:", err);
        setState('IDLE');
        alert("Intelligence Core encountered an error. Check image clarity.");
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
          <h3 className="text-2xl font-bold text-[#1E3A5F]">Orchestration in Progress</h3>
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
            <ArrowLeft size={16} /> Exit Analysis
          </button>
          <div className="text-right">
            <span className="bg-[#1FA2A6]/10 text-[#1FA2A6] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {result.subject} • {result.topic}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-b-8 border-[#1FA2A6]">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="text-center">
              <div className="text-7xl font-black text-[#1FA2A6] leading-none">{result.score}</div>
              <div className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-[0.3em] mt-2">Mastery Index</div>
            </div>
            
            <div className="flex-grow space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#1FA2A6] tracking-widest">Voice of Eduvane</span>
              </div>
              <p className="text-lg text-slate-800 leading-relaxed font-medium insight-narrative">
                {result.feedback}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-[#1FA2A6]">
              <Lightbulb size={20} />
              <h4 className="font-bold text-[#1E3A5F] uppercase text-xs tracking-widest">Next Growth Actions</h4>
            </div>
            <ul className="space-y-4">
              {result.improvementSteps.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-slate-700">
                  <span className="font-black text-[#1FA2A6] bg-[#1FA2A6]/5 w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#1E3A5F] p-10 rounded-2xl text-white flex flex-col justify-center items-center text-center shadow-xl">
            <CheckCircle size={40} className="text-[#1FA2A6] mb-4" />
            <h4 className="text-xl font-bold mb-2">Diagnostic Indexed</h4>
            <p className="text-slate-400 text-xs mb-8">This analysis signal is now part of your academic growth timeline.</p>
            <button onClick={() => setState('IDLE')} className="w-full py-4 bg-[#1FA2A6] rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#198d91] transition-all">
              Evaluate Another Work
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 py-6">
      <div className="text-center">
        <h2 className="text-4xl font-black text-[#1E3A5F] tracking-tight">Immediate Evaluation</h2>
        <p className="text-slate-500 mt-2 font-medium">No context required. Upload work for agnostic diagnostic analysis.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200">
        <label className="flex flex-col items-center justify-center w-full h-96 border-4 border-dashed border-slate-100 rounded-[2.5rem] cursor-pointer hover:bg-slate-50 hover:border-[#1FA2A6]/30 transition-all group">
          <div className="flex flex-col items-center justify-center p-10">
            <div className="bg-[#1FA2A6]/5 p-10 rounded-[3rem] mb-6 text-[#1FA2A6] group-hover:scale-105 transition-transform">
              <Camera size={64} strokeWidth={1.5} />
            </div>
            <p className="mb-2 text-2xl text-[#1E3A5F] font-black uppercase tracking-tight text-center">
              Snap or Upload Signal
            </p>
            <p className="text-sm text-slate-400 text-center font-medium leading-relaxed max-w-xs">
              Handwritten notes, essays, or problems.<br />
              Intelligence inferred immediately.
            </p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
};
