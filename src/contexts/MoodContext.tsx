
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

// Types
export type MoodEntry = {
  id: string;
  mood: MoodType;
  energy: EnergyLevel;
  note?: string;
  timestamp: string;
};

export type MoodType = 'happy' | 'calm' | 'tired' | 'stressed' | 'sad';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type Recommendation = {
  id: string;
  category: 'food' | 'activity' | 'mindfulness';
  title: string;
  description: string;
  imageUrl?: string;
  moodTarget: MoodType;
  energyTarget: EnergyLevel;
  timestamp: string;
};

type MoodContextType = {
  currentMood: MoodEntry | null;
  moodHistory: MoodEntry[];
  recommendations: Recommendation[];
  isLoading: boolean;
  logMood: (mood: MoodType, energy: EnergyLevel, note?: string) => Promise<void>;
  getRecommendations: () => Promise<void>;
  moodDescriptions: Record<MoodType, string>;
  moodEmojis: Record<MoodType, string>;
  energyDescriptions: Record<EnergyLevel, string>;
};

// Sample data
const SAMPLE_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    category: 'food',
    title: 'Green Smoothie Bowl',
    description: 'A nutritious smoothie bowl with spinach, banana, and chia seeds to boost your energy.',
    imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'tired',
    energyTarget: 'low',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    category: 'activity',
    title: 'Quick Yoga Session',
    description: '15-minute gentle yoga flow to reduce stress and improve mindfulness.',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'stressed',
    energyTarget: 'medium',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    category: 'mindfulness',
    title: 'Guided Meditation',
    description: '10-minute guided meditation to calm your mind and reduce anxiety.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'stressed',
    energyTarget: 'high',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    category: 'food',
    title: 'Dark Chocolate',
    description: 'A small piece of dark chocolate can help boost your mood with antioxidants and small caffeine content.',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4d42bea34801?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'sad',
    energyTarget: 'low',
    timestamp: new Date().toISOString(),
  },
  {
    id: '5',
    category: 'activity',
    title: 'Dance Break',
    description: '5-minute dance to your favorite upbeat songs to elevate your mood and energy.',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'sad',
    energyTarget: 'medium',
    timestamp: new Date().toISOString(),
  },
  {
    id: '6',
    category: 'mindfulness',
    title: 'Gratitude Journaling',
    description: 'Write down 3 things you're grateful for to shift perspective and improve mood.',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'sad',
    energyTarget: 'low',
    timestamp: new Date().toISOString(),
  },
  {
    id: '7',
    category: 'food',
    title: 'Herbal Tea',
    description: 'Chamomile or lavender tea can help you relax and prepare for sleep.',
    imageUrl: 'https://images.unsplash.com/photo-1563911892437-54c777ba9227?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'calm',
    energyTarget: 'low',
    timestamp: new Date().toISOString(),
  },
  {
    id: '8',
    category: 'activity',
    title: 'High-Intensity Interval Training',
    description: '20-minute HIIT workout to boost energy and endorphins.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60',
    moodTarget: 'happy',
    energyTarget: 'high',
    timestamp: new Date().toISOString(),
  },
];

// Helper data
const MOOD_DESCRIPTIONS = {
  happy: 'Feeling joy, contentment, or excitement',
  calm: 'Feeling peaceful, relaxed, or at ease',
  tired: 'Feeling fatigued, low energy, or sleepy',
  stressed: 'Feeling anxious, overwhelmed, or tense',
  sad: 'Feeling down, discouraged, or blue'
};

const MOOD_EMOJIS = {
  happy: '😊',
  calm: '😌',
  tired: '😴',
  stressed: '😰',
  sad: '😢'
};

const ENERGY_DESCRIPTIONS = {
  low: 'Minimal energy, prefer rest',
  medium: 'Moderate energy for light activity',
  high: 'Energized and ready for challenge'
};

// Create context
export const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Provider component
export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load mood data from localStorage when user changes
  useEffect(() => {
    if (user) {
      // Load mood history from localStorage
      const storedMoodHistory = localStorage.getItem(`vibeflow_mood_history_${user.id}`);
      if (storedMoodHistory) {
        const parsedHistory = JSON.parse(storedMoodHistory) as MoodEntry[];
        setMoodHistory(parsedHistory);
        
        // Set current mood as the most recent entry if it's from today
        const todayEntries = parsedHistory.filter(entry => {
          const entryDate = new Date(entry.timestamp).toDateString();
          const todayDate = new Date().toDateString();
          return entryDate === todayDate;
        });
        
        if (todayEntries.length > 0) {
          setCurrentMood(todayEntries[0]);
        }
      }
    } else {
      // Clear data when user logs out
      setCurrentMood(null);
      setMoodHistory([]);
      setRecommendations([]);
    }
  }, [user]);

  // Log a new mood entry
  const logMood = async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    if (!user) return Promise.reject(new Error('User not authenticated'));
    
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMoodEntry: MoodEntry = {
        id: Date.now().toString(),
        mood,
        energy,
        note,
        timestamp: new Date().toISOString()
      };
      
      // Update current mood
      setCurrentMood(newMoodEntry);
      
      // Update mood history
      const updatedHistory = [newMoodEntry, ...moodHistory];
      setMoodHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem(
        `vibeflow_mood_history_${user.id}`,
        JSON.stringify(updatedHistory)
      );
      
      // Generate recommendations based on new mood
      await getRecommendations();
      
      toast({
        title: 'Mood logged!',
        description: `Your ${mood} mood has been recorded.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error logging mood',
        description: error instanceof Error ? error.message : 'Failed to log mood'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get personalized recommendations based on current mood
  const getRecommendations = async () => {
    if (!user || !currentMood) return Promise.resolve();
    
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter recommendations based on current mood and energy
      const filteredRecommendations = SAMPLE_RECOMMENDATIONS.filter(rec => 
        rec.moodTarget === currentMood.mood || 
        rec.energyTarget === currentMood.energy
      );
      
      // If no direct matches, return general recommendations
      const newRecommendations = filteredRecommendations.length > 0
        ? filteredRecommendations
        : SAMPLE_RECOMMENDATIONS.slice(0, 3);
      
      setRecommendations(newRecommendations);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error getting recommendations',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to get recommendations'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentMood,
    moodHistory,
    recommendations,
    isLoading,
    logMood,
    getRecommendations,
    moodDescriptions: MOOD_DESCRIPTIONS,
    moodEmojis: MOOD_EMOJIS,
    energyDescriptions: ENERGY_DESCRIPTIONS
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
