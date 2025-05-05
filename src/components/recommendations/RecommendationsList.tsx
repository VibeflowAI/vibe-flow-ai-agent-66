
import React, { useState, useEffect } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { RecommendationCard } from './RecommendationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Filter, ArrowUpDown, LayoutGrid, LayoutList, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export const RecommendationsList = () => {
  const { recommendations, isLoading, getRecommendations } = useMood();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'alphabetical'>('default');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const foodRecommendations = recommendations.filter(rec => rec.category === 'food');
  const activityRecommendations = recommendations.filter(rec => rec.category === 'activity');
  const mindfulnessRecommendations = recommendations.filter(rec => rec.category === 'mindfulness');

  // Force refresh recommendations on component mount
  useEffect(() => {
    console.log("RecommendationsList mounted, refreshing recommendations");
    fetchRecommendations();
    // This ensures the recommendations are fresh when the component mounts
  }, [getRecommendations]);

  const fetchRecommendations = async () => {
    await getRecommendations();
  };

  const sortRecommendations = (recs: any[]) => {
    if (sortBy === 'rating') {
      // Sort by rating (this is a mock implementation, replace with actual rating logic)
      return [...recs].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'alphabetical') {
      return [...recs].sort((a, b) => a.title.localeCompare(b.title));
    }
    return recs;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleRefresh = async () => {
    console.log("Manually refreshing recommendations");
    setRefreshing(true);
    try {
      await getRecommendations();
      toast({
        title: "Recommendations updated",
        description: "Got the latest personalized suggestions for you."
      });
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      toast({
        title: "Update failed",
        description: "Could not refresh recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && !refreshing) {
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
        <p className="text-lg text-gray-600 mb-4">
          No recommendations available. Log your mood to get personalized suggestions.
        </p>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Your Recommendations</h2>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === 'grid' ? 'bg-vibe-primary text-white' : 'text-gray-600'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === 'list' ? 'bg-vibe-primary text-white' : 'text-gray-600'}`}
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="dropdown relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-gray-200 text-gray-700"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>Sort: {sortBy === 'default' ? 'Recommended' : sortBy === 'rating' ? 'Highest Rated' : 'A-Z'}</span>
            </Button>
            <div className={`dropdown-menu absolute ${dropdownOpen ? 'block' : 'hidden'} right-0 mt-1 w-40 bg-white rounded-md overflow-hidden shadow-lg border border-gray-200 z-10`}>
              <button 
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'default' ? 'bg-vibe-primary/10 text-vibe-primary' : 'text-gray-700'}`}
                onClick={() => {setSortBy('default'); setDropdownOpen(false);}}
              >
                Recommended
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'rating' ? 'bg-vibe-primary/10 text-vibe-primary' : 'text-gray-700'}`}
                onClick={() => {setSortBy('rating'); setDropdownOpen(false);}}
              >
                Highest Rated
              </button>
              <button 
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'alphabetical' ? 'bg-vibe-primary/10 text-vibe-primary' : 'text-gray-700'}`}
                onClick={() => {setSortBy('alphabetical'); setDropdownOpen(false);}}
              >
                Alphabetical (A-Z)
              </button>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 border-gray-200 text-gray-700"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 p-1 bg-vibe-primary/5 rounded-xl">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-vibe-primary data-[state=active]:text-white rounded-lg"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="food"
            className="data-[state=active]:bg-vibe-primary data-[state=active]:text-white rounded-lg"
          >
            Food
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="data-[state=active]:bg-vibe-primary data-[state=active]:text-white rounded-lg"
          >
            Activity
          </TabsTrigger>
          <TabsTrigger 
            value="mindfulness"
            className="data-[state=active]:bg-vibe-primary data-[state=active]:text-white rounded-lg"
          >
            Mindfulness
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <motion.div 
            className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
            variants={container}
            initial="hidden"
            animate="show"
          >
            {sortRecommendations(recommendations).map(recommendation => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="food">
          <motion.div 
            className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
            variants={container}
            initial="hidden"
            animate="show"
          >
            {foodRecommendations.length > 0 ? (
              sortRecommendations(foodRecommendations).map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No food recommendations available.</p>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="activity">
          <motion.div 
            className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
            variants={container}
            initial="hidden"
            animate="show"
          >
            {activityRecommendations.length > 0 ? (
              sortRecommendations(activityRecommendations).map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No activity recommendations available.</p>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="mindfulness">
          <motion.div 
            className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
            variants={container}
            initial="hidden"
            animate="show"
          >
            {mindfulnessRecommendations.length > 0 ? (
              sortRecommendations(mindfulnessRecommendations).map(recommendation => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No mindfulness recommendations available.</p>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
