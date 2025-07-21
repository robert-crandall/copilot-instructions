import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { users } from '../db/schema'
import { hashPassword, verifyPassword, createJWT } from '../auth/utils'
import { createUserSchema, loginSchema } from '../types'

const auth = new Hono()

auth.post('/register', 
  zValidator('json', createUserSchema),
  async (c) => {
    const { name, email, password } = c.req.valid('json')

    // Check if registration is allowed
    if (process.env.ALLOW_REGISTRATION !== 'true') {
      throw new HTTPException(403, { message: 'Registration is currently disabled' })
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) {
      throw new HTTPException(400, { message: 'User with this email already exists' })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    })

    // Generate JWT token
    const token = await createJWT(newUser.id, false)

    return c.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt.toISOString()
      },
      token
    }, 201)
  }
)

auth.post('/login',
  zValidator('json', loginSchema),
  async (c) => {
    const { email, password, rememberMe } = c.req.valid('json')

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      throw new HTTPException(401, { message: 'Invalid email or password' })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new HTTPException(401, { message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = await createJWT(user.id, rememberMe)

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      },
      token
    })
  }
)

export default auth
