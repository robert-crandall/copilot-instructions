import { expect } from 'bun:test'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { users, posts } from '../db/schema'
import { v4 as uuidv4 } from 'uuid'
import app from '../index'

// Test configuration
export const TEST_CONFIG = {
  baseUrl: 'http://localhost',
  testUserPrefix: 'test-user-',
  testEmailDomain: '@test-microblog.com'
}

// Generate unique test identifiers
export function generateTestId(): string {
  return uuidv4().slice(0, 8)
}

export function generateTestEmail(): string {
  const testId = generateTestId()
  return `${TEST_CONFIG.testUserPrefix}${testId}${TEST_CONFIG.testEmailDomain}`
}

export function generateTestUserData() {
  const testId = generateTestId()
  return {
    name: `Test User ${testId}`,
    email: generateTestEmail(),
    password: 'testpass123'
  }
}

// HTTP client for testing
export class TestClient {
  private authToken?: string

  constructor(private baseUrl: string = TEST_CONFIG.baseUrl) {}

  setAuthToken(token: string) {
    this.authToken = token
  }

  clearAuthToken() {
    this.authToken = undefined
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  async request(
    path: string, 
    options: {
      method?: string
      body?: any
      expectStatus?: number
    } = {}
  ) {
    const { method = 'GET', body, expectStatus = 200 } = options

    const request = new Request(`${this.baseUrl}${path}`, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    })

    const response = await app.fetch(request)
    
    if (expectStatus && response.status !== expectStatus) {
      const errorText = await response.text()
      throw new Error(
        `Expected status ${expectStatus}, got ${response.status}. Response: ${errorText}`
      )
    }

    // Return both response and parsed JSON for flexibility
    const text = await response.text()
    let json = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      // Not JSON, that's ok
    }

    return {
      status: response.status,
      headers: response.headers,
      text,
      json,
      ok: response.ok
    }
  }

  // Convenience methods
  async get(path: string, expectStatus?: number) {
    return this.request(path, { method: 'GET', expectStatus })
  }

  async post(path: string, body: any, expectStatus?: number) {
    return this.request(path, { method: 'POST', body, expectStatus })
  }

  async put(path: string, body: any, expectStatus?: number) {
    return this.request(path, { method: 'PUT', body, expectStatus })
  }

  async delete(path: string, expectStatus?: number) {
    return this.request(path, { method: 'DELETE', expectStatus })
  }
}

// Database cleanup utilities
export async function cleanupTestUsers() {
  try {
    await db
      .delete(users)
      .where(eq(users.email, `%${TEST_CONFIG.testEmailDomain}`))
  } catch (error) {
    // Ignore errors, this is best effort cleanup
    console.warn('Cleanup warning:', error)
  }
}

export async function cleanupTestUserByEmail(email: string) {
  try {
    await db.delete(users).where(eq(users.email, email))
  } catch (error) {
    // Ignore errors, this is best effort cleanup
    console.warn('Cleanup warning:', error)
  }
}

// Test user creation and authentication
export async function createTestUser(client: TestClient, userData?: any) {
  const user = userData || generateTestUserData()
  
  const response = await client.post('/api/auth/register', user, 201)
  expect(response.json).toHaveProperty('user')
  expect(response.json).toHaveProperty('token')
  
  const { user: createdUser, token } = response.json
  client.setAuthToken(token)
  
  return { user: createdUser, token, userData: user }
}

export async function loginTestUser(client: TestClient, email: string, password: string) {
  const response = await client.post('/api/auth/login', { 
    email, 
    password, 
    rememberMe: false 
  }, 200)
  
  expect(response.json).toHaveProperty('user')
  expect(response.json).toHaveProperty('token')
  
  const { user, token } = response.json
  client.setAuthToken(token)
  
  return { user, token }
}

// Test post creation
export async function createTestPost(client: TestClient, content?: string) {
  const postContent = content || `Test post content ${generateTestId()}`
  
  const response = await client.post('/api/posts', { content: postContent }, 201)
  expect(response.json).toHaveProperty('id')
  expect(response.json.content).toBe(postContent)
  
  return response.json
}

// Assertion helpers
export function expectValidUser(user: any) {
  expect(user).toHaveProperty('id')
  expect(user).toHaveProperty('name')
  expect(user).toHaveProperty('email')
  expect(user).toHaveProperty('createdAt')
  expect(user.id).toMatch(/^[0-9a-f-]{36}$/) // UUID format
  expect(user.email).toMatch(/^.+@.+\..+$/) // Email format
  expect(user).not.toHaveProperty('password')
  expect(user).not.toHaveProperty('passwordHash')
}

export function expectValidPost(post: any) {
  expect(post).toHaveProperty('id')
  expect(post).toHaveProperty('content')
  expect(post).toHaveProperty('userId')
  expect(post).toHaveProperty('user')
  expect(post).toHaveProperty('createdAt')
  expect(post).toHaveProperty('updatedAt')
  expect(post.id).toMatch(/^[0-9a-f-]{36}$/) // UUID format
  expect(post.user).toHaveProperty('id')
  expect(post.user).toHaveProperty('name')
  expect(typeof post.content).toBe('string')
}

export function expectValidToken(token: any) {
  expect(typeof token).toBe('string')
  expect(token.length).toBeGreaterThan(20) // JWT tokens are long
}
