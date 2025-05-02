
import React, { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

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
    
    // Improved error message handling for PostgreSQL array format issues
    let userFriendlyMessage = message;
    
    if (
      message.includes('malformed array literal') || 
      message.includes('Database error saving new user') ||
      message.includes('ERROR: malformed array') ||
      message.toLowerCase().includes('error with health data')
    ) {
      userFriendlyMessage = 'There was a problem with your health data. Please try again with different selections or leave some fields empty.';
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4" />
              <p className="font-medium">{error}</p>
            </div>
            <p className="mt-1 text-xs pl-6">
              Tip: Try leaving some fields empty or selecting different options.
            </p>
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
