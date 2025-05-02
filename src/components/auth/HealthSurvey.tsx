import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

type HealthSurveyProps = {
  onComplete: (data: HealthSurveyData | null) => void;
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

export const HealthSurvey = ({ onComplete, onBack }: HealthSurveyProps) => {
  const handleSkip = () => {
    onComplete(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Health Profile</CardTitle>
        <CardDescription className="text-center">
          <div className="mt-2 text-lg font-bold text-amber-600">
            You can complete this later in your profile settings
          </div>
        </CardDescription>
        
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div>
              <strong>Having issues?</strong> Skip this step and complete it later.
            </div>
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
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6"
            size="lg"
          >
            Skip & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};