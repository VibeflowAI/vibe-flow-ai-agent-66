
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { RecommendationCard } from './RecommendationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const RecommendationsList = () => {
  const { recommendations, isLoading } = useMood();
  
  const foodRecommendations = recommendations.filter(rec => rec.category === 'food');
  const activityRecommendations = recommendations.filter(rec => rec.category === 'activity');
  const mindfulnessRecommendations = recommendations.filter(rec => rec.category === 'mindfulness');

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-gray-600">
          No recommendations available. Log your mood to get personalized suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Personalized Recommendations</h2>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="food">Food</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(recommendation => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="food">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodRecommendations.length > 0 ? (
              foodRecommendations.map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No food recommendations available.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activityRecommendations.length > 0 ? (
              activityRecommendations.map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No activity recommendations available.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mindfulness">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindfulnessRecommendations.length > 0 ? (
              mindfulnessRecommendations.map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No mindfulness recommendations available.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
