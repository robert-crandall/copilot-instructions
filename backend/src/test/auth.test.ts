import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { 
  TestClient, 
  generateTestUserData,
  cleanupTestUserByEmail,
  expectValidUser,
  expectValidToken,
  generateTestEmail
} from './helpers'

describe('Authentication API', () => {
  let client: TestClient
  let testUserEmails: string[] = []

  beforeEach(() => {
    client = new TestClient()
    testUserEmails = []
  })

  afterEach(async () => {
    // Cleanup test users
    for (const email of testUserEmails) {
      await cleanupTestUserByEmail(email)
    }
  })

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      const response = await client.post('/api/auth/register', userData, 201)
      
      expect(response.json).toHaveProperty('user')
      expect(response.json).toHaveProperty('token')
      
      const { user, token } = response.json
      expectValidUser(user)
      expectValidToken(token)
      
      expect(user.name).toBe(userData.name)
      expect(user.email).toBe(userData.email)
    })

    test('should validate required fields', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      // Missing name
      const response1 = await client.post('/api/auth/register', {
        email: userData.email,
        password: userData.password
      }, 400)
      expect(response1.json.error).toContain('Name')

      // Missing email
      const response2 = await client.post('/api/auth/register', {
        name: userData.name,
        password: userData.password
      }, 400)
      expect(response2.json.error).toContain('email')

      // Missing password
      const response3 = await client.post('/api/auth/register', {
        name: userData.name,
        email: userData.email
      }, 400)
      expect(response3.json.error).toContain('password')
    })

    test('should validate email format', async () => {
      const userData = generateTestUserData()
      userData.email = 'invalid-email'
      testUserEmails.push(userData.email)

      const response = await client.post('/api/auth/register', userData, 400)
      expect(response.json.error).toContain('email')
    })

    test('should validate password length', async () => {
      const userData = generateTestUserData()
      userData.password = '12345' // Too short
      testUserEmails.push(userData.email)

      const response = await client.post('/api/auth/register', userData, 400)
      expect(response.json.error).toContain('6 characters')
    })

    test('should validate name length', async () => {
      const userData = generateTestUserData()
      userData.name = 'a'.repeat(101) // Too long
      testUserEmails.push(userData.email)

      const response = await client.post('/api/auth/register', userData, 400)
      expect(response.json.error).toContain('100 characters')
    })

    test('should reject duplicate email addresses', async () => {
      const userData1 = generateTestUserData()
      const userData2 = { ...userData1, name: 'Different Name' }
      testUserEmails.push(userData1.email)

      // Register first user
      await client.post('/api/auth/register', userData1, 201)

      // Try to register second user with same email
      const response = await client.post('/api/auth/register', userData2, 400)
      expect(response.json.error).toContain('already exists')
    })

    test('should respect ALLOW_REGISTRATION environment variable', async () => {
      // Note: This test assumes ALLOW_REGISTRATION is set to true in test environment
      // In a real test, you might want to test both scenarios by temporarily changing the env var
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      const response = await client.post('/api/auth/register', userData, 201)
      expect(response.json).toHaveProperty('user')
      expect(response.json).toHaveProperty('token')
    })
  })

  describe('POST /api/auth/login', () => {
    test('should login existing user successfully', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      // First register a user
      await client.post('/api/auth/register', userData, 201)

      // Clear token to test login independently
      client.clearAuthToken()

      // Now login
      const loginResponse = await client.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
        rememberMe: false
      }, 200)

      expect(loginResponse.json).toHaveProperty('user')
      expect(loginResponse.json).toHaveProperty('token')

      const { user, token } = loginResponse.json
      expectValidUser(user)
      expectValidToken(token)

      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
    })

    test('should login with rememberMe option', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      // Register user
      await client.post('/api/auth/register', userData, 201)
      client.clearAuthToken()

      // Login with rememberMe
      const response = await client.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
        rememberMe: true
      }, 200)

      expect(response.json).toHaveProperty('user')
      expect(response.json).toHaveProperty('token')
      expectValidToken(response.json.token)
    })

    test('should reject invalid email', async () => {
      const response = await client.post('/api/auth/login', {
        email: generateTestEmail(),
        password: 'anypassword',
        rememberMe: false
      }, 401)

      expect(response.json.error).toContain('Invalid email or password')
    })

    test('should reject invalid password', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      // Register user
      await client.post('/api/auth/register', userData, 201)
      client.clearAuthToken()

      // Try to login with wrong password
      const response = await client.post('/api/auth/login', {
        email: userData.email,
        password: 'wrongpassword',
        rememberMe: false
      }, 401)

      expect(response.json.error).toContain('Invalid email or password')
    })

    test('should validate required login fields', async () => {
      // Missing email
      const response1 = await client.post('/api/auth/login', {
        password: 'password123',
        rememberMe: false
      }, 400)
      expect(response1.json.error).toContain('email')

      // Missing password
      const response2 = await client.post('/api/auth/login', {
        email: generateTestEmail(),
        rememberMe: false
      }, 400)
      expect(response2.json.error).toContain('password')
    })

    test('should validate email format in login', async () => {
      const response = await client.post('/api/auth/login', {
        email: 'invalid-email',
        password: 'password123',
        rememberMe: false
      }, 400)
      expect(response.json.error).toContain('email')
    })
  })

  describe('Authentication Token Usage', () => {
    test('should accept valid JWT token for protected endpoints', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      // Register and get token
      const response = await client.post('/api/auth/register', userData, 201)
      const { token } = response.json

      // Set token and try to access protected endpoint
      client.setAuthToken(token)
      const postsResponse = await client.get('/api/posts', 200)
      expect(Array.isArray(postsResponse.json)).toBe(true)
    })

    test('should reject requests without token to protected endpoints', async () => {
      client.clearAuthToken()
      
      const response = await client.post('/api/posts', {
        content: 'This should fail'
      }, 401)
      
      expect(response.json.error).toContain('Authorization token required')
    })

    test('should reject invalid JWT token', async () => {
      client.setAuthToken('invalid-token')
      
      const response = await client.post('/api/posts', {
        content: 'This should fail'
      }, 401)
      
      expect(response.json.error).toContain('Invalid or expired token')
    })
  })
})
