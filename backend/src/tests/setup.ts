import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { beforeEach, afterAll } from 'vitest';
import * as schema from '../db/schema';

// Create test database connection
const testDbUrl = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5435/example_app';
const testClient = postgres(testDbUrl);
export const testDb = drizzle(testClient, { schema });

// Clean database function
export async function cleanDatabase() {
  try {
    // Delete all data from tables in the correct order (respecting foreign keys)
    await testDb.delete(schema.users);
  } catch (error) {
    console.warn('Error cleaning database:', error);
    // If delete fails, the table might not exist yet, which is fine for tests
  }
}

// Setup that runs before each test
beforeEach(async () => {
  await cleanDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanDatabase();
  await testClient.end();
});

export { schema };
