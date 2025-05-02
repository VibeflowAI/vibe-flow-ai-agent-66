
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import { useAuth, UserPreferences } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileFormProps {
  user: any;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const ProfileForm = ({ 
  user, 
  isLoading, 
  setIsLoading, 
  setIsDialogOpen, 
  setIsEditing 
}: ProfileFormProps) => {
  const { updateProfile, fetchUserProfile } = useAuth();
  
  const form = useForm({
    defaultValues: {
      displayName: user?.displayName || '',
      activityLevel: user?.preferences?.activityLevel || 'moderate',
      dietaryRestrictions: user?.preferences?.dietaryRestrictions || [],
      sleepGoals: user?.preferences?.sleepGoals || '8 hours',
    }
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        activityLevel: user.preferences?.activityLevel || 'moderate',
        dietaryRestrictions: Array.isArray(user.preferences?.dietaryRestrictions) 
          ? user.preferences.dietaryRestrictions 
          : [],
        sleepGoals: user.preferences?.sleepGoals || '8 hours',
      });
    }
  }, [form, user]);

  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'keto',
    'paleo',
    'pescatarian'
  ];

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setIsDialogOpen(true);
    
    try {
      console.log('Form data before processing:', data);
      
      // Handle empty arrays properly for PostgreSQL
      const dietaryRestrictions = Array.isArray(data.dietaryRestrictions) && data.dietaryRestrictions.length > 0
        ? data.dietaryRestrictions
        : null;
        
      const preferences: UserPreferences = {
        activityLevel: data.activityLevel as 'low' | 'moderate' | 'high',
        dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
        sleepGoals: data.sleepGoals,
        notificationsEnabled: user.preferences?.notificationsEnabled || false
      };
      
      console.log('Updating profile with preferences:', preferences);
      
      // Update Supabase user data
      const { error } = await supabase
        .from('users')
        .update({
          name: data.displayName,
          activity_level: data.activityLevel,
          dietary_preferences: dietaryRestrictions, // Send null if empty array
          sleep_goal: data.sleepGoals,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating user in Supabase:', error);
        throw error;
      }
      
      // Update profile in auth context
      await updateProfile({
        displayName: data.displayName,
        preferences
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Fetch user profile again to ensure we have the latest data
      await fetchUserProfile();
      
      // Add delay before closing dialog and editing mode to ensure data is properly fetched
      setTimeout(() => {
        setIsDialogOpen(false);
        setIsEditing(false);
      }, 1000);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred"
      });
      setIsDialogOpen(false);
      // Don't exit editing mode on error, let user try again
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContent className="pt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="activityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel>Dietary Preferences</FormLabel>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {dietaryOptions.map((option) => (
                <FormField
                  key={option}
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option)}
                            onCheckedChange={(checked) => {
                              const currentValue = Array.isArray(field.value) ? field.value : [];
                              return checked
                                ? field.onChange([...currentValue, option])
                                : field.onChange(
                                    currentValue.filter((value) => value !== option)
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal capitalize">
                          {option}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </FormItem>
          
          <FormField
            control={form.control}
            name="sleepGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sleep Goals</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sleep goal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="6 hours">6 hours</SelectItem>
                    <SelectItem value="7 hours">7 hours</SelectItem>
                    <SelectItem value="8 hours">8 hours</SelectItem>
                    <SelectItem value="9 hours">9 hours</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-vibe-primary hover:bg-vibe-dark"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  );
};
