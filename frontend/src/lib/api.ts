import { hc } from 'hono/client';
import { browser } from '$app/environment';

// HONO RPC CLIENT SETUP
// This demonstrates the core of Hono Stacks architecture:
// 1. Import the AppType from backend (single source of truth)
// 2. Create type-safe client using hc<AppType>()
// 3. All API calls are now fully typed without manual interfaces

import type { AppType } from '../../../backend/src/index';

// For SPA deployment, we need to handle different environments
const getBaseUrl = () => {
  if (browser) {
    // In browser: use current origin for production, localhost for development
    const origin = window.location.origin;
    // If we're on localhost:4173 (SvelteKit preview) or other dev ports, use backend port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:3000';
    }
    // In production, assume API is on same origin or configure via env
    return origin;
  }
  // Fallback for SSR (though we've disabled SSR)
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

// Create type-safe API client using Hono RPC pattern
// The AppType contains all route definitions from the backend
// This gives us:
// - Full TypeScript IntelliSense for all endpoints
// - Compile-time validation of request/response types
// - Parameter type checking for dynamic routes
// - Automatic error handling type inference
export const api = hc<AppType>(baseUrl);

// Re-export AppType for components that need to reference API types
// Example usage: Awaited<ReturnType<typeof api.users.$get>>
// This allows components to extract response types without manual definitions
export type { AppType } from '../../../backend/src/index';
