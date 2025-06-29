import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testClient } from 'hono/testing';
import { mockDeep } from 'vitest-mock-extended';
import { vi } from 'vitest';

import app from '../../index';

// Mock the env module
vi.mock('../../env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-key',
    ALLOW_REGISTRATION: true,
    PORT: '3000',
  }
}));

// Mock DB operations
vi.mock('../../db', () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([{
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    }])
  };

  return {
    db: mockDb,
    users: {
      email: 'email',
      id: 'id',
      name: 'name',
      createdAt: 'created_at',
    }
  };
});

// Mock JWT signing
vi.mock('hono/jwt', () => ({
  sign: vi.fn().mockResolvedValue('test-jwt-token'),
}));

// Mock password hashing
vi.mock('../../utils/auth', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

describe('User Registration API', () => {
  const client = testClient(app);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should register a new user successfully', async () => {
    const response = await client.api.users.post({
      json: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('token');
    expect(body.user.name).toBe('Test User');
    expect(body.user.email).toBe('test@example.com');
  });
  
  it('should return 400 for invalid input', async () => {
    const response = await client.api.users.post({
      json: {
        name: '',
        email: 'invalid-email',
        password: 'pw'
      }
    });
    
    expect(response.status).toBe(400);
  });

  it('should return 403 when registration is disabled', async () => {
    // Temporarily override allow registration
    vi.mock('../../env', () => ({
      env: {
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        JWT_SECRET: 'test-secret-key',
        ALLOW_REGISTRATION: false,
        PORT: '3000',
      }
    }));
    
    const response = await client.api.users.post({
      json: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Registration is currently disabled');
    
    // Reset mock
    vi.mock('../../env', () => ({
      env: {
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        JWT_SECRET: 'test-secret-key',
        ALLOW_REGISTRATION: true,
        PORT: '3000',
      }
    }));
  });

  it('should return 409 when email already exists', async () => {
    // Mock DB to return an existing user
    vi.mock('../../db', () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue([{ id: '123', email: 'test@example.com' }]),
      };

      return {
        db: mockDb,
        users: {
          email: 'email',
          id: 'id',
          name: 'name',
          createdAt: 'created_at',
        }
      };
    });
    
    const response = await client.api.users.post({
      json: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toContain('Email already in use');
  });

  it('should check registration status', async () => {
    const response = await client.api.users['registration-status'].get();
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('enabled');
  });
});
