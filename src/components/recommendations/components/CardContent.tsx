
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { FeedbackButtons } from './FeedbackButtons';
import { Recommendation } from '@/contexts/MoodContext';

interface CardContentProps {
  recommendation: Recommendation;
  completed: boolean;
  onFeedback: (isPositive: boolean) => void;
}

export const CardContent = ({ recommendation, completed, onFeedback }: CardContentProps) => {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800">{recommendation.title}</h3>
      <p className="text-gray-600 text-sm mt-1">{recommendation.description}</p>
      
      <div className="mt-4 pt-2 border-t border-gray-100 flex flex-col gap-2">
        <div className="flex items-center">
          <span className="inline-block bg-vibe-primary/10 text-vibe-primary text-xs px-2 py-1 rounded-full font-medium capitalize">
            {recommendation.category}
          </span>
        </div>
        
        {/* Completed badge - always displayed when completed is true, in its own row */}
        {completed && (
          <div className="flex items-center">
            <Badge variant="secondary" className="bg-green-50 text-green-600 hover:bg-green-100 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
          </div>
        )}

        <FeedbackButtons 
          onPositiveFeedback={() => onFeedback(true)} 
          onNegativeFeedback={() => onFeedback(false)} 
        />
      </div>
    </div>
  );
};
