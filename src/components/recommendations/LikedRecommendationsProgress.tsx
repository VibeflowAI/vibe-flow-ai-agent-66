
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMood } from '@/contexts/MoodContext';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const LikedRecommendationsProgress = () => {
  const { recommendations } = useMood();
  const { user } = useAuth();
  const [likedCount, setLikedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate percentage of recommendations liked
  const totalRecommendations = recommendations.length;
  const percentageLiked = totalRecommendations > 0 
    ? Math.round((likedCount / totalRecommendations) * 100) 
    : 0;
    
  // Fetch liked recommendations from database
  useEffect(() => {
    if (user && recommendations.length > 0) {
      setIsLoading(true);
      
      const fetchLikedRecommendations = async () => {
        try {
          const recommendationIds = recommendations.map(rec => rec.id);
          
          const { data, error } = await supabase
            .from('recommendation_ratings')
            .select('recommendation_id')
            .eq('user_id', user.id)
            .in('recommendation_id', recommendationIds)
            .gt('rating', 0);
            
          if (error) {
            console.error('Error fetching liked recommendations:', error);
          } else if (data) {
            setLikedCount(data.length);
          }
        } catch (error) {
          console.error('Error in fetchLikedRecommendations:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchLikedRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [user, recommendations]);
  
  // Function to update the liked count
  const updateLikedCount = (increment: boolean) => {
    setLikedCount(prev => increment ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <Card className="overflow-hidden border-transparent shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-vibe-primary/10 to-vibe-light/10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-gray-800">Favorites Progress</CardTitle>
          <CardDescription>Track recommendations you've liked</CardDescription>
        </div>
        <Heart className="text-vibe-primary h-5 w-5" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Recommendations Liked</span>
            <span className="text-sm font-medium text-vibe-primary">
              {isLoading ? 'Loading...' : `${likedCount} / ${totalRecommendations}`}
            </span>
          </div>
          <Progress 
            value={percentageLiked} 
            className="h-2" 
            indicatorColor="bg-gradient-to-r from-pink-500 to-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {percentageLiked < 25 && "Keep exploring recommendations and save your favorites!"}
            {percentageLiked >= 25 && percentageLiked < 50 && "You're making great progress finding recommendations you like!"}
            {percentageLiked >= 50 && percentageLiked < 75 && "You're well on your way to finding your favorite recommendations!"}
            {percentageLiked >= 75 && "You're a recommendation pro! Almost all recommendations saved!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
