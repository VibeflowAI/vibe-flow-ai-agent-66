
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackButtonsProps {
  onPositiveFeedback: () => void;
  onNegativeFeedback: () => void;
}

export const FeedbackButtons = ({ 
  onPositiveFeedback, 
  onNegativeFeedback 
}: FeedbackButtonsProps) => {
  return (
    <div className="flex justify-end">
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50"
          onClick={onPositiveFeedback}
        >
          <span className="sr-only">Helpful</span>
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
          onClick={onNegativeFeedback}
        >
          <span className="sr-only">Not Helpful</span>
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
