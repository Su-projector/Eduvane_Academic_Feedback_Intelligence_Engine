
import { createClient } from '@supabase/supabase-js';
import { Submission, PracticeSet, UserProfile } from '../types.ts';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Only initialize Supabase if configuration is present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

const guestStorage = {
  submissions: 'eduvane_guest_submissions',
  practice: 'eduvane_guest_practice',
  profile: 'eduvane_guest_profile'
};

export const SupabaseService = {
  isConfigured: () => !!supabase,

  auth: {
    signIn: async () => {
      if (!supabase) return;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    },
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      else window.location.reload();
    }
  },

  profile: {
    get: async (userId: string): Promise<UserProfile | null> => {
      if (!supabase) {
        const stored = localStorage.getItem(guestStorage.profile);
        return stored ? JSON.parse(stored) : null;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data;
    },
    upsert: async (profile: UserProfile) => {
      if (!supabase) {
        localStorage.setItem(guestStorage.profile, JSON.stringify(profile));
        return;
      }
      await supabase.from('profiles').upsert(profile);
    }
  },

  submissions: {
    list: async (userId: string): Promise<Submission[]> => {
      if (!supabase) {
        const stored = localStorage.getItem(guestStorage.submissions);
        return stored ? JSON.parse(stored) : [];
      }
      const { data } = await supabase.from('submissions').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      return data || [];
    },
    save: async (userId: string, sub: Submission) => {
      if (!supabase) {
        const current = await SupabaseService.submissions.list(userId);
        localStorage.setItem(guestStorage.submissions, JSON.stringify([sub, ...current]));
        return;
      }
      await supabase.from('submissions').insert({ ...sub, user_id: userId });
    }
  },

  practice: {
    list: async (userId: string): Promise<PracticeSet[]> => {
      if (!supabase) {
        const stored = localStorage.getItem(guestStorage.practice);
        return stored ? JSON.parse(stored) : [];
      }
      const { data } = await supabase.from('practice_sets').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      return data || [];
    },
    save: async (userId: string, set: PracticeSet) => {
      if (!supabase) {
        const current = await SupabaseService.practice.list(userId);
        localStorage.setItem(guestStorage.practice, JSON.stringify([set, ...current]));
        return;
      }
      await supabase.from('practice_sets').insert({ ...set, user_id: userId });
    }
  },

  storage: {
    upload: async (userId: string, base64: string): Promise<string> => {
      if (!supabase) return `data:image/jpeg;base64,${base64}`;
      const filePath = `${userId}/${Date.now()}.jpg`;
      const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(res => res.blob());
      await supabase.storage.from('work_uploads').upload(filePath, blob);
      const { data } = supabase.storage.from('work_uploads').getPublicUrl(filePath);
      return data.publicUrl;
    }
  }
};
