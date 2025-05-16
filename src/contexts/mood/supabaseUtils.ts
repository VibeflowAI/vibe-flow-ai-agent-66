
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MoodEntry, MoodType, EnergyLevel, Recommendation } from './types';
import { deduplicateRecommendations } from './utils';

// Function to fetch mood history from Supabase
export const fetchMoodHistory = async (userId: string | undefined): Promise<MoodEntry[]> => {
  if (!userId) return [];
  
  try {
    console.log('Fetching mood history for user:', userId);
    
    const { data, error } = await supabase
      .from('mood_entries')
      .select('id, mood, energy_level, note, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching mood history:', error);
      return [];
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
      
      return formattedHistory;
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchMoodHistory:', error);
    return [];
  }
};

// Function to add default recommendations if none exist
export const ensureDefaultRecommendations = async (): Promise<void> => {
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
};

// Function to fetch recommendations based on mood and energy
export const fetchRecommendations = async (
  moodToUse: MoodEntry | null,
  userId: string | undefined
): Promise<Recommendation[]> => {
  if (!userId || !moodToUse) {
    console.log('No user or mood available for recommendations');
    return [];
  }
  
  try {
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
          toast({
            title: "Recommendation Error",
            description: "Unable to load recommendations. Please try again later.",
            variant: "destructive"
          });
          return [];
        }
      }
    }
    
    if (data && data.length > 0) {
      console.log('Found recommendations:', data.length);
      
      // Process and deduplicate the recommendations
      const deduplicated = deduplicateRecommendations(data);
      console.log(`After deduplication: ${deduplicated.length} of ${data.length} remain`);
      
      // Return the fully deduplicated recommendations
      return deduplicated;
    } else {
      console.log('No specific recommendations found, using fallbacks');
      
      // Try to get any recommendations without mood/energy filters
      const { data: generalData, error: generalError } = await supabase
        .from('recommendations')
        .select('*')
        .limit(20);
        
      if (!generalError && generalData && generalData.length > 0) {
        // Deduplicate general recommendations
        return deduplicateRecommendations(generalData);
      } else {
        // If still no recommendations, use hardcoded defaults as last resort
        const defaultRecs = [
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
        ];
        
        // Also try to add default recommendations to the database for next time
        await ensureDefaultRecommendations();
        
        return defaultRecs;
      }
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
    toast({
      title: "Error",
      description: "Failed to load recommendations. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};
