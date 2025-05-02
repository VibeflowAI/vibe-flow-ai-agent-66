
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

type HealthSurveyProps = {
  onComplete: (data: HealthSurveyData) => void;
  onBack: () => void;
};

export type HealthSurveyData = {
  height?: string;
  weight?: string;
  bloodType?: string;
  conditions: string[];
  sleepHours: string;
  activityLevel: string;
  healthGoals: string[];
};

const conditions = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Asthma",
  "Arthritis",
  "Depression/Anxiety",
  "None",
];

const healthGoals = [
  "Lose Weight",
  "Gain Muscle",
  "Improve Sleep",
  "Reduce Stress",
  "Eat Healthier",
  "Increase Energy",
];

export const HealthSurvey = ({ onComplete, onBack }: HealthSurveyProps) => {
  const form = useForm<HealthSurveyData>({
    defaultValues: {
      conditions: [],
      sleepHours: '7-8',
      activityLevel: 'moderate',
      healthGoals: [],
    },
  });

  // Handle skipping health survey and continuing with minimal data
  const handleSkip = () => {
    // Create a minimal health data object with only required fields
    const minimalData: HealthSurveyData = {
      conditions: [],
      sleepHours: '7-8',
      activityLevel: 'moderate',
      healthGoals: []
    };
    
    console.log("Skipping health survey with minimal data:", minimalData);
    
    // Pass the minimally required data to continue registration
    onComplete(minimalData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Health Profile</CardTitle>
        <CardDescription className="text-center">
          <div className="mt-2 text-lg font-bold text-amber-600">
            IMPORTANT: Please use the "Skip" button to continue registration.
          </div>
          <div className="mt-2 text-sm">
            We're currently experiencing technical issues with health data submission.
          </div>
        </CardDescription>
        
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div className="font-bold">
              Technical Issue: Please use the Skip button below to create your account.
            </div>
          </div>
          <div className="mt-2 pl-6">
            You can add your health information later from your profile page.
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between pt-4 space-x-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
              
          <Button 
            type="button" 
            variant="default"
            onClick={handleSkip}
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            Skip & Continue
          </Button>
        </div>
        
        <div className="mt-8 border-t pt-4 opacity-50">
          <div className="text-center text-sm text-gray-500 mb-4">
            Health survey form temporarily disabled. Please use Skip button above.
          </div>
          
          <Form {...form}>
            <form className="space-y-4 pointer-events-none">
              {/* Form fields are intentionally disabled */}
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthSurvey;
