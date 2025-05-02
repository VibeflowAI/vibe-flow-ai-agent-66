
import React, { useState, useEffect } from 'react';
import { useAuth, UserPreferences } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const UserProfile = () => {
  const { user, updateProfile, fetchUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch the latest user profile when the component mounts
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, user]);
  
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
        dietaryRestrictions: user.preferences?.dietaryRestrictions || [],
        sleepGoals: user.preferences?.sleepGoals || '8 hours',
      });
    }
  }, [form, user]);

  if (!user) return null;

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
      
      // Close dialog only after all updates are complete
      setIsDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred"
      });
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full shadow-md">
        <CardHeader className="flex flex-col items-center text-center bg-gradient-to-r from-vibe-primary/10 to-vibe-primary/5 pb-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName} />
            <AvatarFallback className="bg-vibe-primary text-white text-xl">
              {user.displayName ? user.displayName.charAt(0) : 'U'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-2xl">{user.displayName || 'User'}</CardTitle>
          <p className="text-gray-500">{user.email}</p>
        </CardHeader>
        
        <CardContent className="pt-6">
          {isEditing ? (
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
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Activity Level</span>
                    <span className="capitalize font-medium">{user.preferences?.activityLevel || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Dietary Preferences</span>
                    <span className="font-medium">
                      {user.preferences?.dietaryRestrictions?.length
                        ? user.preferences.dietaryRestrictions.map(pref => pref.charAt(0).toUpperCase() + pref.slice(1)).join(', ')
                        : 'None specified'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Sleep Goal</span>
                    <span className="font-medium">{user.preferences?.sleepGoals || 'Not set'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-vibe-primary hover:bg-vibe-dark"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Updating Profile</DialogTitle>
            <DialogDescription>
              Please wait while your profile information is being updated...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-vibe-primary animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
