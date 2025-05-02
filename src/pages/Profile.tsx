
import React, { useEffect } from 'react';
import { UserProfile } from '@/components/profile/UserProfile';
import { HealthHistoryForm } from '@/components/profile/HealthHistoryForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();

  // Check if there are any recommendations in the database
  useEffect(() => {
    const checkRecommendations = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking recommendations:', error);
          return;
        }
        
        // If no recommendations exist, add some default ones
        if (count === 0) {
          console.log('No recommendations found, adding defaults');
          const defaultRecommendations = [
            {
              title: 'Take a 10-minute walk',
              description: 'Even a short walk can boost your mood and energy levels.',
              category: 'activity',
              mood_types: ['tired', 'stressed', 'sad'],
              energy_levels: ['low', 'medium']
            },
            {
              title: 'Drink a glass of water',
              description: 'Staying hydrated is essential for maintaining energy levels.',
              category: 'food',
              mood_types: ['tired'],
              energy_levels: ['low', 'medium', 'high']
            },
            {
              title: 'Practice deep breathing',
              description: 'Take 5 deep breaths, inhaling for 4 counts and exhaling for 6.',
              category: 'mindfulness',
              mood_types: ['stressed', 'sad'],
              energy_levels: ['low', 'medium', 'high']
            },
            {
              title: 'Have a fruit snack',
              description: 'Natural sugars in fruits provide a gentle energy boost.',
              category: 'food',
              mood_types: ['tired'],
              energy_levels: ['low', 'medium']
            },
            {
              title: 'Quick meditation session',
              description: 'A 5-minute meditation can help reset your stress levels.',
              category: 'mindfulness',
              mood_types: ['stressed'],
              energy_levels: ['medium', 'high']
            }
          ];
          
          const { error: insertError } = await supabase
            .from('recommendations')
            .insert(defaultRecommendations);
            
          if (insertError) {
            console.error('Error adding default recommendations:', insertError);
          } else {
            console.log('Added default recommendations successfully');
          }
        }
      } catch (err) {
        console.error('Error in checkRecommendations:', err);
      }
    };
    
    checkRecommendations();
  }, [user]);

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and health history
          </p>
        </header>

        <UserProfile />
        <HealthHistoryForm />
      </div>
    </div>
  );
};

export default Profile;
