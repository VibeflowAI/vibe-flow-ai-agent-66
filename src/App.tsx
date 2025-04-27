
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

// Mock API handlers for development
const setupMockApi = () => {
  // Only in development mode and if fetch isn't mocked already
  if (typeof window.fetch === 'function') {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      if (typeof url === 'string' && url.includes('/api/gemini')) {
        console.log('Intercepting Gemini API request');
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return originalFetch('/api/gemini.json');
      }
      
      // Pass through all other requests
      return originalFetch(url, options);
    };
  }
};

// Setup mock API handlers
setupMockApi();

const queryClient = new QueryClient();

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MoodProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
