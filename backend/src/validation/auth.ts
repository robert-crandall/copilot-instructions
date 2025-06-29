import { z } from 'zod';

// Validation schema for user registration
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

// Validation schema for user login
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional().default(false)
});
