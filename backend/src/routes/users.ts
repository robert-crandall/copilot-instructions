import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, userValidationSchema } from '../db';
import { users } from '../db/schema';
import { env } from '../env';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { hashPassword } from '../utils/auth';

// Registration validator schema
const registerSchema = userValidationSchema;

const app = new Hono();

// User registration endpoint
app.post('/', zValidator('json', registerSchema), async (c) => {
  // Check if registration is allowed
  if (!env.ALLOW_REGISTRATION) {
    return c.json({ error: 'Registration is currently disabled' }, 403);
  }

  const data = c.req.valid('json');
  const { name, email, password } = data;

  try {
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length > 0) {
      return c.json({ error: 'Email already in use' }, 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db.insert(users)
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
      });

    // Generate JWT token
    const token = await sign(
      { 
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      env.JWT_SECRET
    );

    return c.json({ 
      user: newUser,
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

export default app;
