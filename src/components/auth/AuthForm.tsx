import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthSurvey, HealthSurveyData } from './HealthSurvey';

type AuthFormProps = {
  type: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const AuthForm = ({ type, onSuccess, onError }: AuthFormProps) => {
  const { signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHealthSurvey, setShowHealthSurvey] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (type === 'signup' && !displayName) {
      newErrors.displayName = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    
    if (!validate()) return;

    if (type === 'signin') {
      try {
        await signIn(email, password);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Authentication error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
        setSubmissionError(errorMessage);
        if (onError) onError(errorMessage);
      }
    } else if (type === 'signup') {
      // For signup, show health survey instead of immediately creating account
      setShowHealthSurvey(true);
    }
  };

  const handleHealthSurveyComplete = async (healthData: HealthSurveyData) => {
    try {
      console.log("Health survey complete, registering user with data:", healthData);
      
      // Extra validation to make sure arrays are properly formatted to avoid database issues
      const validatedHealthData: HealthSurveyData = {
        ...healthData,
        // Make sure we filter out any null/undefined/empty values and limit array sizes
        conditions: Array.isArray(healthData.conditions) ? 
          healthData.conditions.filter(item => item && item.trim() !== '').slice(0, 2) : 
          [],
        healthGoals: Array.isArray(healthData.healthGoals) ? 
          healthData.healthGoals.filter(item => item && item.trim() !== '').slice(0, 3) : 
          []
      };
      
      await signUp(email, password, displayName, validatedHealthData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setSubmissionError(errorMessage);
      // Pass the error to the parent component
      if (onError) onError(errorMessage);
      // Go back to signup form on error
      setShowHealthSurvey(false);
    }
  };

  if (showHealthSurvey) {
    return (
      <HealthSurvey 
        onComplete={handleHealthSurveyComplete} 
        onBack={() => setShowHealthSurvey(false)} 
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {type === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {type === 'signin' 
            ? 'Enter your credentials to access your account' 
            : 'Fill in the information to create your account'}
        </CardDescription>
        
        {submissionError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
            {submissionError}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="displayName">
                Full Name
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={errors.displayName ? 'border-red-500' : ''}
                placeholder="Your name"
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
              placeholder={type === 'signup' ? 'Create a password' : 'Your password'}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {type === 'signin' && (
            <div className="text-right">
              <a href="#" className="text-sm text-vibe-primary hover:underline">
                Forgot password?
              </a>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full bg-vibe-primary hover:bg-vibe-dark"
            disabled={loading}
          >
            {loading ? 'Processing...' : type === 'signin' ? 'Sign In' : 'Continue'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 pb-4">
        <p className="text-sm text-gray-500">
          {type === 'signin' ? (
            <>
              Don't have an account?{' '}
              <a href="/signup" className="text-vibe-primary hover:underline">
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="/signin" className="text-vibe-primary hover:underline">
                Sign in
              </a>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
};
