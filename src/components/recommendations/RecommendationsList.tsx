import React, { useState, useEffect } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Recommendation } from '@/contexts/MoodContext';
import { createUniqueIdFromRecommendation } from './utils/imageUtils';

export const RecommendationsList = () => {
  const { recommendations, isLoading, currentMood } = useMood();
  const [userRatings, setUserRatings] = useState<Record<string, { liked: boolean, completed: boolean }>>({});
  const { user } = useAuth();
  const [uniqueRecommendations, setUniqueRecommendations] = useState<Recommendation[]>([]);
  
  // Enhanced deduplication with category diversity logic
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

    // Second pass - improve variety by prioritizing matches for current mood and energy
    // and ensuring diversity across categories
    const categoryCounter: Record<string, number> = {};
    
    // First prioritize exact mood and energy matches
    if (currentMood) {
      recommendations.forEach(rec => {
        if (
          rec.moodTypes.includes(currentMood.mood) && 
          rec.energyLevels.includes(currentMood.energy)
        ) {
          const uniqueKey = createUniqueIdFromRecommendation(rec);
          
          // Ensure category diversity by limiting number per category
          const category = rec.category.toLowerCase();
          categoryCounter[category] = (categoryCounter[category] || 0) + 1;
          
          // Only add if we don't have too many of this category already
          if (categoryCounter[category] <= 3 && !uniqueMap.has(uniqueKey)) {
            uniqueMap.set(uniqueKey, rec);
          }
        }
      });
    }
    
    // Then add other recommendations to fill in if needed
    recommendations.forEach(rec => {
      const uniqueKey = createUniqueIdFromRecommendation(rec);
      
      if (!uniqueMap.has(uniqueKey)) {
        const category = rec.category.toLowerCase();
        categoryCounter[category] = (categoryCounter[category] || 0) + 1;
        
        // Limit number per category to ensure diversity
        if (categoryCounter[category] <= 3) {
          uniqueMap.set(uniqueKey, rec);
        }
      }
    });
    
    // Convert map values back to array and sort by relevance to current mood
    let deduplicated = Array.from(uniqueMap.values());
    
    // If we have current mood, sort recommendations by relevance
    if (currentMood) {
      deduplicated = deduplicated.sort((a, b) => {
        // Calculate relevance score - exact mood and energy match gets highest priority
        const aMatchesMood = a.moodTypes.includes(currentMood.mood) ? 2 : 0;
        const aMatchesEnergy = a.energyLevels.includes(currentMood.energy) ? 1 : 0;
        const aScore = aMatchesMood + aMatchesEnergy;
        
        const bMatchesMood = b.moodTypes.includes(currentMood.mood) ? 2 : 0;
        const bMatchesEnergy = b.energyLevels.includes(currentMood.energy) ? 1 : 0;
        const bScore = bMatchesMood + bMatchesEnergy;
        
        return bScore - aScore; // Higher score comes first
      });
    }
    
    console.log(`Deduplication complete: ${deduplicated.length} unique items from ${recommendations.length} total items`);
    if (deduplicated.length < recommendations.length) {
      console.log(`Removed ${recommendations.length - deduplicated.length} duplicates`);
    }
    
    // Log category distribution for debugging
    const finalCategoryCounts: Record<string, number> = {};
    deduplicated.forEach(rec => {
      const category = rec.category.toLowerCase();
      finalCategoryCounts[category] = (finalCategoryCounts[category] || 0) + 1;
    });
    console.log('Category distribution:', finalCategoryCounts);
    
    setUniqueRecommendations(deduplicated);
  }, [recommendations, currentMood]);
  
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
