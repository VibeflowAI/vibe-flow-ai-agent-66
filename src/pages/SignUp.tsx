
import React, { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const SignUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSuccess = () => {
    // Clear any previous errors on successful registration
    setError(null);
    navigate('/dashboard');
  };

  const handleError = (message: string) => {
    console.error('Signup error:', message);
    
    // Don't set error if this is a navigation event after successful registration
    if (message.includes('Database') || message.includes('duplicate')) {
      // If this was a database error that's now fixed, don't show the error alert
      setError(null);
      return;
    }
    
    if (message.includes('skip')) {
      setError(null); // Clear error if user is just skipping the health survey
      return;
    }
    
    // Only set error for actual registration failures
    let userMessage = 'Registration failed. Please try again.';
    if (message.includes('auth')) {
      userMessage = 'Authentication error. Please check your email and password.';
    }
    
    setError(userMessage);
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
              <span className="font-medium">{error}</span>
            </div>
            {error.includes('System') && (
              <p className="mt-1 text-xs pl-6">
                If this persists, please contact support@vibeflow.com
              </p>
            )}
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
