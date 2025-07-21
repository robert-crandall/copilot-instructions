#!/usr/bin/env bun

import { program } from 'commander';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { existsSync } from 'fs';
import { join } from 'path';
import * as schema from '../backend/src/db/schema';

// Parse command line arguments
program
  .name('setup-db')
  .description('Database setup script for development and testing')
  .option('--force', 'Force setup even in non-test environment')
  .option('--reset', 'Reset (drop and recreate) database')
  .parse();

const options = program.opts();

// Determine environment and load appropriate .env file
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`🌍 Environment: ${nodeEnv}`);

// Safety check: only allow non-test environments with --force flag
if (nodeEnv !== 'test' && !options.force) {
  console.error('❌ This script can only run in test environment unless --force flag is provided');
  console.error('   Use --force to run in development environment');
  console.error('   Set NODE_ENV=test to run in test environment');
  process.exit(1);
}

// Load environment file from backend directory
const backendPath = join(process.cwd(), 'backend');
const envFile = nodeEnv === 'test' ? '.env.test' : '.env';
const envPath = join(backendPath, envFile);

if (!existsSync(envPath)) {
  console.error(`❌ Environment file not found: backend/${envFile}`);
  console.error(`   Please create backend/${envFile} with DATABASE_URL`);
  console.error(`   Example: cp backend/.env.example backend/${envFile}`);
  process.exit(1);
}

console.log(`📋 Loading environment from: backend/${envFile}`);
config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment file');
  console.error(`   Please add DATABASE_URL to backend/${envFile}`);
  process.exit(1);
}

console.log(`🔗 Database URL: ${databaseUrl.replace(/\/\/.*:.*@/, '//***:***@')}`);

// Parse database URL to extract database name and connection info
function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const dbName = parsed.pathname.slice(1); // Remove leading slash
  const baseUrl = `${parsed.protocol}//${parsed.username}:${parsed.password}@${parsed.host}`;
  return { dbName, baseUrl, host: parsed.host };
}

const { dbName, baseUrl } = parseDatabaseUrl(databaseUrl);

async function setupDatabase() {
  try {
    console.log(`\n🗄️  Setting up database: ${dbName}`);

    // Connect to postgres (default database) to manage databases
    const postgresUrl = `${baseUrl}/postgres`;
    const adminClient = postgres(postgresUrl);

    if (options.reset) {
      console.log('🧹 Dropping database if it exists...');
      try {
        // Terminate existing connections to the database
        await adminClient`
					SELECT pg_terminate_backend(pg_stat_activity.pid)
					FROM pg_stat_activity
					WHERE pg_stat_activity.datname = ${dbName}
					AND pid <> pg_backend_pid()
				`;

        // Drop the database
        await adminClient.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
        console.log('✅ Database dropped successfully');
      } catch (error) {
        console.log('ℹ️  Database did not exist or could not be dropped');
        console.log(`   Details: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Create database
    console.log('🏗️  Creating database...');
    try {
      await adminClient.unsafe(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error instanceof Error && error.message?.includes('already exists')) {
        console.log('ℹ️  Database already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Close admin connection
    await adminClient.end();

    // Connect to the target database for migrations
    console.log('🔄 Applying migrations...');
    const client = postgres(databaseUrl!, { prepare: false });
    const db = drizzle(client, { schema });

    // Check if migrations directory exists
    const migrationsPath = join(backendPath, 'drizzle');
    if (existsSync(migrationsPath)) {
      await migrate(db, { migrationsFolder: migrationsPath });
      console.log('✅ Migrations applied successfully');
    } else {
      console.log('ℹ️  No migrations directory found. Run `npm run db:generate` first');
      console.log(`   Looked at: ${migrationsPath}`);
    }

    await client.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log(`   Database: ${dbName}`);
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   Migrations folder: ${migrationsPath}`);

    if (nodeEnv === 'test') {
      console.log('   Ready for testing! 🧪');
      console.log('   Run: cd backend && npm run test');
    } else {
      console.log('   Ready for development! 🚀');
      console.log('   Run: cd backend && npm run dev');
    }

    console.log('\n📚 Next steps:');
    console.log('   • Start the backend: cd backend && npm run dev');
    console.log('   • Start the frontend: cd frontend && npm run dev');
    console.log('   • View database: cd backend && npm run db:studio');
    console.log('   • Run tests: cd backend && npm run test');

  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error(error instanceof Error ? error.message : error);
    
    if (error instanceof Error) {
      console.error('\n🔍 Troubleshooting:');
      if (error.message.includes('connect')) {
        console.error('   • Check if PostgreSQL is running');
        console.error('   • Verify DATABASE_URL in backend/.env');
        console.error('   • Ensure database credentials are correct');
      }
      if (error.message.includes('permission')) {
        console.error('   • Check database user permissions');
        console.error('   • Ensure user can create databases');
      }
      if (error.message.includes('authentication')) {
        console.error('   • Verify username and password in DATABASE_URL');
        console.error('   • Check PostgreSQL authentication settings');
      }
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Database setup interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Database setup terminated');
  process.exit(0);
});

// Run the setup
setupDatabase();
