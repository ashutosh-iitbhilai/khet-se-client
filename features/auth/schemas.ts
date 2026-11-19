import { z } from 'zod';

// Mirrors server/src/validators/auth.validator.ts so users get instant feedback.
/** Indian mobile number in any common form → its 10 digits (mirrors the server). */
export const normalizePhone = (value: string) => {
  let d = value.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
};
const isMobile = (v: string) => /^[6-9]\d{9}$/.test(normalizePhone(v));

const mobile = z
  .string()
  .trim()
  .min(1, 'Enter your mobile number')
  .refine(isMobile, 'Enter a valid 10-digit mobile number');

/** Mobile number or email, in one field. */
const identifier = z
  .string()
  .trim()
  .min(1, 'Enter your mobile number or email')
  .refine((v) => (v.includes('@') ? z.string().email().safeParse(v).success : isMobile(v)), 'Enter a valid 10-digit mobile number or an email');

export const loginSchema = z.object({
  identifier,
  password: z.string().min(1, 'Password is required'),
});

const newPassword = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const forgotPasswordSchema = z.object({ identifier });

export const resetPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export const registerSchema = z.object({
  role: z.enum(['customer', 'farmer', 'delivery']),
  name: z.string().trim().min(2, 'Name is too short').max(80),
  phone: mobile,
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
  password: newPassword,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
