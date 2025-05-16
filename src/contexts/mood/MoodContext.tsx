
import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  MoodType, 
  EnergyLevel, 
  MoodEntry, 
  Recommendation, 
  MoodContextType 
} from './types';
import { 
  getMoodEmojis, 
  getMoodDescriptions, 
  getEnergyDescriptions 
} from './utils';
import { 
  fetchMoodHistory, 
  ensureDefaultRecommendations, 
  fetchRecommendations 
} from './supabaseUtils';

// Create the context
export const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Provider component
export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Get description maps
  const moodEmojis = getMoodEmojis();
  const moodDescriptions = getMoodDescriptions();
  const energyDescriptions = getEnergyDescriptions();
  
  // Load mood history when user changes
  const loadMoodHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const formattedHistory = await fetchMoodHistory(user.id);
      
      setMoodHistory(formattedHistory);
      
      // Set current mood as the most recent entry
      if (formattedHistory.length > 0) {
        setCurrentMood(formattedHistory[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Initial fetch of mood history when user changes
  useEffect(() => {
    if (user) {
      loadMoodHistory();
    } else {
      setMoodHistory([]);
      setCurrentMood(null);
    }
  }, [user, loadMoodHistory]);

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
        // Wait a short delay to ensure the DB operation completes
        setTimeout(() => {
          loadMoodHistory();
        }, 1000);
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
        return;
      }
      
      const recommendationsData = await fetchRecommendations(moodToUse, user.id);
      setRecommendations(recommendationsData);
    } finally {
      setIsLoading(false);
    }
  }, [currentMood, moodHistory, user]);
  
  // Get recommendations when current mood changes or when user changes
  useEffect(() => {
    if (user) {
      getRecommendations();
    }
  }, [user, getRecommendations]);

  // Ensure default recommendations exist on initial load
  useEffect(() => {
    if (user) {
      ensureDefaultRecommendations();
    }
  }, [user]);

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
