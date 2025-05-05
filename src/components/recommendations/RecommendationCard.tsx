import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Heart, Image, ImageOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Recommendation } from '@/contexts/MoodContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';

export const RecommendationCard = ({ 
  recommendation,
  onLikeChange,
  onCompletionChange,
  initialLiked = false,
  initialCompleted = false
}: { 
  recommendation: Recommendation,
  onLikeChange?: (liked: boolean) => void,
  onCompletionChange?: (completed: boolean) => void,
  initialLiked?: boolean,
  initialCompleted?: boolean
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [completed, setCompleted] = useState(initialCompleted);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
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
        await supabase
          .from('recommendation_ratings')
          .upsert({
            user_id: user.id,
            recommendation_id: recommendation.id,
            rating: isLiked ? 5 : null,
            completed: isCompleted
          });
      } catch (error) {
        console.error('Error saving recommendation rating:', error);
      }
    }
  };

  // Category-specific placeholder images when no image is available or on error
  const getCategoryPlaceholder = () => {
    switch (recommendation.category) {
      case 'food':
        return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&h=400';
      case 'activity':
        return 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?auto=format&fit=crop&w=600&h=400';
      case 'mindfulness':
        return 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&h=400';
      default:
        return '/placeholder.svg';
    }
  };
  
  // Check if we actually have a valid image URL
  const hasImageUrl = recommendation.imageUrl && recommendation.imageUrl.trim() !== '';
  const imageUrl = hasImageUrl && !imageError 
    ? recommendation.imageUrl 
    : getCategoryPlaceholder();

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={item} className="group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="h-36 overflow-hidden relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Image className="h-8 w-8 text-gray-400 animate-pulse" />
            </div>
          )}
          
          <img 
            src={imageUrl} 
            alt={recommendation.title} 
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
              console.log('Image failed to load:', recommendation.imageUrl);
            }}
          />
          
          {imageError && hasImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full ${
                completed ? 'bg-green-50 text-green-600' : 'bg-white/80 text-gray-500 hover:text-green-600'
              }`}
              onClick={handleCompletion}
            >
              <CheckCircle className={`h-5 w-5 ${completed ? 'fill-current' : ''}`} />
              <span className="sr-only">{completed ? 'Mark as incomplete' : 'Mark as completed'}</span>
            </Button>
          
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full ${
                liked ? 'bg-red-50 text-red-600' : 'bg-white/80 text-gray-500 hover:text-red-600'
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span className="sr-only">{liked ? 'Unlike' : 'Like'}</span>
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800">{recommendation.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{recommendation.description}</p>
          
          <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between">
            <div className="flex items-center">
              <span className="inline-block bg-vibe-primary/10 text-vibe-primary text-xs px-2 py-1 rounded-full font-medium capitalize">
                {recommendation.category}
              </span>
              
              {completed && (
                <span className="inline-flex items-center ml-2 bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" /> Completed
                </span>
              )}
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
                onClick={() => handleFeedback(true)}
              >
                <span className="sr-only">Helpful</span>
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleFeedback(false)}
              >
                <span className="sr-only">Not Helpful</span>
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
