
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, CheckCircle } from 'lucide-react';

interface ActionButtonsProps {
  liked: boolean;
  completed: boolean;
  onLike: () => void;
  onComplete: () => void;
}

export const ActionButtons = ({ 
  liked, 
  completed, 
  onLike, 
  onComplete 
}: ActionButtonsProps) => {
  return (
    <div className="absolute top-2 right-2 flex space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`rounded-full ${
          completed ? 'bg-green-50 text-green-600' : 'bg-white/80 text-gray-500 hover:text-green-600'
        }`}
        onClick={onComplete}
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
        onClick={onLike}
      >
        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
        <span className="sr-only">{liked ? 'Unlike' : 'Like'}</span>
      </Button>
    </div>
  );
};
