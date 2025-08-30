import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { users } from '../db/schema';
import { env } from '../env';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { hashPassword, verifyPassword } from '../utils/auth';
import { registerSchema, loginSchema } from '../validation/users';

// Chain methods for RPC compatibility
const app = new Hono()
  // Check if registration token is required
  .get('/registration-status', async (c) => {
    const tokenPresent = env.REGISTRATION_TOKEN.length > 0;
    return c.json({ enabled: tokenPresent, required: tokenPresent });
  })
  // User registration endpoint
  .post('/', zValidator('json', registerSchema), async (c) => {
    const data = c.req.valid('json');
    const { name, email, password, registrationToken } = data as typeof data & { registrationToken?: string };

    const tokenPresent = env.REGISTRATION_TOKEN.length > 0;
    if (!tokenPresent) {
      return c.json({ error: 'Registration is currently disabled' }, 403);
    }
    if (!registrationToken) {
      return c.json({ error: 'Registration token is required' }, 403);
    }
    if (registrationToken !== env.REGISTRATION_TOKEN) {
      return c.json({ error: 'Invalid registration token' }, 403);
    }

    try {
      // Check if user already exists
      const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUsers.length > 0) {
        return c.json({ error: 'Email already in use' }, 409);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      // Generate JWT token
      const token = await sign(
        {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          iat: Math.floor(Date.now() / 1000), // issued at
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // expires in 24 hours
        },
        env.JWT_SECRET,
      );

      return c.json(
        {
          user: newUser,
          token,
        },
        201,
      );
    } catch (error) {
      console.error('Registration error:', error);
      return c.json({ error: 'Failed to register user' }, 500);
    }
  })
  // User login endpoint
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const data = c.req.valid('json');
    const { email, password, rememberMe } = data;

    try {
      // Find user by email
      const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUsers.length === 0) {
        return c.json({ error: 'Invalid email or password' }, 401);
      }

      const user = existingUsers[0];

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return c.json({ error: 'Invalid email or password' }, 401);
      }

      // Generate JWT token with appropriate expiration
      const expirationTime = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
      const token = await sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          iat: Math.floor(Date.now() / 1000), // issued at
          exp: Math.floor(Date.now() / 1000) + expirationTime,
        },
        env.JWT_SECRET,
      );

      return c.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        },
        200,
      );
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Failed to login user' }, 500);
    }
  });

export default app;
