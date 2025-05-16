
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Recommendation } from '@/contexts/MoodContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RecommendationImage } from './components/RecommendationImage';
import { ActionButtons } from './components/ActionButtons';
import { CardContent } from './components/CardContent';
import { getCategoryPlaceholder } from './utils/imageUtils';

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onLikeChange?: (liked: boolean) => void;
  onCompletionChange?: (completed: boolean) => void;
  initialLiked?: boolean;
  initialCompleted?: boolean;
}

export const RecommendationCard = ({
  recommendation,
  onLikeChange,
  onCompletionChange,
  initialLiked = false,
  initialCompleted = false
}: RecommendationCardProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [completed, setCompleted] = useState(initialCompleted);
  const { user } = useAuth();

  // Update state if props change
  useEffect(() => {
    setLiked(initialLiked);
    setCompleted(initialCompleted);
  }, [initialLiked, initialCompleted]);

  const handleFeedback = (isPositive: boolean) => {
    toast({
      title: 'Feedback Received',
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback!`,
    });
  };
  
  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    // Call the callback if provided
    if (onLikeChange) {
      onLikeChange(newLikedState);
    }
    
    toast({
      title: newLikedState ? 'Added to favorites' : 'Removed from favorites',
      description: newLikedState 
        ? 'Recommendation saved to your favorites' 
        : 'Recommendation removed from your favorites',
    });

    // Track like status in database if user is logged in
    saveRatingToDatabase(newLikedState, completed);
  };

  const handleCompletion = () => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    
    // Call the callback if provided
    if (onCompletionChange) {
      onCompletionChange(newCompletedState);
    }
    
    toast({
      title: newCompletedState ? 'Activity Completed' : 'Activity Marked Incomplete',
      description: newCompletedState 
        ? 'Great job completing this activity!' 
        : 'Activity has been marked as incomplete',
    });

    // Track completion status in database if user is logged in
    saveRatingToDatabase(liked, newCompletedState);
  };

  const saveRatingToDatabase = async (isLiked: boolean, isCompleted: boolean) => {
    // Save like and completion status to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('recommendation_ratings')
          .upsert({
            user_id: user.id,
            recommendation_id: recommendation.id,
            rating: isLiked ? 5 : null,
            completed: isCompleted
          });
          
        if (error) {
          console.error('Error saving recommendation rating:', error);
        } else {
          console.log(`Recommendation ${recommendation.id} ${isLiked ? 'liked' : 'unliked'} and ${isCompleted ? 'completed' : 'marked incomplete'}`);
        }
      } catch (error) {
        console.error('Error saving recommendation rating:', error);
      }
    }
  };
  
  // Check if we actually have a valid image URL
  const hasImageUrl = recommendation.imageUrl && recommendation.imageUrl.trim() !== '';
  const imageUrl = hasImageUrl ? recommendation.imageUrl : getCategoryPlaceholder(recommendation.category);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={item} className="group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="relative">
          <RecommendationImage 
            imageUrl={imageUrl} 
            title={recommendation.title} 
            hasImageUrl={hasImageUrl}
            categoryPlaceholder={getCategoryPlaceholder(recommendation.category)}
          />
          <ActionButtons 
            liked={liked} 
            completed={completed} 
            onLike={handleLike} 
            onComplete={handleCompletion} 
          />
        </div>
        
        <CardContent 
          recommendation={recommendation}
          completed={completed}
          onFeedback={handleFeedback}
        />
      </div>
    </motion.div>
  );
};
