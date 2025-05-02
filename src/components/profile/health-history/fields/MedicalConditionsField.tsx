
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { type HealthHistoryFormData, MedicalConditions } from '../schema';

interface MedicalConditionsFieldProps {
  control: Control<HealthHistoryFormData>;
}

export const MedicalConditionsField = ({ control }: MedicalConditionsFieldProps) => {
  return (
    <FormField
      control={control}
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
            {MedicalConditions.map((condition) => (
              <FormField
                key={condition}
                control={control}
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
  );
};
