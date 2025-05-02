
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Heart, Image, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Recommendation } from '@/contexts/MoodContext';
import { toast } from '@/hooks/use-toast';

export const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleFeedback = (isPositive: boolean) => {
    toast({
      title: 'Feedback Received',
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback!`,
    });
  };
  
  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? 'Removed from favorites' : 'Added to favorites',
      description: liked 
        ? 'Recommendation removed from your favorites' 
        : 'Recommendation saved to your favorites',
    });
  };

  // Check if we actually have a valid image URL
  const hasImageUrl = recommendation.imageUrl && recommendation.imageUrl.trim() !== '';
  
  const imageUrl = hasImageUrl && !imageError 
    ? recommendation.imageUrl 
    : '/placeholder.svg';

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
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-2 right-2 rounded-full ${
              liked ? 'bg-red-50 text-red-600' : 'bg-white/80 text-gray-500 hover:text-red-600'
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span className="sr-only">{liked ? 'Unlike' : 'Like'}</span>
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800">{recommendation.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{recommendation.description}</p>
          
          <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between">
            <div>
              <span className="inline-block bg-vibe-primary/10 text-vibe-primary text-xs px-2 py-1 rounded-full font-medium capitalize">
                {recommendation.category}
              </span>
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
