
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // If user is authenticated, they'll be redirected to dashboard
  return (
    <div className="min-h-screen flex flex-col bg-vibe-background">
      {/* Header */}
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
      <section className="py-20 md:py-28 vibe-gradient">
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
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-vibe-primary text-white hover:bg-vibe-dark">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden transform rotate-2 animate-float">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60"
                  alt="Wellness lifestyle"
                  className="w-full h-auto"
                />
              </div>
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
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-vibe-light flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-vibe-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Track Your Mood</h3>
              <p className="text-gray-600">
                Log how you're feeling through our simple interface. Take a moment to reflect on your emotions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-vibe-light flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-vibe-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Get AI-Powered Insights</h3>
              <p className="text-gray-600">
                Our AI analyzes your mood patterns over time and provides personalized insights that evolve with your emotional journey.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-vibe-light flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-vibe-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Improve Well-being</h3>
              <p className="text-gray-600">
                Follow recommendations, provide feedback, and watch your wellness journey evolve over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-20 bg-vibe-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            The VibeFlow Experience
          </h2>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
            Our intuitive interface makes it easy to track your mood, get personalized recommendations, and improve your well-being.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-60 bg-vibe-light rounded-md flex items-center justify-center mb-4">
                <span className="text-vibe-primary font-bold">Dashboard View</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Dashboard</h3>
              <p className="text-gray-600">
                Track your mood patterns and wellness journey with intuitive visualizations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-60 bg-vibe-light rounded-md flex items-center justify-center mb-4">
                <span className="text-vibe-primary font-bold">Recommendations View</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">
                View actionable suggestions for food, activities, and mindfulness practices—each tailored to your current emotional state.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-60 bg-vibe-light rounded-md flex items-center justify-center mb-4">
                <span className="text-vibe-primary font-bold">AI Chat View</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Wellness Assistant</h3>
              <p className="text-gray-600">
                Chat with our AI wellness coach for personalized guidance and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-vibe-gray p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-vibe-primary mr-3"></div>
                <div>
                  <h4 className="font-semibold">Sarah J.</h4>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "VibeFlow has been a game-changer for my workday. It helps me take mindful breaks and choose the right foods when I'm stressed."
              </p>
            </div>
            <div className="bg-vibe-gray p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-vibe-primary mr-3"></div>
                <div>
                  <h4 className="font-semibold">Michael T.</h4>
                  <p className="text-sm text-gray-500">Fitness Instructor</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I recommend VibeFlow to all my clients. The personalized activity suggestions perfectly complement their fitness routines."
              </p>
            </div>
            <div className="bg-vibe-gray p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-vibe-primary mr-3"></div>
                <div>
                  <h4 className="font-semibold">Elena R.</h4>
                  <p className="text-sm text-gray-500">Working Parent</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As a busy parent, I often neglect self-care. VibeFlow reminds me to check in with myself and suggests quick wellness activities."
              </p>
            </div>
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
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-center sm:space-x-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-vibe-primary hover:bg-gray-100">
                Sign Up for Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-vibe-primary">
                Try Demo
              </Button>
            </Link>
          </div>
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
