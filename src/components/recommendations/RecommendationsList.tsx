
import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';

export const RecommendationsList = () => {
  const { recommendations, isLoading } = useMood();
  
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

  if (recommendations.length === 0) {
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

  const handleLikeChange = (recommendationId: string, liked: boolean) => {
    console.log(`Recommendation ${recommendationId} ${liked ? 'liked' : 'unliked'}`);
  };

  const handleCompletionChange = (recommendationId: string, completed: boolean) => {
    console.log(`Recommendation ${recommendationId} marked as ${completed ? 'completed' : 'incomplete'}`);
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {recommendations.map((recommendation) => (
        <RecommendationCard 
          key={recommendation.id} 
          recommendation={recommendation}
          onLikeChange={(liked) => handleLikeChange(recommendation.id, liked)}
          onCompletionChange={(completed) => handleCompletionChange(recommendation.id, completed)}
        />
      ))}
    </motion.div>
  );
};
