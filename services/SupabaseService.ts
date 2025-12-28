
import { createClient } from '@supabase/supabase-js';
import { Submission, PracticeSet, UserProfile } from '../types.ts';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only initialize Supabase if configuration is present to avoid load-time crashes
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Mock / Guest Mode implementation for local persistence
const guestStorage = {
  submissions: 'eduvane_guest_submissions',
  practice: 'eduvane_guest_practice',
  profile: 'eduvane_guest_profile'
};

export const SupabaseService = {
  isConfigured: () => !!supabase,

  auth: {
    signIn: async () => {
      if (!supabase) {
        console.warn("Supabase not configured. Proceeding in Guest Mode.");
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    upsert: async (profile: UserProfile) => {
      if (!supabase) {
        localStorage.setItem(guestStorage.profile, JSON.stringify(profile));
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .upsert(profile);
      if (error) throw error;
    }
  },

  submissions: {
    list: async (userId: string): Promise<Submission[]> => {
      if (!supabase) {
        const stored = localStorage.getItem(guestStorage.submissions);
        return stored ? JSON.parse(stored) : [];
      }
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    save: async (userId: string, sub: Submission) => {
      if (!supabase) {
        const current = await SupabaseService.submissions.list(userId);
        localStorage.setItem(guestStorage.submissions, JSON.stringify([sub, ...current]));
        return;
      }
      const { error } = await supabase
        .from('submissions')
        .insert({ ...sub, user_id: userId });
      if (error) throw error;
    }
  },

  practice: {
    list: async (userId: string): Promise<PracticeSet[]> => {
      if (!supabase) {
        const stored = localStorage.getItem(guestStorage.practice);
        return stored ? JSON.parse(stored) : [];
      }
      const { data, error } = await supabase
        .from('practice_sets')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    save: async (userId: string, set: PracticeSet) => {
      if (!supabase) {
        const current = await SupabaseService.practice.list(userId);
        localStorage.setItem(guestStorage.practice, JSON.stringify([set, ...current]));
        return;
      }
      const { error } = await supabase
        .from('practice_sets')
        .insert({ ...set, user_id: userId });
      if (error) throw error;
    }
  },

  storage: {
    upload: async (userId: string, base64: string): Promise<string> => {
      if (!supabase) {
        // Fallback for guest mode: return local data URI (limited but works for MVP preview)
        return `data:image/jpeg;base64,${base64}`;
      }
      const filePath = `${userId}/${Date.now()}.jpg`;
      const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(res => res.blob());
      const { error } = await supabase.storage.from('work_uploads').upload(filePath, blob);
      if (error) throw error;
      
      const { data } = supabase.storage.from('work_uploads').getPublicUrl(filePath);
      return data.publicUrl;
    }
  }
};
