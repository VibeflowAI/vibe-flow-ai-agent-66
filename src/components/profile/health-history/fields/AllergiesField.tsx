
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type HealthHistoryFormData } from '../schema';

interface AllergiesFieldProps {
  control: Control<HealthHistoryFormData>;
}

export const AllergiesField = ({ control }: AllergiesFieldProps) => {
  return (
    <FormField
      control={control}
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
  );
};
