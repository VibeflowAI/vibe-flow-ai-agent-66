
export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'tired' | 'energetic' | 'stressed' | 'neutral';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  energy: EnergyLevel;
  note?: string;
  timestamp: string | number;
}

export interface MoodState {
  currentMood: MoodEntry | null;
  moodHistory: MoodEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface MoodAgentProps {
  userId: string;
  onMoodRecorded?: (mood: MoodEntry) => void;
}

export interface MoodAgentHookResult {
  moodState: MoodState;
  recordMood: (mood: MoodType, energy: EnergyLevel, note?: string) => Promise<void>;
  getMoodHistory: () => Promise<MoodEntry[]>;
  getCurrentMood: () => MoodEntry | null;
  clearError: () => void;
}
