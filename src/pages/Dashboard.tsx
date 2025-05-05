
import React, { useEffect } from 'react';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { LikedRecommendationsProgress } from '@/components/recommendations/LikedRecommendationsProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/contexts/MoodContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowRight, History, Activity, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentMood, getRecommendations, moodHistory, moodEmojis } = useMood();
  const navigate = useNavigate();

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-gray-800">
            Hello, {user.displayName.split(' ')[0]}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {currentMood
              ? <span>You're feeling <span className="font-medium text-vibe-primary capitalize">{currentMood.mood}</span> today with <span className="font-medium text-vibe-primary capitalize">{currentMood.energy}</span> energy.</span>
              : 'Track your mood to get personalized recommendations.'}
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <motion.div 
            className="lg:col-span-4 space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card className="overflow-hidden border-transparent shadow-lg">
                <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
                  <CardTitle className="text-xl text-gray-800">Track Your Mood</CardTitle>
                  <CardDescription>How are you feeling today?</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <MoodTracker />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Add the new LikedRecommendationsProgress component */}
            {currentMood && (
              <motion.div variants={item}>
                <LikedRecommendationsProgress />
              </motion.div>
            )}
            
            {currentMood && (
              <motion.div variants={item}>
                <Card className="overflow-hidden border-transparent shadow-lg">
                  <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
                    <CardTitle className="text-xl text-gray-800">Recommendation Feedback</CardTitle>
                    <CardDescription>Are these suggestions helpful?</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 py-6 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                        onClick={() => handleFeedback(true)}
                      >
                        <ThumbsUp className="mr-2 h-5 w-5" />
                        Helpful
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 py-6 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleFeedback(false)}
                      >
                        <ThumbsDown className="mr-2 h-5 w-5" />
                        Not Helpful
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Link to="/chat">
                        <Button variant="secondary" className="w-full py-6 bg-vibe-light/20 hover:bg-vibe-light/40 text-vibe-primary">
                          <MessageSquare className="mr-2 h-5 w-5" />
                          Chat for specific recommendations
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {moodHistory && moodHistory.length > 0 && (
              <motion.div variants={item}>
                <Card className="overflow-hidden border-transparent shadow-lg">
                  <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800">Mood History</CardTitle>
                      <CardDescription>Your recent mood entries</CardDescription>
                    </div>
                    <History className="text-vibe-primary h-5 w-5" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 py-2">
                      {moodHistory.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className="text-3xl mr-3">
                              {moodEmojis[entry.mood]}
                            </div>
                            <div>
                              <p className="font-medium capitalize text-gray-800">{entry.mood}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs bg-vibe-primary/10 px-3 py-1.5 rounded-full text-vibe-primary font-medium capitalize">
                            {entry.energy}
                          </div>
                        </div>
                      ))}

                      {moodHistory.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-vibe-primary hover:text-vibe-dark hover:bg-vibe-primary/5 mt-2"
                          onClick={() => navigate('/stats')}
                        >
                          View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div variants={item}>
              <Card className="overflow-hidden border-transparent shadow-lg">
                <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-800">Stats Overview</CardTitle>
                    <CardDescription>Your wellness statistics</CardDescription>
                  </div>
                  <Activity className="text-vibe-primary h-5 w-5" />
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Mood Consistency</span>
                        <span className="text-sm font-medium text-vibe-primary">68%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-vibe-primary rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Activity Completion</span>
                        <span className="text-sm font-medium text-vibe-primary">42%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-vibe-primary rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Mindfulness Goals</span>
                        <span className="text-sm font-medium text-vibe-primary">75%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-vibe-primary rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full text-vibe-primary hover:text-vibe-dark border-vibe-primary/20 hover:bg-vibe-primary/5" onClick={() => navigate('/stats')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        View Detailed Stats
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-transparent shadow-xl h-full">
              <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
                <CardTitle className="text-xl text-gray-800">
                  {currentMood ? 'Personalized Recommendations' : 'Recommendations For You'}
                </CardTitle>
                <CardDescription>
                  {currentMood 
                    ? `Based on your ${currentMood.mood} mood and ${currentMood.energy} energy level`
                    : "Log your mood to get personalized recommendations"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <RecommendationsList />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
