import { z } from 'zod'

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
})

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime()
})

// Post schemas
export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(280, 'Content must be less than 280 characters')
})

export const updatePostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(280, 'Content must be less than 280 characters')
})

export const postSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  userId: z.string().uuid(),
  user: userSchema.pick({ id: true, name: true }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Auth response schemas
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string()
})

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional()
})

// Type exports
export type CreateUser = z.infer<typeof createUserSchema>
export type Login = z.infer<typeof loginSchema>
export type User = z.infer<typeof userSchema>
export type CreatePost = z.infer<typeof createPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>
export type Post = z.infer<typeof postSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
