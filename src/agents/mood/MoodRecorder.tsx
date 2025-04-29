
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useMoodAgent } from './logic';
import { MoodType, EnergyLevel } from './types';
import { Loader } from 'lucide-react';

const moodEmojis: Record<MoodType, string> = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  anxious: '😰',
  tired: '😴',
  energetic: '⚡',
  stressed: '😖',
  neutral: '😐',
};

const energyColors: Record<EnergyLevel, string> = {
  high: 'bg-green-500 hover:bg-green-600',
  medium: 'bg-yellow-500 hover:bg-yellow-600',
  low: 'bg-red-400 hover:bg-red-500',
};

export const MoodRecorder: React.FC = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [note, setNote] = useState('');
  
  const { moodState, recordMood } = useMoodAgent(user?.id || '');
  const { isLoading } = moodState;

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleEnergySelect = (energy: EnergyLevel) => {
    setSelectedEnergy(energy);
  };

  const handleSubmit = async () => {
    if (!selectedMood || !selectedEnergy) {
      toast({
        variant: 'destructive',
        title: 'Selection required',
        description: 'Please select both a mood and energy level',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to record your mood',
      });
      return;
    }

    try {
      await recordMood(selectedMood, selectedEnergy, note);
      
      // Reset form after successful submission
      setNote('');
      setSelectedMood(null);
      setSelectedEnergy(null);
    } catch (error) {
      console.error('Error recording mood:', error);
    }
  };

  const moods: MoodType[] = ['happy', 'calm', 'sad', 'anxious', 'tired', 'energetic', 'stressed', 'neutral'];
  const energyLevels: EnergyLevel[] = ['high', 'medium', 'low'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
        <div className="grid grid-cols-4 gap-2">
          {moods.map((mood) => (
            <Button
              key={mood}
              type="button"
              variant={selectedMood === mood ? 'default' : 'outline'}
              className={`flex flex-col items-center p-3 ${
                selectedMood === mood ? 'bg-vibe-primary text-white' : ''
              }`}
              onClick={() => handleMoodSelect(mood)}
            >
              <span className="text-xl mb-1">{moodEmojis[mood]}</span>
              <span className="text-xs capitalize">{mood}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Energy level?</h3>
        <div className="flex gap-2">
          {energyLevels.map((energy) => (
            <Button
              key={energy}
              type="button"
              className={`flex-1 ${
                selectedEnergy === energy 
                  ? energyColors[energy] + ' text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleEnergySelect(energy)}
            >
              <span className="capitalize">{energy}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Add a note (optional)</h3>
        <Textarea
          placeholder="What's on your mind?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !selectedMood || !selectedEnergy}
        className="w-full bg-vibe-primary hover:bg-vibe-dark"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Mood'
        )}
      </Button>
    </div>
  );
};
