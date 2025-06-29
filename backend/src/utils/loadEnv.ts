import fs from 'fs';
import path from 'path';

function loadEnvFile(filename: string) {
  const envPath = path.resolve(__dirname, '../../../', filename);
  console.log(`Loading environment variables from: ${envPath}`);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/i);
      if (match) {
        const [, key, value] = match;
        if (!process.env[key]) process.env[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

export function loadEnv() {
  if (process.env.NODE_ENV === 'test') {
    loadEnvFile('.env.test');
  } else {
    loadEnvFile('.env');
  }
}
