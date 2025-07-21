import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { 
  TestClient, 
  generateTestUserData,
  cleanupTestUserByEmail,
  createTestUser,
  createTestPost,
  expectValidPost,
  generateTestId
} from './helpers'

describe('Posts API', () => {
  let client: TestClient
  let testUserEmails: string[] = []

  beforeEach(() => {
    client = new TestClient()
    testUserEmails = []
  })

  afterEach(async () => {
    // Cleanup test users (posts will be cascaded)
    for (const email of testUserEmails) {
      await cleanupTestUserByEmail(email)
    }
  })

  describe('GET /api/posts', () => {
    test('should return empty array when no posts exist', async () => {
      const response = await client.get('/api/posts', 200)
      expect(Array.isArray(response.json)).toBe(true)
    })

    test('should return all posts with user information', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      // Create user and post
      const { user } = await createTestUser(client, userData)
      const post = await createTestPost(client, 'Test post content')

      // Get all posts without authentication (public endpoint)
      client.clearAuthToken()
      const response = await client.get('/api/posts', 200)
      
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json.length).toBeGreaterThanOrEqual(1)

      const foundPost = response.json.find((p: any) => p.id === post.id)
      expect(foundPost).toBeDefined()
      expectValidPost(foundPost)
      expect(foundPost.content).toBe('Test post content')
      expect(foundPost.user.id).toBe(user.id)
      expect(foundPost.user.name).toBe(user.name)
    })

    test('should return posts in chronological order (newest first)', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      // Create multiple posts with slight delay
      const post1 = await createTestPost(client, 'First post')
      await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
      const post2 = await createTestPost(client, 'Second post')
      await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
      const post3 = await createTestPost(client, 'Third post')

      client.clearAuthToken()
      const response = await client.get('/api/posts', 200)
      
      expect(Array.isArray(response.json)).toBe(true)
      const posts = response.json

      // Find our test posts
      const testPosts = posts.filter((p: any) => 
        [post1.id, post2.id, post3.id].includes(p.id)
      ).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      expect(testPosts.length).toBe(3)
      expect(testPosts[0].content).toBe('Third post')
      expect(testPosts[1].content).toBe('Second post')
      expect(testPosts[2].content).toBe('First post')
    })
  })

  describe('POST /api/posts', () => {
    test('should create a new post successfully', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      const { user } = await createTestUser(client, userData)
      const content = `Test post content ${generateTestId()}`

      const response = await client.post('/api/posts', { content }, 201)
      
      expectValidPost(response.json)
      expect(response.json.content).toBe(content)
      expect(response.json.userId).toBe(user.id)
      expect(response.json.user.id).toBe(user.id)
      expect(response.json.user.name).toBe(user.name)
    })

    test('should require authentication', async () => {
      client.clearAuthToken()
      
      const response = await client.post('/api/posts', {
        content: 'This should fail'
      }, 401)
      
      expect(response.json.error).toContain('Authorization token required')
    })

    test('should validate content is required', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      const response = await client.post('/api/posts', {}, 400)
      expect(response.json.error).toContain('Content is required')
    })

    test('should validate content is not empty', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      const response = await client.post('/api/posts', { content: '' }, 400)
      expect(response.json.error).toContain('Content is required')
    })

    test('should validate content length limit', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      const longContent = 'a'.repeat(281) // Over 280 character limit
      const response = await client.post('/api/posts', { content: longContent }, 400)
      expect(response.json.error).toContain('280 characters')
    })

    test('should accept content at character limit', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      const exactLimitContent = 'a'.repeat(280) // Exactly 280 characters
      const response = await client.post('/api/posts', { content: exactLimitContent }, 201)
      expectValidPost(response.json)
      expect(response.json.content).toBe(exactLimitContent)
    })
  })

  describe('PUT /api/posts/:id', () => {
    test('should update own post successfully', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)
      const post = await createTestPost(client, 'Original content')

      const newContent = `Updated content ${generateTestId()}`
      const response = await client.put(`/api/posts/${post.id}`, { content: newContent }, 200)

      expectValidPost(response.json)
      expect(response.json.id).toBe(post.id)
      expect(response.json.content).toBe(newContent)
      expect(response.json.updatedAt).not.toBe(response.json.createdAt)
    })

    test('should require authentication', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)
      const post = await createTestPost(client, 'Original content')

      client.clearAuthToken()
      const response = await client.put(`/api/posts/${post.id}`, {
        content: 'Updated content'
      }, 401)

      expect(response.json.error).toContain('Authorization token required')
    })

    test('should not allow updating non-existent post', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      const fakeId = '123e4567-e89b-12d3-a456-426614174000'
      const response = await client.put(`/api/posts/${fakeId}`, {
        content: 'Updated content'
      }, 404)

      expect(response.json.error).toContain('not found')
    })

    test('should not allow updating another user\'s post', async () => {
      const userData1 = generateTestUserData()
      const userData2 = generateTestUserData()
      testUserEmails.push(userData1.email, userData2.email)

      // Create first user and post
      await createTestUser(client, userData1)
      const post = await createTestPost(client, 'Original content')

      // Create second user
      const client2 = new TestClient()
      await createTestUser(client2, userData2)

      // Try to update first user's post as second user
      const response = await client2.put(`/api/posts/${post.id}`, {
        content: 'Hacked content'
      }, 403)

      expect(response.json.error).toContain('only edit your own posts')
    })

    test('should validate updated content', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)
      const post = await createTestPost(client, 'Original content')

      // Empty content
      const response1 = await client.put(`/api/posts/${post.id}`, { content: '' }, 400)
      expect(response1.json.error).toContain('Content is required')

      // Too long content
      const longContent = 'a'.repeat(281)
      const response2 = await client.put(`/api/posts/${post.id}`, { content: longContent }, 400)
      expect(response2.json.error).toContain('280 characters')
    })
  })

  describe('DELETE /api/posts/:id', () => {
    test('should delete own post successfully', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)
      const post = await createTestPost(client, 'Content to delete')

      const response = await client.delete(`/api/posts/${post.id}`, 200)
      expect(response.json.message).toContain('deleted successfully')

      // Verify post is actually deleted
      client.clearAuthToken()
      const postsResponse = await client.get('/api/posts', 200)
      const deletedPost = postsResponse.json.find((p: any) => p.id === post.id)
      expect(deletedPost).toBeUndefined()
    })

    test('should require authentication', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)
      const post = await createTestPost(client, 'Content to delete')

      client.clearAuthToken()
      const response = await client.delete(`/api/posts/${post.id}`, 401)
      expect(response.json.error).toContain('Authorization token required')
    })

    test('should not allow deleting non-existent post', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      await createTestUser(client, userData)

      const fakeId = '123e4567-e89b-12d3-a456-426614174000'
      const response = await client.delete(`/api/posts/${fakeId}`, 404)
      expect(response.json.error).toContain('not found')
    })

    test('should not allow deleting another user\'s post', async () => {
      const userData1 = generateTestUserData()
      const userData2 = generateTestUserData()
      testUserEmails.push(userData1.email, userData2.email)

      // Create first user and post
      await createTestUser(client, userData1)
      const post = await createTestPost(client, 'Content to protect')

      // Create second user
      const client2 = new TestClient()
      await createTestUser(client2, userData2)

      // Try to delete first user's post as second user
      const response = await client2.delete(`/api/posts/${post.id}`, 403)
      expect(response.json.error).toContain('only delete your own posts')

      // Verify post still exists
      client.clearAuthToken()
      const postsResponse = await client.get('/api/posts', 200)
      const stillExistsPost = postsResponse.json.find((p: any) => p.id === post.id)
      expect(stillExistsPost).toBeDefined()
    })
  })

  describe('Posts Integration Tests', () => {
    test('should support full CRUD workflow', async () => {
      const userData = generateTestUserData()
      testUserEmails.push(userData.email)

      const { user } = await createTestUser(client, userData)

      // CREATE
      const originalContent = `Original content ${generateTestId()}`
      const createResponse = await client.post('/api/posts', { content: originalContent }, 201)
      const postId = createResponse.json.id
      expect(createResponse.json.content).toBe(originalContent)

      // READ (verify it appears in list)
      client.clearAuthToken()
      const readResponse = await client.get('/api/posts', 200)
      const foundPost = readResponse.json.find((p: any) => p.id === postId)
      expect(foundPost).toBeDefined()
      expect(foundPost.content).toBe(originalContent)

      // UPDATE
      client.setAuthToken(createResponse.json.token || 'need-to-login-again')
      // If token expired, re-login
      if (!client['authToken']) {
        const loginResponse = await client.post('/api/auth/login', {
          email: userData.email,
          password: userData.password,
          rememberMe: false
        }, 200)
        client.setAuthToken(loginResponse.json.token)
      }

      const updatedContent = `Updated content ${generateTestId()}`
      const updateResponse = await client.put(`/api/posts/${postId}`, { content: updatedContent }, 200)
      expect(updateResponse.json.content).toBe(updatedContent)
      expect(updateResponse.json.id).toBe(postId)

      // READ again (verify update)
      client.clearAuthToken()
      const readAfterUpdateResponse = await client.get('/api/posts', 200)
      const updatedPost = readAfterUpdateResponse.json.find((p: any) => p.id === postId)
      expect(updatedPost.content).toBe(updatedContent)

      // DELETE
      const loginResponse = await client.post('/api/auth/login', {
        email: userData.email,
        password: userData.password,
        rememberMe: false
      }, 200)
      client.setAuthToken(loginResponse.json.token)

      const deleteResponse = await client.delete(`/api/posts/${postId}`, 200)
      expect(deleteResponse.json.message).toContain('deleted successfully')

      // READ final (verify deletion)
      client.clearAuthToken()
      const readAfterDeleteResponse = await client.get('/api/posts', 200)
      const deletedPost = readAfterDeleteResponse.json.find((p: any) => p.id === postId)
      expect(deletedPost).toBeUndefined()
    })

    test('should handle multiple users with isolated posts', async () => {
      const user1Data = generateTestUserData()
      const user2Data = generateTestUserData()
      testUserEmails.push(user1Data.email, user2Data.email)

      // Create two users
      const client1 = new TestClient()
      const client2 = new TestClient()
      
      const { user: user1 } = await createTestUser(client1, user1Data)
      const { user: user2 } = await createTestUser(client2, user2Data)

      // Each user creates a post
      const post1 = await createTestPost(client1, 'User 1 post')
      const post2 = await createTestPost(client2, 'User 2 post')

      // Verify both posts exist and have correct ownership
      const publicClient = new TestClient()
      const postsResponse = await publicClient.get('/api/posts', 200)
      
      const foundPost1 = postsResponse.json.find((p: any) => p.id === post1.id)
      const foundPost2 = postsResponse.json.find((p: any) => p.id === post2.id)
      
      expect(foundPost1).toBeDefined()
      expect(foundPost2).toBeDefined()
      expect(foundPost1.user.id).toBe(user1.id)
      expect(foundPost2.user.id).toBe(user2.id)

      // Verify users can only edit their own posts
      const response1 = await client1.put(`/api/posts/${post2.id}`, { content: 'Hacked!' }, 403)
      expect(response1.json.error).toContain('only edit your own posts')

      const response2 = await client2.put(`/api/posts/${post1.id}`, { content: 'Hacked!' }, 403)
      expect(response2.json.error).toContain('only edit your own posts')

      // Verify users can only delete their own posts
      const response3 = await client1.delete(`/api/posts/${post2.id}`, 403)
      expect(response3.json.error).toContain('only delete your own posts')

      const response4 = await client2.delete(`/api/posts/${post1.id}`, 403)
      expect(response4.json.error).toContain('only delete your own posts')
    })
  })
})
