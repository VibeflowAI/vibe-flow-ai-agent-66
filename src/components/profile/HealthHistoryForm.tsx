import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const healthHistorySchema = z.object({
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  lastCheckup: z.date({
    required_error: "Please select your last checkup date",
  }),
  conditions: z.array(z.string()).default([]),
  medications: z.string().optional(),
  allergies: z.string().optional(),
});

const conditions = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Asthma",
  "Arthritis",
  "Depression/Anxiety",
];

type HealthHistoryFormData = z.infer<typeof healthHistorySchema>;

export const HealthHistoryForm = () => {
  const { user, updateHealthProfile } = useAuth();
  
  const form = useForm<HealthHistoryFormData>({
    resolver: zodResolver(healthHistorySchema),
    defaultValues: {
      conditions: [],
      medications: "",
      allergies: "",
    },
  });
  
  // Load user health data when component mounts
  useEffect(() => {
    const loadHealthData = async () => {
      if (!user || !user.id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('height_cm, weight_kg, blood_type, last_checkup_date, medical_conditions, current_medications, allergies')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error loading health data:', error);
          return;
        }
        
        if (data) {
          form.setValue('height', data.height_cm?.toString() || '');
          form.setValue('weight', data.weight_kg?.toString() || '');
          form.setValue('bloodType', data.blood_type || '');
          
          if (data.last_checkup_date) {
            form.setValue('lastCheckup', new Date(data.last_checkup_date));
          }
          
          if (data.medical_conditions && Array.isArray(data.medical_conditions)) {
            form.setValue('conditions', data.medical_conditions);
          }
          
          if (data.current_medications) {
            form.setValue('medications', Array.isArray(data.current_medications) 
              ? data.current_medications.join(', ')
              : data.current_medications);
          }
          
          if (data.allergies) {
            form.setValue('allergies', Array.isArray(data.allergies) 
              ? data.allergies.join(', ')
              : data.allergies);
          }
        }
      } catch (error) {
        console.error('Error in loadHealthData:', error);
      }
    };
    
    loadHealthData();
  }, [user, form]);

  const onSubmit = async (data: HealthHistoryFormData) => {
    if (!user || !user.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to be signed in to update your health history.",
      });
      return;
    }
    
    try {
      // FIXED: Properly handle empty arrays for PostgreSQL
      const medications = data.medications && data.medications.trim() !== ''
        ? data.medications.split(',').map(item => item.trim())
        : null;
      
      const allergies = data.allergies && data.allergies.trim() !== ''
        ? data.allergies.split(',').map(item => item.trim())
        : null;
      
      const medical_conditions = data.conditions && data.conditions.length > 0
        ? data.conditions
        : null;
      
      console.log('Updating health profile with data:', {
        height_cm: parseFloat(data.height),
        weight_kg: parseFloat(data.weight),
        blood_type: data.bloodType,
        last_checkup_date: data.lastCheckup.toISOString().split('T')[0],
        medical_conditions,
        current_medications: medications,
        allergies
      });
      
      // Update health data in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          height_cm: parseFloat(data.height),
          weight_kg: parseFloat(data.weight),
          blood_type: data.bloodType,
          last_checkup_date: data.lastCheckup.toISOString().split('T')[0],
          medical_conditions: medical_conditions,
          current_medications: medications,
          allergies: allergies,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating health history:', error);
        throw error;
      }
      
      // Also update in auth context - FIXED: create proper healthProfile object
      await updateHealthProfile({
        height: data.height,
        weight: data.weight,
        bloodType: data.bloodType,
        conditions: data.conditions,
        healthGoals: [],
        sleepHours: user.healthProfile?.sleepHours || '7-8',
        activityLevel: user.healthProfile?.activityLevel || 'moderate',
      });
      
      toast({
        title: "Health history updated",
        description: "Your health information has been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update health history",
      });
    }
  };

  return (
    <Card className="w-full shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-2xl">Health History</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bloodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastCheckup"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Checkup Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conditions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormDescription>
                      Select any conditions that apply to you
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {conditions.map((condition) => (
                      <FormField
                        key={condition}
                        control={form.control}
                        name="conditions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={condition}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(condition)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, condition])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== condition
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {condition}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="List your current medications"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any regular medications or supplements, separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="List any allergies"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate multiple allergies by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full md:w-auto bg-vibe-primary hover:bg-vibe-dark">
              Save Health History
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
