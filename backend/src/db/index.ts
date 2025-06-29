import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env';
import * as schema from './schema';

// Create the PostgreSQL client
const queryClient = postgres(env.DATABASE_URL);

// Create the Drizzle client
export const db = drizzle(queryClient, { schema });

// Export the schema
export * from './schema';
