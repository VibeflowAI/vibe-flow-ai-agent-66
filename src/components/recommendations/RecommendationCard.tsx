
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Recommendation } from '@/contexts/MoodContext';
import { toast } from '@/hooks/use-toast';

export const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const handleFeedback = (isPositive: boolean) => {
    toast({
      title: 'Feedback Received',
      description: `Thank you for your ${isPositive ? 'positive' : 'negative'} feedback!`,
    });
  };

  // Default image if none is provided
  const imageUrl = recommendation.imageUrl || '/placeholder.svg';

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={item} className="group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="h-36 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={recommendation.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
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
