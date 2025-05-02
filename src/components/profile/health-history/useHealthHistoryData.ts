
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HealthHistoryFormData } from './schema';

export const useHealthHistoryData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadHealthData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('height_cm, weight_kg, blood_type, last_checkup_date, medical_conditions, current_medications, allergies')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error loading health data:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in loadHealthData:', error);
      throw error;
    }
  };

  const saveHealthData = async (userId: string, data: HealthHistoryFormData) => {
    // Prevent multiple simultaneous save attempts
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Format data for database
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
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating health history:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveHealthData:', error);
      throw error;
    } finally {
      // Add a small delay to prevent the loading state from flashing too quickly
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  return {
    loadHealthData,
    saveHealthData,
    isLoading
  };
};
