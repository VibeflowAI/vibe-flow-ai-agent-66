
// Types related to mood tracking and recommendations
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

export type MoodContextType = {
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
