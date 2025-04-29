
export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'tired' | 'energetic' | 'stressed' | 'neutral';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  energy: EnergyLevel;
  note?: string | null;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'activity' | 'mindfulness';
  image_url?: string | null;
  mood_types: string[];
  energy_levels: string[];
  created_at: string;
}

export interface ChatHistoryEntry {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
}

export interface LogEntry {
  id: string;
  user_id: string;
  event_type: string;
  event_data?: Record<string, any> | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  moods: MoodEntry;
  recommendations: Recommendation;
  chat_history: ChatHistoryEntry;
  logs: LogEntry;
  profiles: Profile;
}
