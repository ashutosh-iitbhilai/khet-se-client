import { z } from 'zod';

// Mirrors server/src/validators/auth.validator.ts so users get instant feedback.
export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  role: z.enum(['customer', 'farmer']),
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^([6-9]\d{9})?$/, 'Enter a valid 10-digit mobile number')
    .optional(),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/\d/, 'Include at least one number'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
