/**
 * Shared type definitions for the application.
 * These types are used across both frontend and backend to ensure type safety.
 */

/**
 * Complete user object as stored in the database.
 * Includes all fields including sensitive ones like password.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User object safe for public API responses.
 * Excludes sensitive fields like password.
 */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new user.
 * Used for registration and user creation endpoints.
 */
export interface NewUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Data that can be updated for an existing user.
 * All fields are optional to support partial updates.
 * Excludes id and createdAt which should not be modifiable.
 */
export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  updatedAt?: string;
}
