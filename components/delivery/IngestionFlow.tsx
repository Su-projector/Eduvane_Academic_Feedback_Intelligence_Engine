
import React from 'react';
import { ShieldAlert, UserMinus, Lock, ArrowRight } from 'lucide-react';

export const IngestionFlow: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[#1E3A5F]">Work Ingestion Boundary</h2>
        <p className="text-slate-500">Ensuring FERPA-native pseudonymization before intelligence processing.</p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 py-8">
        <div className="flex flex-col items-center gap-3 w-40 text-center">
          <div className="w-16 h-16 bg-[#1FA2A6]/10 text-[#1FA2A6] rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldAlert size={28} />
          </div>
          <p className="text-xs font-bold text-[#1E3A5F] uppercase">Raw PII</p>
        </div>

        <ArrowRight className="hidden md:block text-slate-200" size={32} />

        <div className="flex flex-col items-center gap-3 w-40 text-center">
          <div className="w-16 h-16 bg-[#1E3A5F] text-white rounded-2xl flex items-center justify-center shadow-lg">
            <UserMinus size={28} />
          </div>
          <p className="text-xs font-bold text-[#1FA2A6] uppercase">Identity Strip</p>
        </div>

        <ArrowRight className="hidden md:block text-slate-200" size={32} />

        <div className="flex flex-col items-center gap-3 w-40 text-center">
          <div className="w-16 h-16 bg-[#2B2E34] text-white rounded-2xl flex items-center justify-center shadow-md">
            <Lock size={28} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Secure Signal</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <h4 className="font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
          Intelligence Protocol Node (Sec IV.B)
        </h4>
        <ul className="space-y-4">
          <li className="flex gap-4">
            <div className="w-5 h-5 bg-[#1FA2A6] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">1</div>
            <p className="text-xs text-slate-600 leading-relaxed">No student PII leaves the client boundary without local-first pseudonymization encryption.</p>
          </li>
          <li className="flex gap-4">
            <div className="w-5 h-5 bg-[#1FA2A6] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">2</div>
            <p className="text-xs text-slate-600 leading-relaxed">Intelligence processing is performed exclusively on anonymized numeric patterns (Signals).</p>
          </li>
          <li className="flex gap-4">
            <div className="w-5 h-5 bg-[#1FA2A6] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">3</div>
            <p className="text-xs text-slate-600 leading-relaxed">Identity re-association only occurs within the educator's validated delivery context.</p>
          </li>
        </ul>
      </div>
    </div>
  );
};
