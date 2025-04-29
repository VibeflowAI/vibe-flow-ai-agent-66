
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MoodAgentHookResult, MoodState } from './types';
import { MoodType, EnergyLevel, MoodEntry } from '@/types/database';
import { logService, moodService } from '@/services/supabase';

export function useMoodAgent(userId: string): MoodAgentHookResult {
  const [moodState, setMoodState] = useState<MoodState>({
    currentMood: null,
    moodHistory: [],
    isLoading: false,
    error: null,
  });

  // Fetch initial mood data
  useEffect(() => {
    if (!userId) return;
    
    const fetchMoodData = async () => {
      setMoodState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const moodHistory = await moodService.getMoodHistory(userId);
        const currentMood = moodHistory.length > 0 ? moodHistory[0] : null;
        
        setMoodState({
          currentMood,
          moodHistory,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching mood data:', error);
        setMoodState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load mood data' 
        }));
      }
    };

    fetchMoodData();
  }, [userId]);

  // Record a new mood entry
  const recordMood = async (mood: MoodType, energy: EnergyLevel, note?: string) => {
    if (!userId) {
      setMoodState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    setMoodState(prev => ({ ...prev, isLoading: true }));

    try {
      const newMoodEntry = await moodService.recordMood(userId, { mood, energy, note });
      
      // Add the new entry to the state
      setMoodState(prev => ({
        currentMood: newMoodEntry,
        moodHistory: [newMoodEntry, ...prev.moodHistory],
        isLoading: false,
        error: null,
      }));

      // Log the mood recording
      await logService.createLog(userId, 'mood_recorded', { mood, energy, note });
      
      toast({
        title: 'Mood recorded',
        description: `Your ${mood} mood has been saved.`,
      });
      
      return;
    } catch (error) {
      console.error('Error recording mood:', error);
      setMoodState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to record mood' 
      }));
      
      toast({
        variant: 'destructive',
        title: 'Failed to record mood',
        description: 'There was an error saving your mood. Please try again.',
      });
    }
  };

  // Get mood history
  const getMoodHistory = async (): Promise<MoodEntry[]> => {
    if (!userId) {
      setMoodState(prev => ({ ...prev, error: 'User not authenticated' }));
      return [];
    }

    try {
      const moodHistory = await moodService.getMoodHistory(userId);
      setMoodState(prev => ({ ...prev, moodHistory }));
      return moodHistory;
    } catch (error) {
      console.error('Error fetching mood history:', error);
      setMoodState(prev => ({ 
        ...prev, 
        error: 'Failed to load mood history' 
      }));
      return [];
    }
  };

  // Get current mood
  const getCurrentMood = (): MoodEntry | null => {
    return moodState.currentMood;
  };

  // Clear error
  const clearError = () => {
    setMoodState(prev => ({ ...prev, error: null }));
  };

  return {
    moodState,
    recordMood,
    getMoodHistory,
    getCurrentMood,
    clearError,
  };
}
