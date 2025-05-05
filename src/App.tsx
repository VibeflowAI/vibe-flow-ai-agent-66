import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MoodProvider } from "./contexts/MoodContext";
import { Layout } from "./components/layout/Layout";

// Pages
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";

// Mock API handlers for development
const setupMockApi = () => {
  // Only in development mode and if fetch isn't mocked already
  if (typeof window.fetch === 'function') {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      if (typeof url === 'string') {
        // Mock Gemini API requests
        if (url.includes('/api/gemini')) {
          console.log('Intercepting Gemini API request');
          // Simulate delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          return originalFetch('/api/gemini.json');
        }
        
        // Mock Edge Function API requests for mood-agent
        if (url.includes('/api/edge/mood-agent')) {
          console.log('Intercepting mood-agent API request');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const requestData = options?.body ? JSON.parse(String(options.body)) : {};
          
          // Generate a response based on the user's message and context
          return new Response(JSON.stringify({
            response: `Based on your current mood of ${requestData.currentMood || 'neutral'} and your message, I'd suggest focusing on self-care activities that boost your energy. A short walk outside or a quick stretching session might help. How does that sound?`
          }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
        
        // Mock Supabase API requests
        if (url.includes('/auth/') || url.includes('/rest/')) {
          console.log('Intercepting Supabase API request to:', url);
          
          // Mock authentication
          if (url.includes('/auth/v1/token')) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return new Response(JSON.stringify({
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              user: {
                id: 'mock-user-id',
                email: options?.body ? JSON.parse(String(options.body)).email : 'user@example.com',
                role: 'authenticated'
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          
          // Mock user data
          if (url.includes('/rest/v1/users')) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return new Response(JSON.stringify([{
              id: 'mock-user-id',
              email: 'user@example.com',
              displayName: 'Demo User',
              preferences: {
                dietaryRestrictions: ['vegetarian'],
                activityLevel: 'moderate',
                sleepGoals: '8 hours',
                notificationsEnabled: true
              },
              healthProfile: {
                height: '175cm',
                weight: '70kg',
                bloodType: 'O+',
                conditions: ['occasional insomnia'],
                sleepHours: '7',
                activityLevel: 'moderate',
                healthGoals: ['reduce stress', 'improve sleep'],
                lastUpdated: Date.now()
              }
            }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          
          // Mock mood data
          if (url.includes('/rest/v1/moods')) {
            await new Promise(resolve => setTimeout(resolve, 700));
            return new Response(JSON.stringify([
              {
                id: 'mood-1',
                userId: 'mock-user-id',
                mood: 'happy',
                energy: 'high',
                note: 'Feeling great today!',
                timestamp: Date.now() - 3600000
              },
              {
                id: 'mood-2',
                userId: 'mock-user-id',
                mood: 'calm',
                energy: 'medium',
                note: 'Relaxed after meditation',
                timestamp: Date.now() - 86400000
              },
              {
                id: 'mood-3',
                userId: 'mock-user-id',
                mood: 'tired',
                energy: 'low',
                note: 'Didn\'t sleep well',
                timestamp: Date.now() - 172800000
              }
            ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          
          // Mock recommendations
          if (url.includes('/rest/v1/recommendations')) {
            await new Promise(resolve => setTimeout(resolve, 900));
            return new Response(JSON.stringify([
              {
                id: 'rec-1',
                title: 'Morning Yoga Routine',
                description: 'Start your day with this 15-minute gentle yoga flow to enhance your mood and energy.',
                category: 'activity',
                moodTypes: ['tired', 'stressed'],
                energyLevels: ['low', 'medium'],
                imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'
              },
              {
                id: 'rec-2',
                title: 'Mood-Boosting Smoothie',
                description: 'Blend bananas, berries, and a handful of spinach with almond milk for a natural mood enhancer.',
                category: 'food',
                moodTypes: ['sad', 'tired'],
                energyLevels: ['low'],
                imageUrl: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=500'
              },
              {
                id: 'rec-3',
                title: '5-Minute Mindfulness Exercise',
                description: 'Take just 5 minutes to focus on your breathing and clear your mind for improved well-being.',
                category: 'mindfulness',
                moodTypes: ['stressed', 'anxious'],
                energyLevels: ['medium', 'high'],
                imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500'
              },
              {
                id: 'rec-4',
                title: 'Energizing Power Walk',
                description: 'A brisk 20-minute walk outdoors can significantly boost your energy and mood.',
                category: 'activity',
                moodTypes: ['sad', 'tired'],
                energyLevels: ['low', 'medium'],
                imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500'
              },
              {
                id: 'rec-5',
                title: 'Anti-Inflammatory Turmeric Tea',
                description: 'This warming tea with turmeric, ginger, and honey helps reduce inflammation and improves mood.',
                category: 'food',
                moodTypes: ['tired', 'stressed'],
                energyLevels: ['low'],
                imageUrl: 'https://images.unsplash.com/photo-1563563961765-ef5b68079a23?w=500'
              }
            ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          
          // Default mock response for Supabase requests
          return new Response(JSON.stringify({ success: true }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
      }
      
      // Pass through all other requests
      return originalFetch(url, options);
    };
  }
};

// Setup mock API handlers
setupMockApi();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MoodProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/chat" element={<Layout><Chat /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/stats" element={<Layout><Stats /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MoodProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
