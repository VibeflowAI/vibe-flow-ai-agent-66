
import React, { useState, useEffect, useMemo } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const RecommendationsList = () => {
  const { recommendations, isLoading } = useMood();
  const [userRatings, setUserRatings] = useState<Record<string, { liked: boolean, completed: boolean }>>({});
  const { user } = useAuth();
  
  // Completely revised deduplication logic
  const uniqueRecommendations = useMemo(() => {
    // Create an object to track unique recommendations by ID
    const uniqueRecsObject: Record<string, any> = {};
    
    // Process the raw recommendations array
    recommendations.forEach(rec => {
      // Only add if this ID hasn't been seen yet
      if (!uniqueRecsObject[rec.id]) {
        uniqueRecsObject[rec.id] = rec;
      }
    });
    
    // Convert back to array
    const uniqueRecs = Object.values(uniqueRecsObject);
    
    console.log('DEDUPLICATION REPORT:');
    console.log(`Raw recommendations count: ${recommendations.length}`);
    console.log(`Unique recommendations count: ${uniqueRecs.length}`);
    
    if (recommendations.length !== uniqueRecs.length) {
      console.log('--------- DUPLICATE DETECTION ---------');
      console.log(`Found and removed ${recommendations.length - uniqueRecs.length} duplicates`);
      
      // Count occurrences of each ID to identify duplicates
      const idCounts: Record<string, number> = {};
      recommendations.forEach(rec => {
        idCounts[rec.id] = (idCounts[rec.id] || 0) + 1;
      });
      
      // Log the IDs that had duplicates
      Object.entries(idCounts)
        .filter(([_, count]) => count > 1)
        .forEach(([id, count]) => {
          console.log(`ID ${id} appeared ${count} times`);
        });
      console.log('--------------------------------------');
    }
    
    return uniqueRecs;
  }, [recommendations]);
  
  // Fetch user ratings for all recommendations
  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!user || uniqueRecommendations.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('recommendation_ratings')
          .select('recommendation_id, rating, completed')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching user ratings:', error);
          return;
        }
        
        // Create a mapping of recommendation IDs to their liked/completed status
        const ratingsMap: Record<string, { liked: boolean, completed: boolean }> = {};
        data?.forEach(rating => {
          ratingsMap[rating.recommendation_id] = {
            liked: !!rating.rating,
            completed: rating.completed === true
          };
          console.log(`Loaded recommendation ${rating.recommendation_id}: liked=${!!rating.rating}, completed=${rating.completed}`);
        });
        
        setUserRatings(ratingsMap);
      } catch (error) {
        console.error('Error in fetchUserRatings:', error);
      }
    };
    
    fetchUserRatings();
  }, [user, uniqueRecommendations]);
  
  // Handle empty or loading states
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (uniqueRecommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">
          No recommendations available right now.
          <br />
          Track your mood to get personalized recommendations.
        </p>
      </div>
    );
  }

  // Animation configuration for staggered list
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleLikeChange = async (recommendationId: string, liked: boolean) => {
    console.log(`Recommendation ${recommendationId} ${liked ? 'liked' : 'unliked'}`);
    
    // Update local state
    setUserRatings(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        liked,
      }
    }));
    
    // Save to database handled by RecommendationCard
  };

  const handleCompletionChange = async (recommendationId: string, completed: boolean) => {
    console.log(`Recommendation ${recommendationId} marked as ${completed ? 'completed' : 'incomplete'}`);
    
    // Update local state
    setUserRatings(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        completed,
      }
    }));
    
    // Save to database handled by RecommendationCard
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {uniqueRecommendations.map((recommendation) => (
        <RecommendationCard 
          key={recommendation.id} 
          recommendation={recommendation}
          onLikeChange={(liked) => handleLikeChange(recommendation.id, liked)}
          onCompletionChange={(completed) => handleCompletionChange(recommendation.id, completed)}
          initialLiked={!!userRatings[recommendation.id]?.liked}
          initialCompleted={!!userRatings[recommendation.id]?.completed}
        />
      ))}
    </motion.div>
  );
};
