
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, 
  MessageSquare, 
  Star, 
  PanelRightOpen, 
  PanelRightClose 
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Recommendation } from '@/contexts/MoodContext';
import { RecommendationFeedback } from './RecommendationFeedback';

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  const categoryColors = {
    food: 'bg-green-100 text-green-800',
    activity: 'bg-blue-100 text-blue-800',
    mindfulness: 'bg-purple-100 text-purple-800',
  };

  const storedFeedbacks = JSON.parse(localStorage.getItem('vibeflow_feedbacks') || '{}');
  const hasFeedback = storedFeedbacks[recommendation.id] !== undefined;
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-md overflow-hidden">
      {recommendation.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={recommendation.imageUrl}
            alt={recommendation.title}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between mb-1">
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${categoryColors[recommendation.category]}`}>
            {recommendation.category}
          </span>
          {hasFeedback && (
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-yellow-400" />
              <span className="text-xs ml-1">{storedFeedbacks[recommendation.id].rating}</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm">{recommendation.description}</p>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <h4 className="font-medium mb-2">Details:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Best for: {recommendation.moodTypes.join(', ')} moods</li>
              <li>Energy level: {recommendation.energyLevels.join(', ')}</li>
              <li>Duration: 15-30 minutes</li>
              <li>Difficulty: Easy</li>
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col space-y-2">
        <div className="flex justify-between w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-vibe-primary"
            onClick={toggleDetails}
          >
            {showDetails ? (
              <>
                <PanelRightClose className="h-4 w-4 mr-1" /> 
                Hide Details
              </>
            ) : (
              <>
                <PanelRightOpen className="h-4 w-4 mr-1" /> 
                Show Details
              </>
            )}
          </Button>
          
          <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-vibe-primary">
                <Star className="h-4 w-4 mr-1" /> 
                {hasFeedback ? 'Edit Rating' : 'Rate'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <RecommendationFeedback 
                recommendationId={recommendation.id}
                onClose={() => setFeedbackOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Button variant="outline" className="w-full border-vibe-primary text-vibe-primary hover:bg-vibe-primary hover:text-white">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};
