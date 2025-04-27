
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, 
  MessageSquare, 
  Star, 
  PanelRightOpen, 
  PanelRightClose,
  ArrowRight,
  Heart
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Recommendation } from '@/contexts/MoodContext';
import { RecommendationFeedback } from './RecommendationFeedback';
import { motion } from 'framer-motion';

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const categoryColors = {
    food: 'bg-green-100 text-green-800 border-green-300',
    activity: 'bg-blue-100 text-blue-800 border-blue-300',
    mindfulness: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const categoryIcons = {
    food: '🍽️',
    activity: '🏃‍♂️',
    mindfulness: '🧘‍♀️',
  };

  const storedFeedbacks = JSON.parse(localStorage.getItem('vibeflow_feedbacks') || '{}');
  const hasFeedback = storedFeedbacks[recommendation.id] !== undefined;
  const rating = hasFeedback ? storedFeedbacks[recommendation.id].rating : null;
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    
    // Save to localStorage
    const savedRecommendations = JSON.parse(localStorage.getItem('vibeflow_saved_recommendations') || '{}');
    if (!isSaved) {
      savedRecommendations[recommendation.id] = recommendation;
    } else {
      delete savedRecommendations[recommendation.id];
    }
    localStorage.setItem('vibeflow_saved_recommendations', JSON.stringify(savedRecommendations));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full flex flex-col overflow-hidden group border-transparent shadow-lg hover:shadow-xl transition-all duration-300">
        {recommendation.imageUrl && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={recommendation.imageUrl}
              alt={recommendation.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
          </div>
        )}
        
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs px-3 py-1 rounded-full capitalize flex items-center gap-1 border ${categoryColors[recommendation.category]}`}>
              <span>{categoryIcons[recommendation.category]}</span> 
              {recommendation.category}
            </span>
            
            <div className="flex items-center gap-1">
              {hasFeedback && (
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < rating ? "text-yellow-500 fill-yellow-400" : "text-gray-300"}`} 
                    />
                  ))}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 rounded-full p-0 ${isSaved ? 'text-red-500' : 'text-gray-400'}`}
                onClick={toggleSave}
              >
                <Heart className={isSaved ? 'fill-red-500' : ''} size={18} />
              </Button>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-vibe-primary transition-colors duration-200">
            {recommendation.title}
          </h3>
        </CardHeader>
        
        <CardContent className="flex-grow pt-0">
          <p className="text-gray-600">{recommendation.description}</p>
          
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600"
            >
              <h4 className="font-medium mb-2">Details:</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-vibe-primary rounded-full mr-2"></span>
                  <span>Best for: {recommendation.moodTypes.join(', ')} moods</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-vibe-primary rounded-full mr-2"></span>
                  <span>Energy level: {recommendation.energyLevels.join(', ')}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-vibe-primary rounded-full mr-2"></span>
                  <span>Duration: 15-30 minutes</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-vibe-primary rounded-full mr-2"></span>
                  <span>Difficulty: Easy</span>
                </li>
              </ul>
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className="pt-2 flex flex-col space-y-3">
          <div className="flex justify-between w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-vibe-primary flex items-center gap-1"
              onClick={toggleDetails}
            >
              {showDetails ? (
                <>
                  <PanelRightClose className="h-4 w-4" /> 
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="h-4 w-4" /> 
                  <span>Show Details</span>
                </>
              )}
            </Button>
            
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-vibe-primary flex items-center gap-1">
                  <Star className="h-4 w-4" /> 
                  <span>{hasFeedback ? 'Edit Rating' : 'Rate'}</span>
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
          
          <Button 
            variant="default" 
            className="w-full bg-vibe-primary hover:bg-vibe-dark group overflow-hidden relative"
          >
            <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Learn More <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
