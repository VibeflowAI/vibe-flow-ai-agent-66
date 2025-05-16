
import React, { useState, useEffect } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Recommendation } from '@/contexts/MoodContext';
import { createUniqueIdFromRecommendation } from './utils/imageUtils';

export const RecommendationsList = () => {
  const { recommendations, isLoading } = useMood();
  const [userRatings, setUserRatings] = useState<Record<string, { liked: boolean, completed: boolean }>>({});
  const { user } = useAuth();
  const [uniqueRecommendations, setUniqueRecommendations] = useState<Recommendation[]>([]);
  
  // Enhanced deduplication with detailed logging
  useEffect(() => {
    if (!recommendations || recommendations.length === 0) {
      setUniqueRecommendations([]);
      return;
    }
    
    console.log(`Starting deduplication process on ${recommendations.length} recommendations`);
    
    // Use a Map with composite key for stronger uniqueness guarantee
    const uniqueMap = new Map();
    const idSet = new Set<string>();
    
    // First pass - log all IDs to see if we have genuine duplicates
    recommendations.forEach(rec => {
      if (idSet.has(rec.id)) {
        console.log(`Found duplicate ID: ${rec.id} - Title: ${rec.title}`);
      } else {
        idSet.add(rec.id);
      }
    });
    
    // Second pass - add to map with composite key for stronger guarantee
    recommendations.forEach(rec => {
      const uniqueKey = createUniqueIdFromRecommendation(rec);
      
      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, rec);
      } else {
        console.log(`Filtered duplicate: ID=${rec.id}, Title=${rec.title}`);
      }
    });
    
    // Convert map values back to array
    const deduplicated = Array.from(uniqueMap.values());
    
    console.log(`Deduplication complete: ${deduplicated.length} unique items from ${recommendations.length} total items`);
    if (deduplicated.length < recommendations.length) {
      console.log(`Removed ${recommendations.length - deduplicated.length} duplicates`);
    }
    
    setUniqueRecommendations(deduplicated);
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
    // Update local state
    setUserRatings(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        liked,
      }
    }));
  };

  const handleCompletionChange = async (recommendationId: string, completed: boolean) => {
    // Update local state
    setUserRatings(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        completed,
      }
    }));
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
          key={createUniqueIdFromRecommendation(recommendation)} 
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
