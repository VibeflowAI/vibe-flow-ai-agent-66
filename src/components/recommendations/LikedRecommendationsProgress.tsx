
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Heart } from 'lucide-react';

export const LikedRecommendationsProgress = () => {
  const [likedPercentage, setLikedPercentage] = useState(0);
  const [completedPercentage, setCompletedPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendationsStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get total recommendations count
        const { count: totalCount, error: countError } = await supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get user's liked recommendations
        const { data: likedData, error: likedError } = await supabase
          .from('recommendation_ratings')
          .select('*')
          .eq('user_id', user.id)
          .not('rating', 'is', null);

        if (likedError) throw likedError;

        // Get user's completed recommendations
        const { data: completedData, error: completedError } = await supabase
          .from('recommendation_ratings')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (completedError) throw completedError;

        // Calculate percentages
        if (totalCount && totalCount > 0) {
          const liked = likedData?.length || 0;
          const completed = completedData?.length || 0;
          setLikedPercentage(Math.round((liked / totalCount) * 100));
          setCompletedPercentage(Math.round((completed / totalCount) * 100));
        }
      } catch (error) {
        console.error('Error fetching recommendations stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendationsStats();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-transparent shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
          <CardTitle className="text-xl text-gray-800">Your Progress</CardTitle>
          <CardDescription>Loading your activities progress...</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-transparent shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10">
        <CardTitle className="text-xl text-gray-800">Your Progress</CardTitle>
        <CardDescription>Track your activity engagement</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Liked Activities</span>
              </div>
              <span className="text-sm font-medium text-vibe-primary">{likedPercentage}%</span>
            </div>
            <Progress 
              value={likedPercentage} 
              className="h-2" 
              indicatorColor="bg-red-400"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Completed Activities</span>
              </div>
              <span className="text-sm font-medium text-vibe-primary">{completedPercentage}%</span>
            </div>
            <Progress 
              value={completedPercentage} 
              className="h-2" 
              indicatorColor="bg-green-400"
            />
          </div>
          
          {likedPercentage === 0 && completedPercentage === 0 ? (
            <p className="text-sm text-gray-500 pt-2">
              Start liking and completing activities to track your progress
            </p>
          ) : (
            <p className="text-sm text-gray-500 pt-2">
              You've liked {likedPercentage}% and completed {completedPercentage}% of all recommendations
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
