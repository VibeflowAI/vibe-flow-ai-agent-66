import React from 'react';
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

  const handleSubmit = (data: HealthSurveyData) => {
    // Ensure conditions and healthGoals are properly formatted as arrays
    const formattedData = {
      ...data,
      conditions: Array.isArray(data.conditions) ? data.conditions : [],
      healthGoals: Array.isArray(data.healthGoals) ? data.healthGoals : []
    };
    
    // Log the formatted data for debugging
    console.log("Submitting health data:", formattedData);
    onComplete(formattedData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Health Profile</CardTitle>
        <CardDescription className="text-center">
          Tell us about your health to get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  <FormLabel>Blood Type (if known)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((type) => (
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
              name="conditions"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormDescription>
                      Select any conditions that apply to you
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {conditions.map((condition) => (
                      <FormField
                        key={condition}
                        control={form.control}
                        name="conditions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={condition}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(condition)}
                                  onCheckedChange={(checked) => {
                                    // Ensure field.value is always an array
                                    const currentValue = Array.isArray(field.value) ? field.value : [];
                                    return checked
                                      ? field.onChange([...currentValue, condition])
                                      : field.onChange(
                                          currentValue.filter(
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
              name="sleepHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Sleep Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sleep hours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="<6">Less than 6 hours</SelectItem>
                      <SelectItem value="6-7">6-7 hours</SelectItem>
                      <SelectItem value="7-8">7-8 hours</SelectItem>
                      <SelectItem value="8-9">8-9 hours</SelectItem>
                      <SelectItem value=">9">More than 9 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="moderate">Moderate (exercise 1-3 times/week)</SelectItem>
                      <SelectItem value="high">Active (exercise 4+ times/week)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthGoals"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Health Goals</FormLabel>
                    <FormDescription>
                      Select your primary health and wellness goals
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {healthGoals.map((goal) => (
                      <FormField
                        key={goal}
                        control={form.control}
                        name="healthGoals"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={goal}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(goal)}
                                  onCheckedChange={(checked) => {
                                    // Ensure field.value is always an array
                                    const currentValue = Array.isArray(field.value) ? field.value : [];
                                    return checked
                                      ? field.onChange([...currentValue, goal])
                                      : field.onChange(
                                          currentValue.filter(
                                            (value) => value !== goal
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {goal}
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

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button type="submit">
                Complete Registration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HealthSurvey;
