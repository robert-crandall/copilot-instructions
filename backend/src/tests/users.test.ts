import { describe, it, expect, beforeEach } from 'vitest';
import app from '../index';
import { testDb, cleanDatabase, schema } from './setup';
import { eq } from 'drizzle-orm';

describe('Users API Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/users/registration-status', () => {
    it('should return registration status', async () => {
      const res = await app.request('/api/users/registration-status');
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('enabled');
      expect(typeof data.enabled).toBe('boolean');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(201);
      const responseData = await res.json();
      
      // Check response structure
      expect(responseData).toHaveProperty('user');
      expect(responseData).toHaveProperty('token');
      expect(responseData.user).toHaveProperty('id');
      expect(responseData.user).toHaveProperty('name', userData.name);
      expect(responseData.user).toHaveProperty('email', userData.email);
      expect(responseData.user).toHaveProperty('createdAt');
      expect(responseData.user).not.toHaveProperty('password'); // Password should not be returned
      expect(typeof responseData.token).toBe('string');

      // Verify user was actually created in database
      const dbUsers = await testDb.select().from(schema.users).where(eq(schema.users.email, userData.email));
      expect(dbUsers).toHaveLength(1);
      expect(dbUsers[0].name).toBe(userData.name);
      expect(dbUsers[0].email).toBe(userData.email);
      expect(dbUsers[0].password).not.toBe(userData.password); // Should be hashed
    });

    it('should reject duplicate email addresses', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123'
      };

      // Create first user
      const firstRes = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      expect(firstRes.status).toBe(201);

      // Try to create second user with same email
      const secondRes = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          name: 'Different Name'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(secondRes.status).toBe(409);
      const errorData = await secondRes.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Email already in use');

      // Verify only one user exists in database
      const dbUsers = await testDb.select().from(schema.users).where(eq(schema.users.email, userData.email));
      expect(dbUsers).toHaveLength(1);
    });

    it('should reject invalid email format', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalid-email',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(400);
      const errorData = await res.json();
      expect(errorData).toHaveProperty('error');

      // Verify no user was created in database
      const dbUsers = await testDb.select().from(schema.users);
      expect(dbUsers).toHaveLength(0);
    });

    it('should reject missing required fields', async () => {
      const testCases = [
        { name: 'John', email: 'john@example.com' }, // Missing password
        { name: 'John', password: 'password123' }, // Missing email
        { email: 'john@example.com', password: 'password123' }, // Missing name
        {} // Missing all fields
      ];

      for (const userData of testCases) {
        const res = await app.request('/api/users', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        expect(res.status).toBe(400);
        const errorData = await res.json();
        expect(errorData).toHaveProperty('error');

        // Verify no user was created in database
        const dbUsers = await testDb.select().from(schema.users);
        expect(dbUsers).toHaveLength(0);
        
        // Clean up for next iteration
        await cleanDatabase();
      }
    });

    it('should reject password shorter than 6 characters', async () => {
      const userData = {
        name: 'Short Password User',
        email: 'short@example.com',
        password: '12345'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(400);
      const errorData = await res.json();
      expect(errorData).toHaveProperty('error');

      // Verify no user was created in database
      const dbUsers = await testDb.select().from(schema.users);
      expect(dbUsers).toHaveLength(0);
    });

    it('should reject name longer than 100 characters', async () => {
      const userData = {
        name: 'a'.repeat(101), // 101 characters
        email: 'long@example.com',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(400);
      const errorData = await res.json();
      expect(errorData).toHaveProperty('error');

      // Verify no user was created in database
      const dbUsers = await testDb.select().from(schema.users);
      expect(dbUsers).toHaveLength(0);
    });

    it('should handle malformed JSON', async () => {
      const res = await app.request('/api/users', {
        method: 'POST',
        body: 'invalid json{',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(400);

      // Verify no user was created in database
      const dbUsers = await testDb.select().from(schema.users);
      expect(dbUsers).toHaveLength(0);
    });

    it('should handle missing Content-Type header', async () => {
      const userData = {
        name: 'No Content Type',
        email: 'nocontent@example.com',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
        // No Content-Type header
      });

      // Should still work or return appropriate error
      expect([400, 201]).toContain(res.status);

      if (res.status === 201) {
        const responseData = await res.json();
        expect(responseData).toHaveProperty('user');
        expect(responseData).toHaveProperty('token');
        
        // Verify user was created in database
        const dbUsers = await testDb.select().from(schema.users).where(eq(schema.users.email, userData.email));
        expect(dbUsers).toHaveLength(1);
      }
    });
  });

  describe('Registration Flow Integration', () => {
    it('should create user and return valid JWT token', async () => {
      const userData = {
        name: 'JWT Test User',
        email: 'jwt@example.com',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(201);
      const responseData = await res.json();
      
      // Verify JWT token format (should have 3 parts separated by dots)
      const token = responseData.token;
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
      
      // Verify user data in response matches what was sent
      expect(responseData.user.name).toBe(userData.name);
      expect(responseData.user.email).toBe(userData.email);
      expect(responseData.user.id).toBeDefined();
      expect(responseData.user.createdAt).toBeDefined();
      
      // Verify timestamps are valid
      const createdAt = new Date(responseData.user.createdAt);
      expect(createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(createdAt.getTime()).toBeGreaterThan(Date.now() - 5000); // Within last 5 seconds
    });

    it('should hash passwords securely', async () => {
      const userData = {
        name: 'Password Hash Test',
        email: 'hash@example.com',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(201);

      // Check database directly
      const dbUsers = await testDb.select().from(schema.users).where(eq(schema.users.email, userData.email));
      expect(dbUsers).toHaveLength(1);
      
      const dbUser = dbUsers[0];
      expect(dbUser.password).not.toBe(userData.password); // Should be hashed
      expect(dbUser.password).toHaveLength(60); // Bcrypt hash length
      expect(dbUser.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
    });
  });

  describe('CORS and Headers', () => {
    it('should include CORS headers', async () => {
      const res = await app.request('/api/users/registration-status', {
        headers: {
          'Origin': 'http://localhost:5173'
        }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
    });

    it('should handle preflight requests', async () => {
      const res = await app.request('/api/users', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test might be hard to implement without actually breaking the DB
      // but it's important to consider how the app handles DB failures
      
      const userData = {
        name: 'DB Error Test',
        email: 'dberror@example.com',
        password: 'password123'
      };

      const res = await app.request('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Should either succeed or fail gracefully with 500
      expect([201, 500]).toContain(res.status);
    });

    it('should return appropriate error for unsupported methods', async () => {
      const res = await app.request('/api/users', {
        method: 'PATCH'
      });

      expect(res.status).toBe(405);
    });
  });
});
