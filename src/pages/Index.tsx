
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Index = () => {
  const { user } = useAuth();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-vibe-background">
      {/* Hero Section */}
      <header className="relative bg-white">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-vibe-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="font-bold text-xl text-vibe-primary">VibeFlow</span>
          </div>
          <div>
            <Link to="/signin">
              <Button variant="outline" className="border-vibe-primary text-vibe-primary mr-2">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-vibe-primary hover:bg-vibe-dark">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 vibe-gradient">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Personalized Wellness Based on Your Mood
              </h1>
              <p className="text-xl mb-8 opacity-90 max-w-lg">
                VibeFlow uses AI to analyze your mood and provide personalized recommendations for food, activities, and mindfulness practices.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-vibe-primary hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-vibe-primary">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Preview the App</CardTitle>
                  <CardDescription>See the types of recommendations you'll get</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Sample Recommendations</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          title: 'Morning Yoga Routine',
                          description: 'Start your day with a 15-minute gentle yoga flow',
                          category: 'activity'
                        },
                        {
                          title: 'Mood-Boosting Smoothie',
                          description: 'Blend bananas, berries, and spinach for a natural mood enhancer',
                          category: 'food'
                        },
                        {
                          title: '5-Minute Mindfulness Exercise',
                          description: 'Take just 5 minutes to focus on your breathing and clear your mind',
                          category: 'mindfulness'
                        }
                      ].map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-vibe-light text-vibe-primary text-xs px-2 py-1 rounded-full">
                              {item.category}
                            </div>
                          </div>
                          <h4 className="font-medium mt-2">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How VibeFlow Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-vibe-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-vibe-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Track Your Mood</h3>
                <p className="text-gray-600 text-center">
                  Log how you're feeling through our simple interface. Take a moment to reflect on your emotions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-vibe-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-vibe-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Get Recommendations</h3>
                <p className="text-gray-600 text-center">
                  Our AI analyzes your mood and provides personalized recommendations for food, activities, and mindfulness.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-full bg-vibe-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-vibe-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Improve Well-being</h3>
                <p className="text-gray-600 text-center">
                  Follow recommendations, provide feedback, and watch your wellness journey evolve over time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 vibe-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of users who have improved their well-being with personalized recommendations from VibeFlow.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-vibe-primary hover:bg-gray-100">
              Sign Up for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-vibe-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-bold text-vibe-primary">VibeFlow</span>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-vibe-primary">About</a>
              <a href="#" className="text-gray-600 hover:text-vibe-primary">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-vibe-primary">Terms</a>
              <a href="#" className="text-gray-600 hover:text-vibe-primary">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} VibeFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
