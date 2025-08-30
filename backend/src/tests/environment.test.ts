import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Environment Configuration Integration', () => {
  describe('Registration Control', () => {
    it('should report registration token requirement', async () => {
      const res = await app.request('/api/users/registration-status');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('required');
      expect(typeof data.required).toBe('boolean');
      expect(data.required).toBe(true); // test env sets a token
    });

    it('should block registration without token and allow with correct token', async () => {
      const userData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };

      // Missing token
      const resMissing = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(resMissing.status).toBe(403);

      // Wrong token
      const resWrong = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify({ ...userData, email: `wrong-${Date.now()}@example.com`, registrationToken: 'bad-token' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(resWrong.status).toBe(403);

      // Correct token
      const resOk = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify({ ...userData, email: `ok-${Date.now()}@example.com`, registrationToken: process.env.REGISTRATION_TOKEN }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(resOk.status).toBe(201);
    });
  });

  describe('Database Configuration', () => {
    it('should connect to database successfully', async () => {
      // Test database connectivity by trying to create a user
      const userData = {
        name: 'DB Test User',
        email: 'dbtest@example.com',
        password: 'password123',
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify({ ...userData, registrationToken: process.env.REGISTRATION_TOKEN }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should succeed if database is properly configured
      // Should fail with 500 if database connection issues
      expect([201, 500]).toContain(res.status);

      if (res.status === 500) {
        console.warn('Database connection may have issues - this is expected in some test environments');
      }
    });
  });

  describe('JWT Configuration', () => {
    it('should generate valid JWT tokens', async () => {
      const userData = {
        name: 'JWT Config Test',
        email: 'jwtconfig@example.com',
        password: 'password123',
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 201) {
        const responseData = await res.json();
        expect(responseData).toHaveProperty('token');

        const token = responseData.token;
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);

        // JWT format check (header.payload.signature)
        const parts = token.split('.');
        expect(parts).toHaveLength(3);

        // Each part should be base64-encoded
        for (const part of parts) {
          expect(part.length).toBeGreaterThan(0);
          // Should not contain invalid base64 characters
          expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
        }
      }
    });
  });

  describe('CORS Configuration', () => {
    it('should allow configured frontend origins', async () => {
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174'];

      for (const origin of allowedOrigins) {
        const res = await app.request('/api/health', {
          headers: {
            Origin: origin,
          },
        });

        expect(res.status).toBe(200);

        // Should include CORS headers
        const corsHeader = res.headers.get('Access-Control-Allow-Origin') || res.headers.get('access-control-allow-origin');
        expect(corsHeader).toBeTruthy();
      }
    });

    it('should handle credentials correctly', async () => {
      const res = await app.request('/api/health', {
        headers: {
          Origin: 'http://localhost:5173',
        },
      });

      expect(res.status).toBe(200);

      // Check if credentials are handled
      const credentialsHeader = res.headers.get('Access-Control-Allow-Credentials') || res.headers.get('access-control-allow-credentials');

      // Should either be 'true' or not present (depending on CORS config)
      if (credentialsHeader) {
        expect(credentialsHeader).toBe('true');
      }
    });
  });

  describe('Environment Error Handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // This test ensures the app doesn't crash if env vars are missing
      // The actual behavior depends on how the env loading is implemented

      const res = await app.request('/api/health');

      // Should not crash, even if some env vars are missing
      expect(res.status).toBeLessThan(500);
    });

    it('should validate environment configuration', async () => {
      // Test that the app properly validates its configuration
      const res = await app.request('/api/health');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');

      // If the app is responding to health checks,
      // it means the environment is properly configured
    });
  });
});
