
import { useContext } from 'react';
import { MoodContext } from './MoodContext';
import { MoodContextType } from './types';

// Custom hook for using the mood context
export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
