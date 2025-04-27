
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type RecommendationFeedbackProps = {
  recommendationId: string;
  onClose?: () => void;
};

export const RecommendationFeedback = ({ recommendationId, onClose }: RecommendationFeedbackProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here we would typically make an API call to save the feedback
      // For now we'll just simulate it with localStorage
      const feedbacks = JSON.parse(localStorage.getItem('vibeflow_feedbacks') || '{}');
      
      feedbacks[recommendationId] = {
        rating,
        comment,
        timestamp: Date.now()
      };
      
      localStorage.setItem('vibeflow_feedbacks', JSON.stringify(feedbacks));
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!"
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="font-medium text-lg mb-4">Rate this recommendation</h3>
      
      <div className="flex justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
          >
            <StarIcon
              className={`w-8 h-8 ${
                (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Additional comments (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vibe-primary"
          placeholder="What did you like or dislike about this recommendation?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </div>
  );
};
