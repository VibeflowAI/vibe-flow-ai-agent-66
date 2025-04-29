
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { HealthSurveyData } from '@/components/auth/HealthSurvey';
import { supabase } from '@/integrations/supabase/client';

// Types
export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: UserPreferences;
  healthProfile?: HealthProfile;
};

export type UserPreferences = {
  dietaryRestrictions?: string[];
  activityLevel?: 'low' | 'moderate' | 'high';
  sleepGoals?: string;
  notificationsEnabled?: boolean;
};

export type HealthProfile = {
  height: string;
  weight: string;
  bloodType: string;
  conditions: string[];
  sleepHours: string;
  activityLevel: string;
  healthGoals: string[];
  lastUpdated: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, healthData?: HealthSurveyData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateHealthProfile: (data: HealthSurveyData) => Promise<void>;
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the Supabase auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        
        setSession(newSession);
        
        if (newSession && newSession.user) {
          // Convert Supabase user to our User type
          const convertedUser: User = {
            id: newSession.user.id,
            email: newSession.user.email || '',
            displayName: newSession.user.user_metadata.displayName || newSession.user.email?.split('@')[0] || 'User',
            photoURL: newSession.user.user_metadata.photoURL,
          };
          setUser(convertedUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession && currentSession.user) {
        console.log('Existing session found:', currentSession.user.email);
        
        // Convert Supabase user to our User type
        const convertedUser: User = {
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          displayName: currentSession.user.user_metadata.displayName || currentSession.user.email?.split('@')[0] || 'User',
          photoURL: currentSession.user.user_metadata.photoURL,
        };
        
        setUser(convertedUser);
        setSession(currentSession);
      }
      
      setLoading(false);
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: `Glad to see you again, ${data.user?.user_metadata.displayName || data.user?.email?.split('@')[0] || 'User'}!`,
      });
      
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      console.error('Sign in error:', errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: errorMessage.includes('Invalid login') 
          ? 'Invalid email or password. Please try again.' 
          : errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, healthData?: HealthSurveyData) => {
    setLoading(true);
    try {
      // Create user metadata with user information
      const metadata = {
        displayName,
        photoURL: `https://api.dicebear.com/6.x/avataaars/svg?seed=${displayName}`,
      };
      
      // Sign up with Supabase, including metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: 'Account created!',
          description: `Welcome to VibeFlow, ${displayName}!`,
        });
        
        // We're not automatically logged in at this point
        // The session will be established through onAuthStateChange
        return Promise.resolve();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      console.error('Sign up error:', errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: errorMessage.includes('already registered') 
          ? 'This email is already registered. Please sign in instead.' 
          : errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No authenticated user');
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...data,
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Update profile error:', errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: errorMessage,
      });
      
      return Promise.reject(error);
    }
  };

  const updateHealthProfile = async (healthData: HealthSurveyData) => {
    try {
      if (!user) throw new Error('No authenticated user');

      const healthProfile: HealthProfile = {
        height: healthData.height || '',
        weight: healthData.weight || '',
        bloodType: healthData.bloodType || '',
        conditions: healthData.conditions || [],
        sleepHours: healthData.sleepHours || '',
        activityLevel: healthData.activityLevel || 'moderate',
        healthGoals: healthData.healthGoals || [],
        lastUpdated: Date.now(),
      };
      
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          healthProfile
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setUser(prev => prev ? { 
        ...prev, 
        healthProfile 
      } : null);
      
      toast({
        title: 'Health profile updated',
        description: 'Your health information has been updated successfully.',
      });
      
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update health profile';
      console.error('Update health profile error:', errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: errorMessage,
      });
      
      return Promise.reject(error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateHealthProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
