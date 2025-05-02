import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { HealthSurveyData } from '@/components/auth/HealthSurvey';
import { supabase } from '@/integrations/supabase/client';

export type UserPreferences = {
  dietaryRestrictions?: string[];
  activityLevel?: 'low' | 'moderate' | 'high';
  sleepGoals?: string;
  notificationsEnabled?: boolean;
};

type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: UserPreferences;
  healthProfile?: {
    height: string;
    weight: string;
    bloodType: string;
    conditions: string[];
    sleepHours: string;
    activityLevel: string;
    healthGoals: string[];
    lastUpdated: number;
    lastCheckupDate?: string;
    medications?: string[];
    allergies?: string[];
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, healthData?: HealthSurveyData | null) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateHealthProfile: (data: HealthSurveyData) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) return;
      
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single();
      
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          displayName: profile.name,
          photoURL: `https://api.dicebear.com/6.x/avataaars/svg?seed=${profile.name}`,
          preferences: {
            dietaryRestrictions: profile.dietary_preferences || [],
            activityLevel: profile.activity_level as 'low' | 'moderate' | 'high',
            sleepGoals: profile.sleep_goal
          },
          healthProfile: {
            height: profile.height_cm?.toString() || '',
            weight: profile.weight_kg?.toString() || '',
            bloodType: profile.blood_type || '',
            conditions: profile.medical_conditions || [],
            sleepHours: profile.sleep_goal || '7-8',
            activityLevel: profile.activity_level || 'moderate',
            healthGoals: [],
            lastUpdated: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const basicUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.displayName || session.user.email?.split('@')[0] || 'User',
          photoURL: session.user.user_metadata?.photoURL
        };
        setUser(basicUser);
        fetchUserProfile();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Welcome back!' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error instanceof Error ? error.message : 'Invalid credentials'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, healthData?: HealthSurveyData | null) => {
    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { displayName }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name: displayName,
        activity_level: healthData?.activityLevel || 'moderate',
        dietary_preferences: null,
        sleep_goal: '8 hours',
        height_cm: healthData?.height ? parseFloat(healthData.height) : null,
        weight_kg: healthData?.weight ? parseFloat(healthData.weight) : null,
        blood_type: healthData?.bloodType || null,
        medical_conditions: null,
        current_medications: null,
        allergies: null
      });

      if (dbError) throw new Error('Database error: ' + dbError.message);

      toast({
        title: 'Account created!',
        description: `Welcome ${displayName}!`
      });
    } catch (error) {
      console.error('Signup error:', error);
      let message = 'Failed to create account';
      if (error instanceof Error) {
        message = error.message.includes('Database') ? 
          'System error. Please try again.' : 
          error.message;
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed out successfully' });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      await supabase.auth.updateUser({
        data: { displayName: data.displayName }
      });

      await supabase.from('users').update({
        name: data.displayName,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      setUser(prev => prev ? { ...prev, ...data } : null);
      toast({ title: 'Profile updated' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update'
      });
      throw error;
    }
  };

  const updateHealthProfile = async (data: HealthSurveyData) => {
    try {
      if (!user) throw new Error('Not authenticated');
      
      await supabase.from('users').update({
        height_cm: data.height ? parseFloat(data.height) : null,
        weight_kg: data.weight ? parseFloat(data.weight) : null,
        blood_type: data.bloodType || null,
        activity_level: data.activityLevel,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      setUser(prev => prev ? {
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          height: data.height || '',
          weight: data.weight || '',
          bloodType: data.bloodType || '',
          activityLevel: data.activityLevel,
          lastUpdated: Date.now()
        }
      } : null);

      toast({ title: 'Health profile updated' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update health data'
      });
      throw error;
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
    fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
