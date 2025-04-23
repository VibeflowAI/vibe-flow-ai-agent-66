
import React, { useEffect } from 'react';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/contexts/MoodContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentMood, getRecommendations } = useMood();

  useEffect(() => {
    if (currentMood) {
      getRecommendations();
    }
  }, [currentMood, getRecommendations]);

  const handleFeedback = (isPositive: boolean) => {
    toast({
      title: 'Feedback Received',
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback! We'll use it to improve your recommendations.`,
    });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
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
            
            {currentMood && (
              <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-3">How helpful are these recommendations?</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleFeedback(true)}
                  >
                    <ThumbsUp className="mr-2" />
                    Helpful
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleFeedback(false)}
                  >
                    <ThumbsDown className="mr-2" />
                    Not Helpful
                  </Button>
                </div>
                <div className="mt-4 text-center">
                  <Link to="/chat">
                    <Button variant="link" className="text-vibe-primary">
                      <MessageSquare className="mr-2" />
                      Chat for more specific recommendations
                    </Button>
                  </Link>
                </div>
              </div>
            )}
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
