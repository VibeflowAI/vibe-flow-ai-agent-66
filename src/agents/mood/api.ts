
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodType, EnergyLevel } from './types';

export async function fetchMoodHistory(userId: string): Promise<MoodEntry[]> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching mood history:', error);
    throw error;
  }
  
  return data;
}

export async function createMoodEntry(
  userId: string, 
  mood: MoodType, 
  energy: EnergyLevel, 
  note?: string
): Promise<MoodEntry> {
  if (!userId) throw new Error('User ID is required');
  
  const moodData = {
    user_id: userId,
    mood,
    energy,
    note,
    timestamp: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('moods')
    .insert(moodData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating mood entry:', error);
    throw error;
  }
  
  return data;
}

export async function deleteMoodEntry(moodId: string): Promise<void> {
  if (!moodId) throw new Error('Mood ID is required');
  
  const { error } = await supabase
    .from('moods')
    .delete()
    .eq('id', moodId);
    
  if (error) {
    console.error('Error deleting mood entry:', error);
    throw error;
  }
}

export async function updateMoodEntry(
  moodId: string,
  updates: Partial<{ mood: MoodType, energy: EnergyLevel, note: string }>
): Promise<MoodEntry> {
  if (!moodId) throw new Error('Mood ID is required');
  
  const { data, error } = await supabase
    .from('moods')
    .update(updates)
    .eq('id', moodId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating mood entry:', error);
    throw error;
  }
  
  return data;
}
