
import React, { useState, useEffect } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Recommendation } from '@/contexts/MoodContext';
import { createUniqueIdFromRecommendation, getRecommendationFingerprint } from './utils/imageUtils';

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
    
    // Use fingerprinting for better duplicate detection
    const uniqueRecsMap = new Map<string, Recommendation>();
    const seenFingerprints = new Set<string>();
    const categoryCounter: Record<string, number> = {};
    
    // Process recommendations in order of relevance to current mood
    const sortedRecs = currentMood 
      ? [...recommendations].sort((a, b) => {
          // Calculate relevance score - exact mood and energy match gets highest priority
          const aMatchesMood = a.moodTypes.includes(currentMood.mood) ? 2 : 0;
          const aMatchesEnergy = a.energyLevels.includes(currentMood.energy) ? 1 : 0;
          const aScore = aMatchesMood + aMatchesEnergy;
          
          const bMatchesMood = b.moodTypes.includes(currentMood.mood) ? 2 : 0;
          const bMatchesEnergy = b.energyLevels.includes(currentMood.energy) ? 1 : 0;
          const bScore = bMatchesMood + bMatchesEnergy;
          
          return bScore - aScore; // Higher score comes first
        })
      : recommendations;
    
    // First pass - identify and log duplicates
    const duplicateIds = new Set<string>();
    sortedRecs.forEach((rec, index) => {
      sortedRecs.slice(index + 1).forEach(otherRec => {
        if (rec.id === otherRec.id) {
          duplicateIds.add(rec.id);
        }
      });
    });
    
    if (duplicateIds.size > 0) {
      console.log(`Found ${duplicateIds.size} recommendations with duplicate IDs`);
    }
    
    // Second pass - build unique recommendations list
    sortedRecs.forEach(rec => {
      const fingerprint = getRecommendationFingerprint(rec);
      const uniqueKey = createUniqueIdFromRecommendation(rec);
      
      // Skip if we've already seen this recommendation
      if (seenFingerprints.has(fingerprint)) {
        return;
      }
      
      const category = rec.category.toLowerCase();
      
      // Ensure category diversity by limiting number per category
      // Increase the limit slightly (from 3 to 4) to allow more diversity
      categoryCounter[category] = (categoryCounter[category] || 0) + 1;
      
      if (categoryCounter[category] <= 4) {
        uniqueRecsMap.set(uniqueKey, rec);
        seenFingerprints.add(fingerprint);
      }
    });
    
    // Convert map values back to array
    let deduplicated = Array.from(uniqueRecsMap.values());
    
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
