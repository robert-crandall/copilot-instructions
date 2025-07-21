import { describe, test, expect, beforeEach } from 'bun:test'
import { TestClient } from './helpers'

describe('Health and Smoke Tests', () => {
  let client: TestClient

  beforeEach(() => {
    client = new TestClient()
  })

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await client.get('/api/health', 200)
      
      expect(response.json).toHaveProperty('status')
      expect(response.json.status).toBe('ok')
      expect(response.json).toHaveProperty('timestamp')
      expect(response.json).toHaveProperty('hasDb')
      expect(response.json).toHaveProperty('hasJwt')
      expect(response.json).toHaveProperty('registrationEnabled')
      
      // Verify timestamp is recent (within last minute)
      const timestamp = new Date(response.json.timestamp)
      const now = new Date()
      const timeDiff = Math.abs(now.getTime() - timestamp.getTime())
      expect(timeDiff).toBeLessThan(60000) // 1 minute
      
      // In test environment, these should be true
      expect(response.json.hasDb).toBe(true)
      expect(response.json.hasJwt).toBe(true)
    })
  })

  describe('API Route Smoke Tests', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await client.get('/api/nonexistent', 404)
      expect(response.json.error).toBe('Not Found')
    })

    test('should handle malformed JSON in POST requests', async () => {
      // Manually create a request with malformed JSON
      const response = await fetch('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{"name": "test", invalid json}'
      })

      expect(response.status).toBe(400)
    })

    test('should return proper CORS headers', async () => {
      const response = await client.get('/api/health')
      
      // Check for CORS headers (these might vary based on environment)
      expect(response.headers.has('access-control-allow-origin') || 
             response.headers.has('Access-Control-Allow-Origin')).toBe(true)
    })

    test('should handle OPTIONS requests (CORS preflight)', async () => {
      const request = new Request('http://localhost/api/posts', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization',
          'Origin': 'http://localhost:5173'
        }
      })

      const response = await client.request('/api/posts', {
        method: 'OPTIONS'
      })

      // Should handle OPTIONS request without error
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('Error Handling Smoke Tests', () => {
    test('should handle requests with missing content-type', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'test', email: 'test@example.com', password: 'password' })
        // Missing Content-Type header
      })

      const response = await fetch(request)
      // Should not crash the server, even if it returns an error
      expect(response.status).toBeLessThan(500)
    })

    test('should handle very large request bodies gracefully', async () => {
      const largeContent = 'a'.repeat(10000) // 10KB of content
      
      const response = await client.post('/api/posts', {
        content: largeContent
      }, 400) // Should reject due to content length validation

      expect(response.json.error).toContain('280 characters')
    })

    test('should handle requests with invalid Authorization header format', async () => {
      client.setAuthToken('not-bearer-token-format')
      
      const response = await client.post('/api/posts', {
        content: 'Test content'
      }, 401)

      expect(response.json.error).toContain('Invalid or expired token')
    })
  })

  describe('Database Connection Smoke Test', () => {
    test('should be able to query database', async () => {
      // The health endpoint queries environment variables, but let's test actual DB connectivity
      // by attempting to access the posts endpoint (which queries the database)
      const response = await client.get('/api/posts', 200)
      
      // If we get here without a 500 error, database connection is working
      expect(Array.isArray(response.json)).toBe(true)
    })
  })

  describe('Environment Configuration Smoke Test', () => {
    test('should have required environment variables', async () => {
      const response = await client.get('/api/health', 200)
      
      // These should be true if environment is properly configured
      expect(response.json.hasDb).toBe(true)
      expect(response.json.hasJwt).toBe(true)
      
      // Registration enabled status should be a boolean
      expect(typeof response.json.registrationEnabled).toBe('boolean')
    })
  })
})
