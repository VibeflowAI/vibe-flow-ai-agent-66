
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recommendation } from '@/contexts/MoodContext';

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const categoryColors = {
    food: 'bg-green-100 text-green-800',
    activity: 'bg-blue-100 text-blue-800',
    mindfulness: 'bg-purple-100 text-purple-800',
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
        </div>
        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm">{recommendation.description}</p>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full border-vibe-primary text-vibe-primary hover:bg-vibe-primary hover:text-white">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};
