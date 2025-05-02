
import React, { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const SignUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleError = (message: string) => {
    // Log the full error message for debugging
    console.error('Registration error:', message);
    
    // Check for specific PostgreSQL errors related to array format
    let userFriendlyMessage = message;
    if (message.includes('malformed array literal') || message.includes('Database error saving new user')) {
      userFriendlyMessage = 'There was a problem with your health data. Please try again with different options.';
    }
    
    setError(userFriendlyMessage);
    toast({
      variant: 'destructive',
      title: 'Registration failed',
      description: userFriendlyMessage,
    });
  };

  return (
    <div className="min-h-screen bg-vibe-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="h-10 w-10 rounded-full bg-vibe-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-vibe-primary">VibeFlow</h1>
        </div>
        <p className="text-gray-600">Create an account to start your wellness journey</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      <AuthForm 
        type="signup" 
        onSuccess={handleSuccess} 
        onError={handleError} 
      />
    </div>
  );
};

export default SignUp;
