import type { FullConfig } from '@playwright/test';
import { TEST_CONFIG } from './test-config';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

async function waitForBackend(maxAttempts = 30, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/health`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Backend not ready yet
    }

    console.log(`Waiting for backend... (attempt ${i + 1}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return false;
}

async function runSeeding(): Promise<void> {
  // Import the seeding function
  const { seedTestDataViaAPI } = await import('./seed-data');
  await seedTestDataViaAPI();
}

async function resetDatabase(): Promise<void> {
  console.log('🧪 Resetting test database (drop + migrate)...');
  return new Promise((resolve, reject) => {
    const child = spawn('bun', ['run', 'db:reset:force'], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`db:reset:force exited with code ${code}`));
    });
  });
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 Global setup starting...');

  // Step 1: Reset database (drop + migrate)
  try {
    await resetDatabase();
    console.log('✅ Test database reset complete');
  } catch (err) {
    console.error('❌ Failed to reset database before tests:', err);
    throw err;
  }

  // Step 2: Start dev environment (backend + frontend) using existing dev:force script
  console.log('🛠  Starting dev environment (bun run dev:force)...');
  await new Promise((resolve, reject) => {
    const child = spawn('bun', ['run', 'dev:force'], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'inherit',
    });
    child.on('error', reject);
    // dev:force uses devctl which backgrounds processes then exits quickly
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`dev:force exited with code ${code}`));
    });
  });

  // Step 3: Wait for backend readiness
  console.log('⏳ Waiting for backend to be ready...');
  const backendReady = await waitForBackend();
  if (!backendReady) throw new Error('Backend failed to start within timeout period');
  console.log('✅ Backend is ready');

  // Step 4: Seed data
  console.log('🌱 Seeding test data...');
  try {
    await runSeeding();
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }

  // Record that setup completed (useful for debugging / potential teardown coordination)
  writeFileSync('.e2e-setup-complete', new Date().toISOString());
  console.log('🎉 Global setup completed');
}

export default globalSetup;
