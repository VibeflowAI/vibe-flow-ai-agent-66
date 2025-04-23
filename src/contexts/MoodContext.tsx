
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth, User } from './AuthContext';

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

// Mock recommendations data
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

  // Load mood history from localStorage when user changes
  React.useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`vibeflow_mood_${user.id}`);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setMoodHistory(parsedHistory);
        setCurrentMood(parsedHistory[0] || null);
      }
    } else {
      setMoodHistory([]);
      setCurrentMood(null);
    }
  }, [user]);

  // Log a new mood entry
  const logMood = useCallback(async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    if (!user) return Promise.reject(new Error('User not authenticated'));
    
    setIsLoading(true);
    
    try {
      // Create new mood entry
      const newMoodEntry: MoodEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mood,
        energy,
        note
      };
      
      // Update state
      const updatedHistory = [newMoodEntry, ...moodHistory];
      setCurrentMood(newMoodEntry);
      setMoodHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem(`vibeflow_mood_${user.id}`, JSON.stringify(updatedHistory));
      
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
  const getRecommendationsForMood = (moodEntry: MoodEntry) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filteredRecommendations = MOCK_RECOMMENDATIONS.filter(rec => 
        rec.moodTypes.includes(moodEntry.mood) && 
        rec.energyLevels.includes(moodEntry.energy)
      );
      
      // If no recommendations match exactly, return some defaults
      const recommendationsToShow = filteredRecommendations.length > 0 
        ? filteredRecommendations 
        : MOCK_RECOMMENDATIONS.slice(0, 3);
        
      setRecommendations(recommendationsToShow);
      setIsLoading(false);
    }, 1000);
  };

  // Get recommendations (to be called from outside)
  const getRecommendations = useCallback(() => {
    if (currentMood) {
      getRecommendationsForMood(currentMood);
    }
  }, [currentMood]);

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
