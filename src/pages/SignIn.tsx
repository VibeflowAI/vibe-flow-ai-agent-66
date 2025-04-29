
import React, { useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const SignIn = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard immediately
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSuccess = () => {
    navigate('/dashboard');
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
        <p className="text-gray-600">Sign in to access your personalized wellness recommendations</p>
      </div>
      
      <AuthForm type="signin" onSuccess={handleSuccess} />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Demo credentials: demo@example.com / password</p>
      </div>
    </div>
  );
};

export default SignIn;
