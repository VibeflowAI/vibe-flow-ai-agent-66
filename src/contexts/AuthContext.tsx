
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Types
export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: UserPreferences;
};

export type UserPreferences = {
  dietaryRestrictions?: string[];
  activityLevel?: 'low' | 'moderate' | 'high';
  sleepGoals?: string;
  notificationsEnabled?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

// Mock data for demo purposes
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
  },
];

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage (simulating persistent auth)
    const savedUser = localStorage.getItem('vibeflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('vibeflow_user', JSON.stringify(userWithoutPassword));
      toast({
        title: 'Welcome back!',
        description: `Glad to see you again, ${userWithoutPassword.displayName}!`,
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

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some((u) => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        displayName,
        photoURL: `https://api.dicebear.com/6.x/avataaars/svg?seed=${displayName}`,
        preferences: {
          dietaryRestrictions: [],
          activityLevel: 'moderate' as const,
          sleepGoals: '8 hours',
          notificationsEnabled: true,
        },
      };
      
      // In a real app, we would save to database here
      MOCK_USERS.push({ ...newUser, password });
      
      setUser(newUser);
      localStorage.setItem('vibeflow_user', JSON.stringify(newUser));
      toast({
        title: 'Account created!',
        description: `Welcome to VibeFlow, ${displayName}!`,
      });
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

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('vibeflow_user');
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (!user) throw new Error('No authenticated user');
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('vibeflow_user', JSON.stringify(updatedUser));
      
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

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
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
