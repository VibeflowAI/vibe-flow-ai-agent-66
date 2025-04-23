
import React, { useState } from 'react';
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

export const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      displayName: user?.displayName || '',
      activityLevel: user?.preferences?.activityLevel || 'moderate',
      dietaryRestrictions: user?.preferences?.dietaryRestrictions || [],
      sleepGoals: user?.preferences?.sleepGoals || '8 hours',
      notificationsEnabled: user?.preferences?.notificationsEnabled || false
    }
  });

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
    
    try {
      const preferences: UserPreferences = {
        activityLevel: data.activityLevel as 'low' | 'moderate' | 'high',
        dietaryRestrictions: data.dietaryRestrictions || [],
        sleepGoals: data.sleepGoals,
        notificationsEnabled: data.notificationsEnabled
      };
      
      await updateProfile({
        displayName: data.displayName,
        preferences
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.photoURL || ''} alt={user.displayName} />
          <AvatarFallback className="bg-vibe-primary text-white text-xl">
            {user.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="mt-4 text-2xl">{user.displayName}</CardTitle>
        <p className="text-gray-500">{user.email}</p>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Display Name */}
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
              
              {/* Activity Level */}
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
              
              {/* Dietary Restrictions */}
              <FormItem>
                <FormLabel>Dietary Preferences</FormLabel>
                <div className="grid grid-cols-2 gap-2">
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
                                  const currentValue = field.value || [];
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
              
              {/* Sleep Goals */}
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
              
              {/* Notifications */}
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enable notifications
                      </FormLabel>
                      <FormDescription>
                        Receive personalized wellness reminders
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
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
              <h3 className="text-lg font-medium">Profile Information</h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Activity Level</span>
                  <span className="capitalize">{user.preferences?.activityLevel || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Dietary Preferences</span>
                  <span>
                    {user.preferences?.dietaryRestrictions?.length
                      ? user.preferences.dietaryRestrictions.map(pref => pref.charAt(0).toUpperCase() + pref.slice(1)).join(', ')
                      : 'None specified'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Sleep Goal</span>
                  <span>{user.preferences?.sleepGoals || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Notifications</span>
                  <span>{user.preferences?.notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
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
  );
};
