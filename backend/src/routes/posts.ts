import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index'
import { posts, users } from '../db/schema'
import { authMiddleware } from '../auth/middleware'
import { createPostSchema, updatePostSchema } from '../types'

type Variables = {
  userId: string
}

const postsRouter = new Hono<{ Variables: Variables }>()

// Get all posts
postsRouter.get('/', async (c) => {
  const allPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      userId: posts.userId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user: {
        id: users.id,
        name: users.name
      }
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))

  return c.json(allPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString()
  })))
})

// Create a new post (protected)
postsRouter.post('/',
  authMiddleware,
  zValidator('json', createPostSchema),
  async (c) => {
    const { content } = c.req.valid('json')
    const userId = c.var.userId

    const [newPost] = await db.insert(posts).values({
      content,
      userId
    }).returning()

    // Get the post with user info
    const [postWithUser] = await db
      .select({
        id: posts.id,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name
        }
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, newPost.id))

    return c.json({
      ...postWithUser,
      createdAt: postWithUser.createdAt.toISOString(),
      updatedAt: postWithUser.updatedAt.toISOString()
    }, 201)
  }
)

// Update a post (protected)
postsRouter.put('/:id',
  authMiddleware,
  zValidator('json', updatePostSchema),
  async (c) => {
    const postId = c.req.param('id')
    const { content } = c.req.valid('json')
    const userId = c.var.userId

    // Check if post exists and belongs to user
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
    if (!existingPost) {
      throw new HTTPException(404, { message: 'Post not found' })
    }
    if (existingPost.userId !== userId) {
      throw new HTTPException(403, { message: 'You can only edit your own posts' })
    }

    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        content,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning()

    // Get the post with user info
    const [postWithUser] = await db
      .select({
        id: posts.id,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name
        }
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))

    return c.json({
      ...postWithUser,
      createdAt: postWithUser.createdAt.toISOString(),
      updatedAt: postWithUser.updatedAt.toISOString()
    })
  }
)

// Delete a post (protected)
postsRouter.delete('/:id',
  authMiddleware,
  async (c) => {
    const postId = c.req.param('id')
    const userId = c.var.userId

    // Check if post exists and belongs to user
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
    if (!existingPost) {
      throw new HTTPException(404, { message: 'Post not found' })
    }
    if (existingPost.userId !== userId) {
      throw new HTTPException(403, { message: 'You can only delete your own posts' })
    }

    // Delete the post
    await db.delete(posts).where(eq(posts.id, postId))

    return c.json({ message: 'Post deleted successfully' })
  }
)

export default postsRouter
