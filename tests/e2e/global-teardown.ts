import { exec } from 'node:child_process';

export default async function globalTeardown() {
  console.log('🧹 Global teardown: stopping dev services...');
  await new Promise<void>((resolve) => {
    const child = exec('node scripts/devctl.mjs stop', (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) {
        console.warn('⚠️  Failed to stop services (they may have already exited):', err.message);
      }
      resolve();
    });
  });
}
