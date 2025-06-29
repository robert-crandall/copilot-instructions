import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../index';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

// Test user data
const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

describe('User Registration API', () => {
  // Clean up database before tests
  beforeAll(async () => {
    try {
      await db.delete(users);
    } catch (error) {
      console.error('Error cleaning up database:', error);
    }
  });

  // Clean up after tests
  afterAll(async () => {
    try {
      await db.delete(users);
    } catch (error) {
      console.error('Error cleaning up database:', error);
    }
  });

  // Clean up before each test
  beforeEach(async () => {
    try {
      await db.delete(users);
    } catch (error) {
      console.error('Error cleaning up database:', error);
    }
  });

  describe('GET /api/users/registration-status', () => {
    it('should return registration status when enabled', async () => {
      // First save the current env setting
      const originalSetting = process.env.ALLOW_REGISTRATION;
      
      // Test with registration enabled
      process.env.ALLOW_REGISTRATION = 'true';
      
      const res = await app.request('/api/users/registration-status');
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data).toEqual({ enabled: true });

      // Restore original setting
      process.env.ALLOW_REGISTRATION = originalSetting;
    });
    
    it('should return registration status when disabled', async () => {
      // First save the current env setting
      const originalSetting = process.env.ALLOW_REGISTRATION;
      
      // Test with registration disabled
      process.env.ALLOW_REGISTRATION = 'false';
      
      const res = await app.request('/api/users/registration-status');
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data).toEqual({ enabled: false });

      // Restore original setting
      process.env.ALLOW_REGISTRATION = originalSetting;
    });
  });

  describe('POST /api/users', () => {
    it('should register a new user successfully when registration is enabled', async () => {
      // Enable registration for this test
      const originalSetting = process.env.ALLOW_REGISTRATION;
      process.env.ALLOW_REGISTRATION = 'true';

      const res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validUser)
      });
      
      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('token');
      expect(data.user).toHaveProperty('id');
      expect(data.user.name).toBe(validUser.name);
      expect(data.user.email).toBe(validUser.email);
      expect(data.user).not.toHaveProperty('password'); // Password should not be returned
      
      // Verify user was created in database
      const dbUsers = await db.select().from(users).where(eq(users.email, validUser.email));
      expect(dbUsers.length).toBe(1);
      expect(dbUsers[0].name).toBe(validUser.name);
      expect(dbUsers[0].email).toBe(validUser.email);
      expect(dbUsers[0].password).not.toBe(validUser.password); // Password should be hashed
      
      // Restore original setting
      process.env.ALLOW_REGISTRATION = originalSetting;
    });

    it('should reject registration when registration is disabled', async () => {
      // Disable registration for this test
      const originalSetting = process.env.ALLOW_REGISTRATION;
      process.env.ALLOW_REGISTRATION = 'false';

      const res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validUser)
      });
      
      expect(res.status).toBe(403);
      
      const data = await res.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('disabled');
      
      // Verify user was not created in database
      const dbUsers = await db.select().from(users).where(eq(users.email, validUser.email));
      expect(dbUsers.length).toBe(0);
      
      // Restore original setting
      process.env.ALLOW_REGISTRATION = originalSetting;
    });

    it('should reject registration with duplicate email', async () => {
      // Enable registration for this test
      const originalSetting = process.env.ALLOW_REGISTRATION;
      process.env.ALLOW_REGISTRATION = 'true';

      // First register a user
      await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validUser)
      });
      
      // Try to register the same user again
      const res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validUser)
      });
      
      expect(res.status).toBe(409);
      
      const data = await res.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('already in use');
      
      // Restore original setting
      process.env.ALLOW_REGISTRATION = originalSetting;
    });

    it('should reject registration with invalid data', async () => {
      // Enable registration for this test
      const originalSetting = process.env.ALLOW_REGISTRATION;
      process.env.ALLOW_REGISTRATION = 'true';

      // Test missing name
      let res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: validUser.email,
          password: validUser.password
        })
      });
      
      expect(res.status).toBe(400);
      
      // Test invalid email
      res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: validUser.name,
          email: 'invalid-email',
          password: validUser.password
        })
      });
      
      expect(res.status).toBe(400);
      
      // Test short password
      res = await app.request('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: validUser.name,
          email: validUser.email,
          password: '12345' // Less than 6 characters
        })
      });
      
      expect(res.status).toBe(400);
      
      // Restore original setting
      process.env.ALLOW_REGISTRATION = originalSetting;
    });
  });
});
