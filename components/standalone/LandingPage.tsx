
import React from 'react';
import { VaneIcon } from '../../constants.tsx';
import { Upload, Sparkles, ArrowRight, LogIn, Play } from 'lucide-react';

interface LandingPageProps {
  onStart: (intent: 'DASHBOARD' | 'UPLOAD' | 'PRACTICE') => void;
  onGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onGuest }) => {
  return (
    <div className="min-h-screen bg-[#1E3A5F] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="mb-12 animate-in fade-in zoom-in duration-1000">
        <VaneIcon size={100} color="#1FA2A6" />
      </div>
      
      <div className="max-w-4xl space-y-6 mb-20">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">EDUVANE</h1>
        <p className="text-2xl md:text-3xl font-light text-[#1FA2A6] italic font-serif opacity-80">
          Agnostic Learning Intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
        <button 
          onClick={() => onStart('UPLOAD')}
          className="group bg-white text-[#1E3A5F] p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col items-center gap-10 transition-all hover:scale-[1.02] border-b-[16px] border-slate-200"
        >
          <div className="bg-[#1FA2A6]/10 p-10 rounded-[2.5rem] text-[#1FA2A6] group-hover:rotate-6 transition-transform">
            <Upload size={72} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-4xl uppercase tracking-tighter">Snap Work</h3>
            <p className="text-slate-500 mt-4 font-medium text-lg leading-relaxed">
              Immediate feedback & diagnostics.<br/>No subject lock-in required.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#1FA2A6] text-white px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl group-hover:bg-[#198d91] transition-all">
            START EVALUATION <ArrowRight size={20} />
          </div>
        </button>

        <button 
          onClick={() => onStart('PRACTICE')}
          className="group bg-[#1FA2A6] text-white p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(31,162,166,0.3)] flex flex-col items-center gap-10 transition-all hover:scale-[1.02] border-b-[16px] border-[#198d91]"
        >
          <div className="bg-white/20 p-10 rounded-[2.5rem] text-white group-hover:-rotate-6 transition-transform">
            <Sparkles size={72} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-4xl uppercase tracking-tighter text-white">Command Gen</h3>
            <p className="text-white/80 mt-4 font-medium text-lg leading-relaxed">
              Synthesize rigorous practice items.<br/>Any subject, any concept.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white text-[#1FA2A6] px-12 py-5 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl transition-all">
            OPEN CORE <ArrowRight size={20} />
          </div>
        </button>
      </div>

      <div className="mt-24 flex flex-col items-center gap-12">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <button 
            onClick={() => onStart('DASHBOARD')}
            className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/20 px-12 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-inner"
          >
            <LogIn size={20} className="text-[#1FA2A6]" /> Sign Up / Sign In
          </button>
          
          <div className="hidden md:block h-12 w-px bg-white/10"></div>

          <button 
            onClick={onGuest}
            className="group text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.5em] flex items-center gap-4"
          >
            <Play size={20} className="fill-slate-500 group-hover:fill-white" /> Continue as Guest
          </button>
        </div>
        
        <p className="text-[10px] text-slate-600 font-mono tracking-[0.8em] uppercase opacity-40">
          Standalone MVP Intelligence • Spec V1.2
        </p>
      </div>
    </div>
  );
};
