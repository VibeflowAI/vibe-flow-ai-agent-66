
import React, { useEffect } from 'react';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/contexts/MoodContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentMood, getRecommendations, moodHistory } = useMood();

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
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">
            Hello, {user.displayName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            {currentMood
              ? `You're feeling ${currentMood.mood} today. Here are some recommendations to enhance your day.`
              : 'Track your mood to get personalized recommendations.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">How are you feeling?</CardTitle>
                <CardDescription>Track your mood to get personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodTracker />
              </CardContent>
            </Card>
            
            {currentMood && (
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Feedback</CardTitle>
                  <CardDescription>Are these recommendations helpful?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFeedback(true)}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Helpful
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFeedback(false)}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Not Helpful
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Link to="/chat">
                      <Button variant="secondary" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat for specific recommendations
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {moodHistory && moodHistory.length > 0 && (
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mood History</CardTitle>
                  <CardDescription>Your recent mood entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {moodHistory.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                        <div className="flex items-center">
                          <div className="text-2xl mr-2">
                            {useMood().moodEmojis[entry.mood]}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{entry.mood}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">
                          {entry.energy}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recommendations for You</CardTitle>
                <CardDescription>
                  {currentMood 
                    ? `Based on your ${currentMood.mood} mood and ${currentMood.energy} energy`
                    : "Log your mood to get personalized recommendations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendationsList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
