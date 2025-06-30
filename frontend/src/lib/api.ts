import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/index';

// Create type-safe API client
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const api = hc<AppType>(baseUrl);

// Types for API responses (inferred from backend)
export type { AppType } from '../../../backend/src/index';
