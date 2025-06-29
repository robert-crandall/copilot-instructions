import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Get the directory path in a way that works both with Bun and Node.js (Vitest)
const __filename = typeof import.meta.url === 'string' 
  ? fileURLToPath(import.meta.url) 
  : '';
const __dirname = __filename ? dirname(__filename) : process.cwd();
const parentDir = join(__dirname, '../..');
const defaultEnvPath = join(parentDir, '.env');
const testEnvPath = join(parentDir, '.env.test');

// Helper function to load env file that works in both Bun and Node.js
async function loadEnvFile(filePath: string, overrideExisting = false) {
  if (!existsSync(filePath)) return;
  
  try {
    // Use Node.js fs module as a fallback for Vitest environment
    let contents: string;
    if (typeof Bun !== 'undefined') {
      contents = await Bun.file(filePath).text();
    } else {
      // Node.js fallback for Vitest
      const { readFileSync } = require('fs');
      contents = readFileSync(filePath, 'utf-8');
    }
    
    for (const line of contents.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#') && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Set env var based on override flag
        const trimmedKey = key.trim();
        if (overrideExisting || !process.env[trimmedKey]) {
          process.env[trimmedKey] = value;
        }
      }
    }
  } catch (error) {
    console.error(`Error loading environment file ${filePath}:`, error);
  }
}

// Load .env file from parent directory (don't override existing vars)
await loadEnvFile(defaultEnvPath, false);

// Load .env.test file if in test environment (override existing vars)
if (process.env.NODE_ENV === 'test') {
  await loadEnvFile(testEnvPath, true);
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  ALLOW_REGISTRATION: process.env.ALLOW_REGISTRATION === "true",
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
