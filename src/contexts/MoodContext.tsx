
import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth, User } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Types
export type MoodType = 'happy' | 'calm' | 'tired' | 'stressed' | 'sad';
export type EnergyLevel = 'low' | 'medium' | 'high';

export type MoodEntry = {
  id: string;
  timestamp: number;
  mood: MoodType;
  energy: EnergyLevel;
  note?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'activity' | 'mindfulness';
  imageUrl?: string;
  moodTypes: MoodType[];
  energyLevels: EnergyLevel[];
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

// Create context
export const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Mock recommendations data (will be replaced by Supabase data in production)
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Morning Smoothie Bowl',
    description: 'Start your day with a nutritious smoothie bowl topped with fresh fruits and granola.',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&q=80&w=2013&ixlib=rb-4.0.3',
    moodTypes: ['tired', 'sad'],
    energyLevels: ['low', 'medium'],
  },
  {
    id: '2',
    title: 'Gentle Yoga Session',
    description: 'A 15-minute gentle yoga session to help you relax and recharge.',
    category: 'activity',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
    moodTypes: ['stressed', 'tired'],
    energyLevels: ['low', 'medium'],
  },
  {
    id: '3',
    title: 'Guided Meditation',
    description: 'A 10-minute guided meditation to help clear your mind and reduce stress.',
    category: 'mindfulness',
    imageUrl: 'https://images.unsplash.com/photo-1474418397713-2f1761efc8d4?auto=format&fit=crop&q=80&w=2036&ixlib=rb-4.0.3',
    moodTypes: ['stressed', 'sad'],
    energyLevels: ['low', 'medium', 'high'],
  },
  {
    id: '4',
    title: 'High-Energy Workout',
    description: 'A quick high-intensity workout to boost your energy and mood.',
    category: 'activity',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
    moodTypes: ['happy', 'calm'],
    energyLevels: ['medium', 'high'],
  },
  {
    id: '5',
    title: 'Veggie-Packed Meal',
    description: 'A colorful, nutrient-dense meal filled with seasonal vegetables.',
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
    moodTypes: ['happy', 'calm', 'tired'],
    energyLevels: ['medium', 'high'],
  },
  {
    id: '6',
    title: 'Gratitude Journaling',
    description: "Take a few minutes to write down things you're grateful for to shift your perspective.",
    category: 'mindfulness',
    imageUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=2068&ixlib=rb-4.0.3',
    moodTypes: ['sad', 'stressed'],
    energyLevels: ['low', 'medium'],
  },
];

// Provider component
export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper objects for UI
  const moodEmojis = {
    happy: '😊',
    calm: '😌',
    tired: '😴',
    stressed: '😓',
    sad: '😞'
  };

  const moodDescriptions = {
    happy: 'Feeling positive and optimistic',
    calm: 'Feeling peaceful and centered',
    tired: 'Feeling low on energy',
    stressed: 'Feeling tense and overwhelmed',
    sad: 'Feeling down or blue'
  };

  const energyDescriptions = {
    low: 'Minimal energy available',
    medium: 'Moderate energy levels',
    high: 'Full of energy and ready to go'
  };

  // Fetch mood history from Supabase when user changes
  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (!user) {
        setMoodHistory([]);
        setCurrentMood(null);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch mood data from Supabase
        const { data, error } = await supabase
          .from('moods')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
          
        if (error) {
          console.error('Error fetching mood history:', error);
          toast({
            variant: 'destructive',
            title: 'Failed to load mood history',
            description: error.message,
          });
          return;
        }
        
        // Format the data
        const formattedData = data.map(entry => ({
          id: entry.id,
          timestamp: new Date(entry.timestamp).getTime(),
          mood: entry.mood as MoodType,
          energy: entry.energy as EnergyLevel,
          note: entry.note || undefined,
        }));
        
        setMoodHistory(formattedData);
        if (formattedData.length > 0) {
          setCurrentMood(formattedData[0]);
        }
      } catch (error) {
        console.error('Failed to fetch mood history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodHistory();
  }, [user]);

  // Log a new mood entry
  const logMood = useCallback(async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    if (!user) return Promise.reject(new Error('User not authenticated'));
    
    setIsLoading(true);
    
    try {
      // Create new mood entry
      const newMoodEntry: MoodEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        mood,
        energy,
        note
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('moods')
        .insert({
          user_id: user.id,
          mood,
          energy,
          note,
          timestamp: new Date().toISOString(),
        });
        
      if (error) {
        throw error;
      }
      
      // Update state
      const updatedHistory = [newMoodEntry, ...moodHistory];
      setCurrentMood(newMoodEntry);
      setMoodHistory(updatedHistory);
      
      toast({
        title: 'Mood logged',
        description: `Your ${mood} mood has been recorded.`,
      });
      
      // Get recommendations based on the new mood
      getRecommendationsForMood(newMoodEntry);
      
      return Promise.resolve();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to log mood',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  }, [moodHistory, user]);

  // Get recommendations based on current mood and energy level
  const getRecommendationsForMood = useCallback(async (moodEntry: MoodEntry) => {
    setIsLoading(true);
    
    try {
      // Fetch recommendations from Supabase
      const { data, error } = await supabase
        .from('recommendations')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Filter recommendations based on mood and energy
        const filteredRecommendations = data.filter((rec) => 
          rec.mood_types.includes(moodEntry.mood) && 
          rec.energy_levels.includes(moodEntry.energy)
        ).map(rec => ({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          category: rec.category as 'food' | 'activity' | 'mindfulness',
          imageUrl: rec.image_url || undefined,
          moodTypes: rec.mood_types as MoodType[],
          energyLevels: rec.energy_levels as EnergyLevel[],
        }));
        
        if (filteredRecommendations.length > 0) {
          setRecommendations(filteredRecommendations);
        } else {
          // Fallback to mock data if no matching recommendations
          setRecommendations(MOCK_RECOMMENDATIONS.slice(0, 3));
        }
      } else {
        // Fallback to mock data if API returns no data
        setRecommendations(MOCK_RECOMMENDATIONS);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Fallback to mock recommendations in case of error
      setRecommendations(MOCK_RECOMMENDATIONS.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get recommendations (to be called from outside)
  const getRecommendations = useCallback(() => {
    if (currentMood) {
      getRecommendationsForMood(currentMood);
    }
  }, [currentMood, getRecommendationsForMood]);

  const value = {
    currentMood,
    moodHistory,
    recommendations,
    isLoading,
    logMood,
    getRecommendations,
    moodEmojis,
    moodDescriptions,
    energyDescriptions
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

// Custom hook for using mood context
export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
