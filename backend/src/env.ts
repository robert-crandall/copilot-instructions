import { join } from 'path';
import { existsSync } from 'fs';

// Load environment variables from parent directory .env files
const parentDir = join(import.meta.dir, '../..');
const defaultEnvPath = join(parentDir, '.env');
const testEnvPath = join(parentDir, '.env.test');

// Load .env file from parent directory if it exists
if (existsSync(defaultEnvPath)) {
  await Bun.file(defaultEnvPath).text().then(contents => {
    for (const line of contents.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#') && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Only set if not already defined
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  });
}

// Load .env.test file from parent directory if environment is test
if (process.env.NODE_ENV === 'test' && existsSync(testEnvPath)) {
  await Bun.file(testEnvPath).text().then(contents => {
    for (const line of contents.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#') && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Override with test values
        process.env[key.trim()] = value;
      }
    }
  });
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  ALLOW_REGISTRATION: process.env.ALLOW_REGISTRATION === "true",
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
