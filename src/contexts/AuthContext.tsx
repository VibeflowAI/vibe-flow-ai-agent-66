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
  lastCheckupDate?: string;
  medications?: string[];
  allergies?: string[];
};

export type DbUserProfile = {
  id: string;
  email: string;
  name: string;
  activity_level?: string;
  dietary_preferences?: string[];
  sleep_goal?: string;
  height_cm?: number;
  weight_kg?: number;
  blood_type?: string;
  last_checkup_date?: string;
  medical_conditions?: string[];
  current_medications?: string[];
  allergies?: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, healthData?: HealthSurveyData) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateHealthProfile: (data: HealthSurveyData) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert DB user profile to our app's User type
  const convertDbProfileToUser = (dbProfile: DbUserProfile): User => {
    return {
      id: dbProfile.id,
      email: dbProfile.email,
      displayName: dbProfile.name,
      photoURL: `https://api.dicebear.com/6.x/avataaars/svg?seed=${dbProfile.name}`,
      preferences: {
        dietaryRestrictions: dbProfile.dietary_preferences || [],
        activityLevel: (dbProfile.activity_level as 'low' | 'moderate' | 'high') || 'moderate',
        sleepGoals: dbProfile.sleep_goal || '8 hours',
        notificationsEnabled: true,
      },
      healthProfile: {
        height: dbProfile.height_cm?.toString() || '',
        weight: dbProfile.weight_kg?.toString() || '',
        bloodType: dbProfile.blood_type || '',
        conditions: dbProfile.medical_conditions || [],
        sleepHours: '7-8', // Default value
        activityLevel: dbProfile.activity_level || 'moderate',
        healthGoals: [],
        lastUpdated: Date.now(),
        lastCheckupDate: dbProfile.last_checkup_date,
        medications: dbProfile.current_medications,
        allergies: dbProfile.allergies,
      },
    };
  };

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) return;
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (profile) {
        const userData = convertDbProfileToUser(profile as DbUserProfile);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    // Set up the Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          // First just set basic user info to avoid delays
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata.displayName || session.user.email?.split('@')[0] || 'User',
            photoURL: session.user.user_metadata.photoURL,
          };
          setUser(basicUser);
          
          // Then fetch full profile asynchronously
          setTimeout(() => {
            fetchUserProfile();
          }, 0);
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
        // Set basic user info immediately
        const basicUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata.displayName || session.user.email?.split('@')[0] || 'User',
          photoURL: session.user.user_metadata.photoURL,
        };
        setUser(basicUser);
        
        // Then fetch full profile
        fetchUserProfile();
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
      console.log("Received health data for signup:", healthData);
      
      // Create health profile object - ensure it's defined with empty arrays
      const healthProfile: HealthProfile = {
        height: healthData?.height || '',
        weight: healthData?.weight || '',
        bloodType: healthData?.bloodType || '',
        conditions: Array.isArray(healthData?.conditions) ? healthData.conditions : [],
        sleepHours: healthData?.sleepHours || '7-8',
        activityLevel: healthData?.activityLevel || 'moderate',
        healthGoals: Array.isArray(healthData?.healthGoals) ? healthData.healthGoals : [],
        lastUpdated: Date.now()
      };
      
      // Sign up with Supabase, including metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName,
            healthProfile,
            photoURL: `https://api.dicebear.com/6.x/avataaars/svg?seed=${displayName}`,
          }
        }
      });
      
      if (error) throw error;

      // After successful signup, create the user record in the users table
      if (data.user) {
        // Parse numeric strings to numbers for database
        const heightCm = healthData?.height ? parseFloat(healthData.height) : null;
        const weightKg = healthData?.weight ? parseFloat(healthData.weight) : null;
        
        // CRITICAL FIX: Always pass NULL for empty arrays to PostgreSQL
        // This is the main fix for the "malformed array literal" error
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            name: displayName,
            activity_level: healthData?.activityLevel || 'moderate',
            dietary_preferences: null, // Always null for new users
            sleep_goal: '8 hours',
            height_cm: heightCm,
            weight_kg: weightKg,
            blood_type: healthData?.bloodType || null,
            medical_conditions: null, // Always null for empty arrays
            current_medications: null,
            allergies: null
          });
          
        if (insertError) {
          console.error('Error creating user record:', insertError);
          throw new Error('Database error saving new user: ' + insertError.message);
        }
      }
      
      toast({
        title: 'Account created!',
        description: `Welcome to VibeFlow, ${displayName}!`,
      });
    } catch (error) {
      console.error('Registration error details:', error);
      
      let errorMessage = 'Failed to create account';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for specific PostgreSQL array format errors
        if (
          errorMessage.includes('malformed array literal') || 
          errorMessage.includes('ERROR: malformed array') ||
          errorMessage.includes('Database error saving new user')
        ) {
          errorMessage = 'Error with health data format. Please try again without selecting any health conditions or goals.';
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: errorMessage,
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
      
      // Update user metadata in Supabase auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...data,
        }
      });
      
      if (authError) throw authError;
      
      // Update user profile in users table
      if (data.preferences || data.displayName) {
        // Convert empty arrays to null for PostgreSQL compatibility
        const dietaryRestrictions = data.preferences?.dietaryRestrictions?.length ? 
          data.preferences.dietaryRestrictions : null;
        
        const { error: dbError } = await supabase
          .from('users')
          .update({
            name: data.displayName || user.displayName,
            activity_level: data.preferences?.activityLevel || user.preferences?.activityLevel,
            dietary_preferences: dietaryRestrictions,
            sleep_goal: data.preferences?.sleepGoals || user.preferences?.sleepGoals,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (dbError) throw dbError;
      }
      
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

      // Sanitize and validate arrays before sending
      const sanitizedConditions = Array.isArray(healthData.conditions) && healthData.conditions.length > 0 
        ? healthData.conditions.filter(Boolean).slice(0, 2) // Limit to 2 conditions maximum
        : [];
        
      const sanitizedHealthGoals = Array.isArray(healthData.healthGoals) && healthData.healthGoals.length > 0 
        ? healthData.healthGoals.filter(Boolean).slice(0, 3) // Limit to 3 goals maximum
        : [];

      const healthProfile: HealthProfile = {
        height: healthData.height || '',
        weight: healthData.weight || '',
        bloodType: healthData.bloodType || '',
        conditions: sanitizedConditions,
        sleepHours: healthData.sleepHours || '',
        activityLevel: healthData.activityLevel || 'moderate',
        healthGoals: sanitizedHealthGoals,
        lastUpdated: Date.now(),
      };
      
      // Update user metadata in Supabase auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          healthProfile
        }
      });
      
      if (authError) throw authError;
      
      // Properly format arrays for PostgreSQL - convert empty arrays to null
      const medical_conditions = sanitizedConditions.length > 0 ? 
        sanitizedConditions : null;
      
      // Update corresponding fields in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          height_cm: healthData.height ? parseFloat(healthData.height) : null,
          weight_kg: healthData.weight ? parseFloat(healthData.weight) : null,
          blood_type: healthData.bloodType || null,
          medical_conditions: medical_conditions,
          activity_level: healthData.activityLevel || 'moderate',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (dbError) throw dbError;
      
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
    fetchUserProfile,
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
