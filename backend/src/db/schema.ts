import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}))

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  })
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
