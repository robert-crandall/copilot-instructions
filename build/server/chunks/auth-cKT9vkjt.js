import { verify, hash } from '@node-rs/argon2';
import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, timestamp, uuid, text } from 'drizzle-orm/pg-core';
import { d as private_env } from './shared-server-BfUoNEXY.js';
import { eq } from 'drizzle-orm';

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
const content = pgTable("content", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  content,
  sessions,
  users
}, Symbol.toStringTag, { value: "Module" }));
if (!private_env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const client = postgres(private_env.DATABASE_URL);
const db = drizzle(client, { schema });
const SESSION_DURATION = 1e3 * 60 * 60 * 24 * 30;
async function hashPassword(password) {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}
async function verifyPassword(hash2, password) {
  return await verify(hash2, password);
}
async function createSession(userId) {
  const sessionId = nanoid();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt
  });
  return sessionId;
}
async function validateSession(sessionId) {
  const result = await db.select({
    user: users,
    session: sessions
  }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(eq(sessions.id, sessionId)).limit(1);
  if (result.length === 0) {
    return null;
  }
  const { user, session } = result[0];
  if (session.expiresAt < /* @__PURE__ */ new Date()) {
    await deleteSession(sessionId);
    return null;
  }
  return { user, session };
}
async function deleteSession(sessionId) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
async function createUser(email, password, displayName) {
  const passwordHash = await hashPassword(password);
  const result = await db.insert(users).values({
    email,
    passwordHash,
    displayName
  }).returning();
  return result[0];
}
async function getUserByEmail(email) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    return null;
  }
  return user;
}

export { authenticateUser as a, createUser as b, createSession as c, deleteSession as d, getUserByEmail as g, validateSession as v };
//# sourceMappingURL=auth-cKT9vkjt.js.map
