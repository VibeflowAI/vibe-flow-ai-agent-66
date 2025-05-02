
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Types
export type MoodType = 'happy' | 'calm' | 'tired' | 'stressed' | 'sad';
export type EnergyLevel = 'low' | 'medium' | 'high';

export type MoodEntry = {
  id: string;
  mood: MoodType;
  energy: EnergyLevel;
  note?: string;
  timestamp: number;
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: string;
  moodTypes: MoodType[];
  energyLevels: EnergyLevel[];
  imageUrl?: string;
};

type MoodContextType = {
  currentMood: MoodEntry | null;
  moodHistory: MoodEntry[];
  recommendations: Recommendation[];
  isLoading: boolean;
  logMood: (mood: MoodType, energy: EnergyLevel, note?: string) => Promise<void>;
  getRecommendations: () => void;
  moodEmojis: Record<MoodType, string>;
  moodDescriptions: Record<MoodType, string>;
  energyDescriptions: Record<EnergyLevel, string>;
};

// Create the context
export const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Provider component
export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Emoji mapping for each mood type
  const moodEmojis: Record<MoodType, string> = {
    happy: '😊',
    calm: '😌',
    tired: '😴',
    stressed: '😰',
    sad: '😞'
  };
  
  // Descriptions for each mood
  const moodDescriptions: Record<MoodType, string> = {
    happy: 'You feel joyful, content, and optimistic about your day.',
    calm: 'You feel relaxed, at peace, and mentally clear.',
    tired: 'You feel physically or mentally fatigued and need rest.',
    stressed: 'You feel overwhelmed, tense, or anxious about demands.',
    sad: 'You feel down, low in spirits, or emotionally heavy.'
  };
  
  // Descriptions for energy levels
  const energyDescriptions: Record<EnergyLevel, string> = {
    low: 'You have minimal energy, feeling drained or exhausted.',
    medium: 'You have moderate energy, able to function but not at peak.',
    high: 'You have abundant energy, feeling vibrant and ready to go.'
  };

  // Fetch mood history from Supabase
  const fetchMoodHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('id, mood, energy_level, note, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching mood history:', error);
        return;
      }
      
      if (data) {
        const formattedHistory: MoodEntry[] = data.map(entry => ({
          id: entry.id,
          mood: entry.mood as MoodType,
          energy: entry.energy_level as EnergyLevel,
          note: entry.note || undefined,
          timestamp: new Date(entry.created_at).getTime()
        }));
        
        setMoodHistory(formattedHistory);
        
        // Set current mood as the most recent entry
        if (formattedHistory.length > 0) {
          setCurrentMood(formattedHistory[0]);
        }
      }
    } catch (error) {
      console.error('Error in fetchMoodHistory:', error);
    }
  }, [user]);
  
  // Initial fetch of mood history when user changes
  useEffect(() => {
    if (user) {
      fetchMoodHistory();
    } else {
      setMoodHistory([]);
      setCurrentMood(null);
    }
  }, [user, fetchMoodHistory]);

  // Log a new mood entry
  const logMood = async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      const newEntry: MoodEntry = {
        id: `mood-${timestamp}`,
        mood,
        energy,
        note,
        timestamp
      };
      
      // Update state
      setCurrentMood(newEntry);
      setMoodHistory(prev => [newEntry, ...prev]);
      
      // After adding to database, refresh the mood history
      if (user) {
        // We're handling the Supabase insert in the MoodTracker component
        await fetchMoodHistory();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error logging mood:', error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get personalized recommendations based on current mood
  const getRecommendations = useCallback(async () => {
    if (!currentMood) return;
    
    setIsLoading(true);
    try {
      // Get recommendations from Supabase
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .contains('mood_types', [currentMood.mood])
        .contains('energy_levels', [currentMood.energy]);
      
      if (error) {
        console.error('Error fetching recommendations:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Map the snake_case fields from Supabase to camelCase for our app
        const formattedRecommendations: Recommendation[] = data.map(rec => ({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          moodTypes: rec.mood_types as MoodType[],
          energyLevels: rec.energy_levels as EnergyLevel[],
          imageUrl: rec.image_url
        }));
        
        setRecommendations(formattedRecommendations);
      } else {
        // Fallback to get any recommendations if none match the specific mood/energy
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('recommendations')
          .select('*')
          .limit(5);
          
        if (!fallbackError && fallbackData) {
          // Map the snake_case fields from Supabase to camelCase for our app
          const formattedRecommendations: Recommendation[] = fallbackData.map(rec => ({
            id: rec.id,
            title: rec.title,
            description: rec.description,
            category: rec.category,
            moodTypes: rec.mood_types as MoodType[],
            energyLevels: rec.energy_levels as EnergyLevel[],
            imageUrl: rec.image_url
          }));
          
          setRecommendations(formattedRecommendations);
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMood]);
  
  // Get recommendations when current mood changes
  useEffect(() => {
    if (currentMood) {
      getRecommendations();
    }
  }, [currentMood, getRecommendations]);

  const value = {
    currentMood,
    moodHistory,
    recommendations,
    isLoading,
    logMood,
    getRecommendations,
    moodEmojis,
    moodDescriptions,
    energyDescriptions,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

// Custom hook for using the mood context
export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
