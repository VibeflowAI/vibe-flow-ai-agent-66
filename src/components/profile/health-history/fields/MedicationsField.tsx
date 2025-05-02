
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type HealthHistoryFormData } from '../schema';

interface MedicationsFieldProps {
  control: Control<HealthHistoryFormData>;
}

export const MedicationsField = ({ control }: MedicationsFieldProps) => {
  return (
    <FormField
      control={control}
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
  );
};
