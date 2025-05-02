
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
import { toast } from '@/hooks/use-toast';

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

  // Enhanced validation for arrays to ensure proper formatting before submission
  const validateArrays = (data: HealthSurveyData): HealthSurveyData => {
    // Ensure conditions is always a properly formatted array with maximum 2 items to avoid PostgreSQL issues
    let sanitizedConditions = Array.isArray(data.conditions) ? 
      data.conditions.filter(Boolean) : 
      [];
    
    // Limit to max 2 conditions to avoid potential PostgreSQL array formatting issues
    if (sanitizedConditions.length > 2) {
      sanitizedConditions = sanitizedConditions.slice(0, 2);
      toast({
        title: "Selection limited",
        description: "Maximum 2 medical conditions allowed. Only the first 2 selections will be saved.",
        variant: "warning"
      });
    }
    
    // Ensure healthGoals is always a properly formatted array with maximum 3 items
    let sanitizedHealthGoals = Array.isArray(data.healthGoals) ? 
      data.healthGoals.filter(Boolean) : 
      [];
      
    // Limit goals to maximum 3 to avoid potential PostgreSQL array issues
    if (sanitizedHealthGoals.length > 3) {
      sanitizedHealthGoals = sanitizedHealthGoals.slice(0, 3);
      toast({
        title: "Selection limited",
        description: "Maximum 3 health goals allowed. Only the first 3 selections will be saved.",
        variant: "warning"
      });
    }
    
    // If "None" is selected for conditions, clear any other selections
    if (sanitizedConditions.includes("None")) {
      sanitizedConditions = ["None"];
    }

    return {
      ...data,
      conditions: sanitizedConditions,
      healthGoals: sanitizedHealthGoals,
      // Ensure other fields are properly formatted
      height: data.height?.trim() || undefined,
      weight: data.weight?.trim() || undefined,
      bloodType: data.bloodType || undefined,
      sleepHours: data.sleepHours || '7-8',
      activityLevel: data.activityLevel || 'moderate'
    };
  };

  const handleSubmit = (data: HealthSurveyData) => {
    try {
      // Format and validate data before sending, with more restrictive limits
      const formattedData = validateArrays(data);
      
      // Log detailed information for debugging
      console.log("Submitting health data (validated):", formattedData);
      
      // Pass the validated data to parent component
      onComplete(formattedData);
    } catch (error) {
      console.error("Error in health survey submission:", error);
      toast({
        title: "Submission error",
        description: "There was a problem with your health data. Please try again with fewer selections.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Health Profile</CardTitle>
        <CardDescription className="text-center">
          Tell us about your health to get personalized recommendations
          <p className="mt-2 text-sm font-medium text-amber-600">
            Please select no more than 2 conditions and 3 health goals
          </p>
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
                      <span className="text-amber-600 font-medium">Select up to 2 conditions</span> that apply to you
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {conditions.map((condition) => (
                      <FormField
                        key={condition}
                        control={form.control}
                        name="conditions"
                        render={({ field }) => {
                          // Ensure field.value is always a valid array
                          const currentValue = Array.isArray(field.value) ? field.value : [];
                          
                          // Special handling for "None" option - deselect others if "None" is selected
                          const handleConditionChange = (checked: boolean | string) => {
                            if (checked) {
                              // Limit selections to maximum 2 items unless "None" is selected
                              if (condition === "None") {
                                // If "None" is selected, clear all other selections
                                return field.onChange(["None"]);
                              } else {
                                // If any other condition is selected, remove "None" if present
                                const filteredValue = currentValue.filter(value => value !== "None");
                                
                                // Only add if we don't exceed 2 conditions
                                if (filteredValue.length < 2 || filteredValue.includes(condition)) {
                                  const newValue = filteredValue.includes(condition) 
                                    ? filteredValue 
                                    : [...filteredValue, condition];
                                    
                                  return field.onChange(newValue);
                                } else {
                                  // Show warning toast if trying to select more than 2 conditions
                                  toast({
                                    title: "Selection limit reached",
                                    description: "Maximum 2 medical conditions allowed.",
                                    variant: "warning"
                                  });
                                  return field.onChange(filteredValue);
                                }
                              }
                            } else {
                              return field.onChange(
                                currentValue.filter(value => value !== condition)
                              );
                            }
                          };
                          
                          return (
                            <FormItem
                              key={condition}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={currentValue.includes(condition)}
                                  onCheckedChange={handleConditionChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {condition}
                              </FormLabel>
                            </FormItem>
                          );
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
                      <span className="text-amber-600 font-medium">Select up to 3 goals</span> for your health journey
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {healthGoals.map((goal) => (
                      <FormField
                        key={goal}
                        control={form.control}
                        name="healthGoals"
                        render={({ field }) => {
                          // Ensure field.value is always a valid array
                          const currentValue = Array.isArray(field.value) ? field.value : [];
                          return (
                            <FormItem
                              key={goal}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={currentValue.includes(goal)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      // Only add if we don't exceed 3 goals
                                      if (currentValue.length < 3 || currentValue.includes(goal)) {
                                        return field.onChange(
                                          currentValue.includes(goal) 
                                            ? currentValue 
                                            : [...currentValue, goal]
                                        );
                                      } else {
                                        // Show warning toast if trying to select more than 3 goals
                                        toast({
                                          title: "Selection limit reached",
                                          description: "Maximum 3 health goals allowed.",
                                          variant: "warning"
                                        });
                                        return field.onChange(currentValue);
                                      }
                                    } else {
                                      return field.onChange(
                                        currentValue.filter(value => value !== goal)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {goal}
                              </FormLabel>
                            </FormItem>
                          );
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
