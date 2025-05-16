
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  getRecommendations: () => Promise<void>;
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
      setIsLoading(true);
      console.log('Fetching mood history for user:', user.id);
      
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
        console.log('Found mood history entries:', data.length);
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
    } finally {
      setIsLoading(false);
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
        // Wait a short delay to ensure the DB operation completes
        setTimeout(() => {
          fetchMoodHistory();
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

  // Function to ensure we have default recommendations if none exist
  const ensureDefaultRecommendations = useCallback(async () => {
    try {
      console.log('Calling add-default-recommendations edge function');
      // Call the edge function to add default recommendations if none exist
      const { error } = await supabase.functions.invoke('add-default-recommendations');
      
      if (error) {
        console.error('Error adding default recommendations:', error);
      } else {
        console.log('Default recommendations checked/added successfully');
      }
    } catch (error) {
      console.error('Error in ensureDefaultRecommendations:', error);
    }
  }, []);

  // Function to deduplicate recommendations
  const deduplicateRecommendations = (data: any[]): Recommendation[] => {
    if (!data || data.length === 0) return [];
    
    // Use a Map for O(1) lookup and to preserve insertion order
    const uniqueMap = new Map();
    
    // First pass - use Map to track unique IDs
    data.forEach(rec => {
      if (!uniqueMap.has(rec.id)) {
        uniqueMap.set(rec.id, rec);
      }
    });
    
    // Convert to array and map to our app's format
    return Array.from(uniqueMap.values()).map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      moodTypes: rec.mood_types as MoodType[],
      energyLevels: rec.energy_levels as EnergyLevel[],
      imageUrl: rec.image_url
    }));
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
      
      // First check if we have any recommendations at all
      const { data: countCheck, error: countError } = await supabase
        .from('recommendations')
        .select('id', { count: 'exact', head: true });
        
      if (countError || (countCheck && countCheck.length === 0)) {
        console.log('No recommendations found, adding defaults');
        await ensureDefaultRecommendations();
      }
      
      // Try to get recommendations specific to the mood and energy
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
          .limit(10);
          
        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          console.log('Using fallback recommendations');
          data = fallbackData;
        } else {
          console.error('Error fetching fallback recommendations:', fallbackError);
          
          // Try one more time after ensuring defaults are added
          await ensureDefaultRecommendations();
          
          const { data: secondAttemptData, error: secondAttemptError } = await supabase
            .from('recommendations')
            .select('*')
            .limit(10);
            
          if (!secondAttemptError && secondAttemptData && secondAttemptData.length > 0) {
            console.log('Retrieved recommendations after adding defaults');
            data = secondAttemptData;
          } else {
            console.error('Unable to retrieve any recommendations:', secondAttemptError);
            setRecommendations([]);
            toast({
              title: "Recommendation Error",
              description: "Unable to load recommendations. Please try again later.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        }
      }
      
      if (data && data.length > 0) {
        console.log('Found recommendations:', data.length);
        
        // Process and deduplicate the recommendations
        const deduplicated = deduplicateRecommendations(data);
        console.log(`After deduplication: ${deduplicated.length} of ${data.length} remain`);
        
        // Set the fully deduplicated recommendations
        setRecommendations(deduplicated);
      } else {
        console.log('No specific recommendations found, using fallbacks');
        
        // Try to get any recommendations without mood/energy filters
        const { data: generalData, error: generalError } = await supabase
          .from('recommendations')
          .select('*')
          .limit(20);
          
        if (!generalError && generalData && generalData.length > 0) {
          // Deduplicate general recommendations
          const deduplicated = deduplicateRecommendations(generalData);
          setRecommendations(deduplicated);
        } else {
          // If still no recommendations, use hardcoded defaults as last resort
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
          
          // Also try to add default recommendations to the database for next time
          await ensureDefaultRecommendations();
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations([]);
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentMood, moodHistory, user, ensureDefaultRecommendations]);
  
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
  }, [user, ensureDefaultRecommendations]);

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
