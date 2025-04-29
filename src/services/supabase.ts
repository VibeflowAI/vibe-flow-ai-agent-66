
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { MoodType, EnergyLevel, MoodEntry } from '@/agents/mood/types';

// Auth services
export const authService = {
  getCurrentSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },
  
  signInWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  
  signUp: async (email: string, password: string, metadata: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  updateUserProfile: async (userData: Partial<User>) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    if (error) throw error;
    return data;
  }
};

// Mood services
export const moodService = {
  recordMood: async (userId: string, moodData: { mood: MoodType, energy: EnergyLevel, note?: string }): Promise<MoodEntry> => {
    try {
      const { data, error } = await supabase
        .from('moods')
        .insert({
          user_id: userId,
          mood: moodData.mood,
          energy: moodData.energy,
          note: moodData.note,
          timestamp: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      
      // Log the mood recording
      await logService.createLog(userId, 'mood_recorded', { 
        mood: moodData.mood, 
        energy: moodData.energy 
      });
      
      return {
        ...data[0],
        mood: data[0].mood as MoodType,
        energy: data[0].energy as EnergyLevel
      };
    } catch (error) {
      console.error('Error recording mood:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to record mood',
        description: 'There was an error saving your mood. Please try again.'
      });
      throw error;
    }
  },
  
  getMoodHistory: async (userId: string): Promise<MoodEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        mood: item.mood as MoodType,
        energy: item.energy as EnergyLevel
      }));
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  },
  
  getRecentMood: async (userId: string): Promise<MoodEntry | null> => {
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data.length === 0) return null;
      
      return {
        ...data[0],
        mood: data[0].mood as MoodType,
        energy: data[0].energy as EnergyLevel
      };
    } catch (error) {
      console.error('Error getting recent mood:', error);
      return null;
    }
  }
};

// Recommendations service
export const recommendationsService = {
  getRecommendations: async (mood?: string, energy?: string) => {
    try {
      let query = supabase.from('recommendations').select('*');
      
      if (mood) {
        query = query.contains('mood_types', [mood]);
      }
      
      if (energy) {
        query = query.contains('energy_levels', [energy]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },
  
  recordFeedback: async (userId: string, recommendationId: string, isPositive: boolean) => {
    try {
      // Log the recommendation feedback
      await logService.createLog(userId, 'recommendation_feedback', { 
        recommendation_id: recommendationId,
        feedback: isPositive ? 'positive' : 'negative'
      });
      
      return true;
    } catch (error) {
      console.error('Error recording feedback:', error);
      return false;
    }
  }
};

// Logging service
export interface LogData {
  user_id: string;
  event_type: string;
  event_data?: Record<string, any>;
  created_at?: string;
}

export const logService = {
  createLog: async (userId: string, eventType: string, eventData: Record<string, any> = {}) => {
    try {
      const { error } = await supabase
        .from('logs')
        .insert({
          user_id: userId,
          event_type: eventType,
          event_data: eventData
        });
        
      if (error) {
        console.error('Error creating log:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating log:', error);
      return false;
    }
  },
  
  getLogs: async (userId: string, eventType?: string) => {
    try {
      let query = supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId);
        
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }
};

// Profile service
export const profileService = {
  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },
  
  updateProfile: async (userId: string, profileData: Record<string, any>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: 'There was an error updating your profile. Please try again.'
      });
      throw error;
    }
  }
};

export default {
  auth: authService,
  mood: moodService,
  recommendations: recommendationsService,
  logs: logService,
  profile: profileService
};
