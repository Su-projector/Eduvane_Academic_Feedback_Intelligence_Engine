
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/standalone/LandingPage.tsx';
import { Dashboard } from './components/standalone/Dashboard.tsx';
import { UploadFlow } from './components/standalone/UploadFlow.tsx';
import { PracticeFlow } from './components/standalone/PracticeFlow.tsx';
import { HistoryView } from './components/standalone/HistoryView.tsx';
import { VaneIcon } from './constants.tsx';
import { Submission, PracticeSet, UserProfile } from './types.ts';
import { SupabaseService, supabase } from './services/SupabaseService.ts';
import { LogOut, User as UserIcon, Loader2, Info } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'UPLOAD' | 'PRACTICE' | 'HISTORY'>('DASHBOARD');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [routeParams, setRouteParams] = useState<{ subject?: string; topic?: string }>({});

  useEffect(() => {
    const initAuth = async () => {
      if (SupabaseService.isConfigured()) {
        const { data: { session: currentSession } } = await supabase!.auth.getSession();
        setSession(currentSession);
        if (currentSession) await fetchUserData(currentSession.user.id);
        else setLoading(false);

        const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          if (newSession) fetchUserData(newSession.user.id);
          else {
            setProfile(null);
            setLoading(false);
          }
        });
        return () => subscription.unsubscribe();
      } else {
        // No Supabase config, stay in guest potential mode
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const [subs, sets, prof] = await Promise.all([
        SupabaseService.submissions.list(userId),
        SupabaseService.practice.list(userId),
        SupabaseService.profile.get(userId)
      ]);
      setSubmissions(subs);
      setPracticeSets(sets);
      setProfile(prof || { id: userId, email: session?.user?.email || (isGuest ? 'guest@eduvane.local' : ''), xp_total: 0 });
    } catch (e) {
      console.error("Error fetching user data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestStart = (initialView: 'DASHBOARD' | 'UPLOAD' | 'PRACTICE' = 'DASHBOARD') => {
    setIsGuest(true);
    setView(initialView);
    fetchUserData('GUEST_USER');
  };

  const handleStart = (initialView: 'DASHBOARD' | 'UPLOAD' | 'PRACTICE' = 'DASHBOARD') => {
    if (SupabaseService.isConfigured()) {
      SupabaseService.auth.signIn();
    } else {
      handleGuestStart(initialView);
    }
  };

  const currentUserId = session?.user?.id || 'GUEST_USER';

  const saveSubmission = async (sub: Submission) => {
    await SupabaseService.submissions.save(currentUserId, sub);
    setSubmissions([sub, ...submissions]);
  };

  const savePracticeSet = async (set: PracticeSet) => {
    await SupabaseService.practice.save(currentUserId, set);
    setPracticeSets([set, ...practiceSets]);
  };

  const handleCommand = (intent: string, subject?: string, topic?: string) => {
    setRouteParams({ subject, topic });
    if (intent === 'PRACTICE') setView('PRACTICE');
    else if (intent === 'ANALYZE') setView('UPLOAD');
    else if (intent === 'HISTORY') setView('HISTORY');
  };

  if (!session && !isGuest) {
    return (
      <LandingPage 
        onStart={(intent) => handleStart(intent)} 
        onGuest={() => handleGuestStart()} 
      />
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
      <Loader2 className="animate-spin text-[#1FA2A6]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      {(!SupabaseService.isConfigured() || isGuest) && (
        <div className="bg-[#F2A900] text-[#1E3A5F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Info size={14} /> Guest Mode: Data is saved locally in this browser only.
        </div>
      )}
      
      <header className="bg-[#1E3A5F] text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('DASHBOARD'); setRouteParams({}); }}>
            <VaneIcon color="#1FA2A6" size={32} />
            <h1 className="text-xl font-bold tracking-tight">EDUVANE</h1>
          </div>
          <nav className="flex items-center gap-6">
            <button onClick={() => setView('UPLOAD')} className={`text-xs font-bold uppercase tracking-widest ${view === 'UPLOAD' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Evaluate</button>
            <button onClick={() => setView('PRACTICE')} className={`text-xs font-bold uppercase tracking-widest ${view === 'PRACTICE' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Practice</button>
            <button onClick={() => setView('HISTORY')} className={`text-xs font-bold uppercase tracking-widest ${view === 'HISTORY' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Progress</button>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-[#1FA2A6] px-2 py-0.5 rounded text-white">{profile?.xp_total || 0} XP</span>
              <button onClick={() => SupabaseService.auth.signOut()} className="text-slate-400 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        {view === 'DASHBOARD' && (
          <Dashboard 
            onAction={setView} 
            onCommand={handleCommand}
            submissions={submissions} 
            profile={profile} 
          />
        )}
        {view === 'UPLOAD' && (
          <UploadFlow 
            userId={currentUserId}
            initialSubject={routeParams.subject}
            onComplete={saveSubmission} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
        {view === 'PRACTICE' && (
          <PracticeFlow 
            initialSubject={routeParams.subject}
            initialTopic={routeParams.topic}
            onSave={savePracticeSet} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
        {view === 'HISTORY' && (
          <HistoryView 
            submissions={submissions} 
            practiceSets={practiceSets} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
      </main>

      <footer className="p-6 text-center text-[10px] text-slate-400 font-mono tracking-widest uppercase border-t border-slate-200 bg-white">
        Standalone MVP | Persistent Learning Loop
      </footer>
    </div>
  );
};

export default App;
