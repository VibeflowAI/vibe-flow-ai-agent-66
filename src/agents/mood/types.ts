
import { MoodType, EnergyLevel, MoodEntry } from '@/types/database';

export { MoodType, EnergyLevel, MoodEntry };

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
