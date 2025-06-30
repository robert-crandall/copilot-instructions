import { env } from '../src/env';
import { spawnSync } from 'bun';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import fs from 'fs';
import path from 'path';

// 1. Load env vars
env.NODE_ENV = 'test';
process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is set to 'test' for migrations

// 2. Connect to DB
const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool);

// 3. Clean up existing test database
// This will drop all tables and the drizzle schema used for migrations
// Useful for ensuring a clean state before running tests

async function cleanDatabase() {
  // Drop all tables in public schema
  const tables = await db.execute(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
  for (const row of tables.rows) {
    await db.execute(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
  }
  // Drop drizzle schema (migration tracking)
  await db.execute('DROP SCHEMA IF EXISTS drizzle CASCADE');
}

async function runMigrations() {
  const migrationsPath = path.resolve(__dirname, '../src/db/migrations');
  console.log('Looking for migrations in:', migrationsPath);
  if (!fs.existsSync(migrationsPath)) {
    throw new Error(`Migrations folder not found: ${migrationsPath}`);
  }
  try {
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log('Migrations applied successfully.');
  } catch (err) {
    console.error('Error running migrations:', err);
    throw err;
  }
}

async function runSeed() {
  const seedPath = path.resolve(__dirname, './seed.ts');
  if (fs.existsSync(seedPath)) {
    const { seed } = await import(seedPath);
    if (typeof seed === 'function') {
      await seed(db);
    }
  }
}

async function checkDatabaseConnection() {
  try {
    console.log('Checking database connection...');
    const testPool = new Pool({ 
      connectionString: env.DATABASE_URL,
      // Short timeout for quick connection check
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 1000,
    });
    
    await testPool.query('SELECT 1');
    await testPool.end();
    console.log('✅ Database is already online');
    return true;
  } catch (err) {
    console.log('❌ Database not accessible:', err.message);
    return false;
  }
}

async function startDatabaseIfNeeded() {
  const isOnline = await checkDatabaseConnection();
  
  if (isOnline) {
    console.log('🔄 Using existing database connection');
    return;
  }
  
  console.log('🐳 Starting test database container with docker-compose...');
  const dc = spawnSync([
    'docker-compose',
    '-f',
    path.resolve(__dirname, '../../docker-compose.yml'),
    'up',
    '-d',
    'test-db', // Only start the test-db service
  ]);
  
  if (dc.exitCode !== 0) {
    const errorOutput = dc.stderr ? String(dc.stderr) : 'Unknown error';
    console.error('❌ docker-compose up failed:', errorOutput);
    process.exit(1);
  }
  
  // Wait a moment for the database to start up
  console.log('⏳ Waiting for database to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Verify the database is now accessible
  const isNowOnline = await checkDatabaseConnection();
  if (!isNowOnline) {
    console.error('❌ Database still not accessible after starting container');
    process.exit(1);
  }
}

async function main() {
  try {
    // Check if database is online, start if needed
    await startDatabaseIfNeeded();
    console.log('Cleaning test database...');
    await cleanDatabase();
    console.log('Applying migrations...');
    await runMigrations();
    console.log('Applying seed data (if any)...');
    await runSeed();
    console.log('Test DB setup complete.');
  } catch (err) {
    console.error('Error setting up test DB:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
