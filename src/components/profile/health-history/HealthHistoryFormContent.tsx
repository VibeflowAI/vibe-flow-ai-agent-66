
import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { HealthHistorySchema, type HealthHistoryFormData } from './schema';
import { useHealthHistoryData } from './useHealthHistoryData';
import { BasicInfoFields } from './fields/BasicInfoFields';
import { LastCheckupField } from './fields/LastCheckupField';
import { MedicalConditionsField } from './fields/MedicalConditionsField';
import { MedicationsField } from './fields/MedicationsField';
import { AllergiesField } from './fields/AllergiesField';

export const HealthHistoryFormContent = () => {
  const { user, updateHealthProfile } = useAuth();
  const { loadHealthData, saveHealthData, isLoading } = useHealthHistoryData();
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  const form = useForm<HealthHistoryFormData>({
    resolver: zodResolver(HealthHistorySchema),
    defaultValues: {
      height: '',
      weight: '',
      bloodType: '',
      conditions: [],
      medications: "",
      allergies: "",
      lastCheckup: new Date(),
    },
  });
  
  // Load user health data when component mounts
  const fetchData = useCallback(async () => {
    if (!user || !user.id || isDataFetched) return;
    
    try {
      setIsFormLoading(true);
      console.log('Loading health data for user:', user.id);
      const healthData = await loadHealthData(user.id);
      
      if (healthData) {
        // Set all form values with explicit type handling
        form.setValue('height', healthData.height_cm?.toString() || '');
        form.setValue('weight', healthData.weight_kg?.toString() || '');
        
        // Explicitly handle blood type field - this was the issue
        if (healthData.blood_type) {
          console.log('Setting blood type:', healthData.blood_type);
          form.setValue('bloodType', healthData.blood_type);
        }
        
        if (healthData.last_checkup_date) {
          form.setValue('lastCheckup', new Date(healthData.last_checkup_date));
        }
        
        if (healthData.medical_conditions && Array.isArray(healthData.medical_conditions)) {
          form.setValue('conditions', healthData.medical_conditions);
        }
        
        if (healthData.current_medications) {
          form.setValue('medications', Array.isArray(healthData.current_medications) 
            ? healthData.current_medications.join(', ')
            : healthData.current_medications);
        }
        
        if (healthData.allergies) {
          form.setValue('allergies', Array.isArray(healthData.allergies) 
            ? healthData.allergies.join(', ')
            : healthData.allergies);
        }
      }
      
      setIsDataFetched(true);
    } catch (error) {
      console.error('Error in loadHealthData:', error);
      toast({
        variant: "destructive",
        title: "Failed to load health data",
        description: "Please try again later or contact support.",
      });
    } finally {
      setIsFormLoading(false);
    }
  }, [user, form, loadHealthData, isDataFetched]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: HealthHistoryFormData) => {
    if (!user || !user.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to be signed in to update your health history.",
      });
      return;
    }
    
    // Prevent duplicate submissions
    if (isLoading) return;
    
    try {
      // Save health data
      await saveHealthData(user.id, data);
      
      // Also update in auth context with explicit blood type
      await updateHealthProfile({
        height: data.height,
        weight: data.weight,
        bloodType: data.bloodType, // Pass the blood type explicitly
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

  if (isFormLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-vibe-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFields control={form.control} />
        <LastCheckupField control={form.control} />
        <MedicalConditionsField control={form.control} />
        <MedicationsField control={form.control} />
        <AllergiesField control={form.control} />

        <Button 
          type="submit" 
          className="w-full md:w-auto bg-vibe-primary hover:bg-vibe-dark"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Health History"}
        </Button>
      </form>
    </Form>
  );
};
