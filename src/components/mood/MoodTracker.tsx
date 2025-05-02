
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMood, MoodType, EnergyLevel } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const MoodTracker = () => {
  const { logMood, isLoading, moodEmojis, moodDescriptions, energyDescriptions } = useMood();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const moods: MoodType[] = ['happy', 'calm', 'tired', 'stressed', 'sad'];
  const energyLevels: EnergyLevel[] = ['low', 'medium', 'high'];

  const handleSubmit = async () => {
    if (selectedMood && selectedEnergy) {
      setIsSaving(true);
      try {
        // Log mood in context
        await logMood(selectedMood, selectedEnergy, note);
        
        // Save to Supabase if user is authenticated
        if (user) {
          console.log('Saving mood to Supabase for user:', user.id);
          
          // First check if the user exists in the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!userData || userError) {
            console.log('User not found, trying to create user record first');
            // Create a basic user record if it doesn't exist
            const { error: insertUserError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.displayName || user.email.split('@')[0]
              });
              
            if (insertUserError) {
              console.error('Error creating user record:', insertUserError);
              throw new Error('Failed to create user record');
            }
          }
          
          // Now insert the mood entry
          const { error } = await supabase
            .from('mood_entries')
            .insert({
              user_id: user.id,
              mood: selectedMood,
              energy_level: selectedEnergy,
              note: note || null
            });
          
          if (error) {
            console.error('Error saving mood to Supabase:', error);
            throw error;
          }
        }
        
        // Reset form after submission
        setNote('');
        setSelectedMood(null);
        setSelectedEnergy(null);
        
        toast({
          title: 'Mood tracked successfully',
          description: 'Your mood has been recorded and will be used for personalized recommendations.',
        });
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to track mood',
          description: 'There was a problem saving your mood. Please try again.',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="space-y-6">
        {/* Mood Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">How are you feeling today?</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {moods.map((mood) => (
              <motion.div
                key={mood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={selectedMood === mood ? "default" : "outline"}
                  className={`h-auto w-[85px] py-4 flex flex-col items-center justify-center transition-all rounded-xl ${
                    selectedMood === mood
                      ? "bg-vibe-primary text-white shadow-lg shadow-vibe-primary/30"
                      : "hover:border-vibe-primary hover:text-vibe-primary bg-white"
                  }`}
                  onClick={() => setSelectedMood(mood)}
                >
                  <span className="text-3xl mb-1">{moodEmojis[mood]}</span>
                  <span className="capitalize font-medium">{mood}</span>
                </Button>
              </motion.div>
            ))}
          </div>
          {selectedMood && (
            <div className="mt-3 p-3 bg-vibe-primary/5 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                {moodDescriptions[selectedMood]}
              </p>
            </div>
          )}
        </div>

        {/* Energy Level Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">What's your energy level?</h3>
          <div className="grid grid-cols-3 gap-3">
            {energyLevels.map((level) => (
              <motion.div
                key={level}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedEnergy === level ? "default" : "outline"}
                  className={`w-full py-3 ${
                    selectedEnergy === level
                      ? "bg-vibe-primary text-white shadow-md shadow-vibe-primary/20"
                      : "hover:border-vibe-primary hover:text-vibe-primary bg-white"
                  }`}
                  onClick={() => setSelectedEnergy(level)}
                >
                  <span className="capitalize font-medium">{level}</span>
                </Button>
              </motion.div>
            ))}
          </div>
          {selectedEnergy && (
            <div className="mt-3 p-3 bg-vibe-primary/5 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                {energyDescriptions[selectedEnergy]}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Add a note (optional)</h3>
          <Textarea
            placeholder="How are you feeling today? Any specific thoughts?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none border-gray-300 focus:border-vibe-primary focus:ring focus:ring-vibe-primary/20 focus:ring-opacity-50"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || !selectedEnergy || isLoading || isSaving}
            className="w-full py-6 text-lg font-medium bg-gradient-to-r from-vibe-primary to-vibe-dark hover:from-vibe-dark hover:to-vibe-primary text-white shadow-lg shadow-vibe-primary/30 transition-all duration-300"
          >
            {isLoading || isSaving ? 
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging...
              </span> 
              : "Track My Mood"
            }
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
