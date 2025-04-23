
import React, { useEffect } from 'react';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/contexts/MoodContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentMood, getRecommendations } = useMood();

  useEffect(() => {
    if (currentMood) {
      getRecommendations();
    }
  }, [currentMood, getRecommendations]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Hello, {user.displayName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            {currentMood
              ? `You're feeling ${currentMood.mood} today. Here are some recommendations to enhance your day.`
              : 'Track your mood to get personalized recommendations.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MoodTracker />
          </div>
          <div className="lg:col-span-2">
            <RecommendationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
