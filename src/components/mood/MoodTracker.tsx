
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMood, MoodType, EnergyLevel } from '@/contexts/MoodContext';

export const MoodTracker = () => {
  const { logMood, isLoading, moodEmojis, moodDescriptions, energyDescriptions } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [note, setNote] = useState('');

  const moods: MoodType[] = ['happy', 'calm', 'tired', 'stressed', 'sad'];
  const energyLevels: EnergyLevel[] = ['low', 'medium', 'high'];

  const handleSubmit = async () => {
    if (selectedMood && selectedEnergy) {
      await logMood(selectedMood, selectedEnergy, note);
      // Reset form after submission
      setNote('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">How are you feeling?</CardTitle>
        <CardDescription className="text-center">
          Track your mood to get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mood Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select your mood:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {moods.map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? "default" : "outline"}
                  className={`px-4 py-6 flex flex-col items-center justify-center transition-all ${
                    selectedMood === mood
                      ? "bg-vibe-primary text-white"
                      : "hover:border-vibe-primary hover:text-vibe-primary"
                  }`}
                  onClick={() => setSelectedMood(mood)}
                >
                  <span className="text-2xl mb-1">{moodEmojis[mood]}</span>
                  <span className="capitalize">{mood}</span>
                </Button>
              ))}
            </div>
            {selectedMood && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {moodDescriptions[selectedMood]}
              </p>
            )}
          </div>

          {/* Energy Level Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Energy level:</h3>
            <div className="grid grid-cols-3 gap-2">
              {energyLevels.map((level) => (
                <Button
                  key={level}
                  variant={selectedEnergy === level ? "default" : "outline"}
                  className={`py-2 ${
                    selectedEnergy === level
                      ? "bg-vibe-primary text-white"
                      : "hover:border-vibe-primary hover:text-vibe-primary"
                  }`}
                  onClick={() => setSelectedEnergy(level)}
                >
                  <span className="capitalize">{level}</span>
                </Button>
              ))}
            </div>
            {selectedEnergy && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {energyDescriptions[selectedEnergy]}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-medium mb-2">Add a note (optional):</h3>
            <Textarea
              placeholder="How are you feeling today? Any specific thoughts?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || !selectedEnergy || isLoading}
            className="w-full bg-vibe-primary hover:bg-vibe-dark"
          >
            {isLoading ? "Logging..." : "Log Your Mood"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
