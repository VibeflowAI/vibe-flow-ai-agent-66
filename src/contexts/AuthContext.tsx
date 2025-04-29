import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, healthData?: HealthSurveyData) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateHealthProfile: (data: HealthSurveyData) => Promise<void>;
};

// Mock data for demo purposes (will be replaced by Supabase data)
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password',
    displayName: 'Demo User',
    photoURL: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
    preferences: {
      dietaryRestrictions: ['vegetarian'],
      activityLevel: 'moderate' as const,
      sleepGoals: '8 hours',
      notificationsEnabled: true,
    },
    healthProfile: {
      height: '175',
      weight: '70',
      bloodType: 'O+',
      conditions: ['None'],
      sleepHours: '7-8',
      activityLevel: 'moderate',
      healthGoals: ['Reduce Stress', 'Improve Sleep'],
      lastUpdated: Date.now(),
    },
  },
];

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && session.user) {
          // Convert Supabase user to our User type
          const convertedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata.displayName || session.user.email?.split('@')[0] || 'User',
            photoURL: session.user.user_metadata.photoURL,
            // We'll fetch preferences and health profile separately if needed
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // Convert Supabase user to our User type
        const convertedUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata.displayName || session.user.email?.split('@')[0] || 'User',
          photoURL: session.user.user_metadata.photoURL,
        };
        setUser(convertedUser);
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
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Failed to sign in',
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
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) throw error;
      
      // If sign up is successful, automatically sign in the user
      if (data.user) {
        toast({
          title: 'Account created!',
          description: `Welcome to VibeFlow, ${displayName}!`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
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
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
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
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update health profile',
      });
      return Promise.reject(error);
    }
  };

  const value = {
    user,
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
