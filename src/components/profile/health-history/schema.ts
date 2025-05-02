
import * as z from 'zod';

export const HealthHistorySchema = z.object({
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

export type HealthHistoryFormData = z.infer<typeof HealthHistorySchema>;

export const MedicalConditions = [
  "Diabetes",
  "High Blood Pressure",
  "Heart Disease",
  "Asthma",
  "Arthritis", 
  "Depression/Anxiety"
];

export const BloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
