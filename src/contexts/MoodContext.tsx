
// Re-export from the new structure for backward compatibility
import { MoodContext, MoodProvider } from './mood/MoodContext';
import { useMood } from './mood/useMood';
import type { MoodType, EnergyLevel, MoodEntry, Recommendation } from './mood/types';

export { MoodContext, MoodProvider, useMood };
export type { MoodType, EnergyLevel, MoodEntry, Recommendation };
