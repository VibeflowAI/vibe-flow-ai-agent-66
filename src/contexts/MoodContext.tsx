
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
  rating?: number;
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
      
      // Update state immediately for better UX
      setCurrentMood(newEntry);
      setMoodHistory(prev => [newEntry, ...prev]);
      
      // After adding to database, refresh the mood history
      if (user) {
        // We're handling the Supabase insert in the MoodTracker component
        await fetchMoodHistory();
      }
      
      // Get recommendations based on the new mood
      await getRecommendations();
      
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
    if (!user) {
      console.log('No user available for recommendations');
      setRecommendations([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Use current mood if available, otherwise use the most recent from history
      const moodToUse = currentMood || (moodHistory.length > 0 ? moodHistory[0] : null);
      
      if (!moodToUse) {
        console.log('No mood available for recommendations');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching recommendations for mood:', moodToUse.mood, 'and energy:', moodToUse.energy);
      
      // First try to get recommendations specific to the mood and energy
      let { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .contains('mood_types', [moodToUse.mood])
        .contains('energy_levels', [moodToUse.energy]);
      
      if (error) {
        console.error('Error fetching specific recommendations:', error);
        
        // Try to get any recommendations as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('recommendations')
          .select('*')
          .limit(5);
          
        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          console.log('Using fallback recommendations');
          data = fallbackData;
        } else {
          console.error('Error fetching fallback recommendations:', fallbackError);
          setRecommendations([]);
          setIsLoading(false);
          return;
        }
      }
      
      if (data && data.length > 0) {
        console.log('Found recommendations:', data.length);
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
        console.log('No recommendations found, adding defaults');
        
        // Try to add default recommendations
        const { error: rpcError } = await supabase.rpc('add_default_recommendations');
        
        if (rpcError) {
          console.error('Error adding default recommendations:', rpcError);
        } else {
          // Try fetching recommendations again after adding defaults
          const { data: newData, error: newError } = await supabase
            .from('recommendations')
            .select('*')
            .limit(5);
            
          if (!newError && newData && newData.length > 0) {
            const formattedRecommendations: Recommendation[] = newData.map(rec => ({
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
            // Use hardcoded defaults as last resort
            setRecommendations([
              {
                id: 'default-1',
                title: 'Take a short walk',
                description: 'Even a 10-minute walk can boost your mood and energy levels.',
                category: 'activity',
                moodTypes: ['tired', 'stressed', 'sad'],
                energyLevels: ['low', 'medium']
              },
              {
                id: 'default-2',
                title: 'Drink water',
                description: 'Staying hydrated is essential for maintaining energy levels.',
                category: 'food',
                moodTypes: ['tired'],
                energyLevels: ['low', 'medium', 'high']
              },
              {
                id: 'default-3',
                title: 'Deep breathing exercise',
                description: 'Take 5 deep breaths, inhaling for 4 counts and exhaling for 6.',
                category: 'mindfulness',
                moodTypes: ['stressed', 'sad'],
                energyLevels: ['low', 'medium', 'high']
              }
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMood, moodHistory, user]);
  
  // Get recommendations when current mood changes or when user changes
  useEffect(() => {
    if (user) {
      getRecommendations();
    }
  }, [user, currentMood, getRecommendations]);

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
