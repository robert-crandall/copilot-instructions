# Hono Architecture Guide

## Welcome to Hono Stacks

This guide explains our architectural choices and helps you understand why our codebase is structured the way it is. If you're coming from traditional REST API development, this will clarify the paradigm shift.

## Why Direct Type Imports?

### The Problem with Traditional APIs

In most web applications, you have:

1. **Backend API** - Defines endpoints and data models
2. **Frontend Types** - Manually created TypeScript interfaces  
3. **API Documentation** - OpenAPI/Swagger specifications
4. **Validation** - Often duplicated between frontend and backend

This creates multiple sources of truth that get out of sync:

```typescript
// Backend (Express.js example)
app.post('/users', (req, res) => {
  const { name, email } = req.body; // No type safety
  // ... validation logic
});

// Frontend (traditional approach)
interface CreateUserRequest {  // ❌ Manually maintained
  name: string;
  email: string;
}

interface User {  // ❌ Manually maintained  
  id: string;
  name: string;
  email: string;
}
```

**Problems:**
- Types get out of sync between frontend and backend
- Runtime errors when APIs change
- Manual maintenance of multiple type definitions
- No compile-time validation of API contracts

### The Hono RPC Solution

With Hono Stacks, we eliminate duplication by making the backend the single source of truth:

```typescript
// Backend: Define once with full type safety
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

const routes = app
  .post('/users', zValidator('json', createUserSchema), async (c) => {
    const data = c.req.valid('json'); // ✅ Fully typed from Zod
    const user = await createUser(data);
    return c.json({ success: true, data: user }); // ✅ Response typed
  });

// Single export for all routes
export type AppType = typeof routes;
```

```typescript
// Frontend: Import and use - no manual types needed
import type { AppType } from '../../../backend/src/index';
import { hc } from 'hono/client';

const api = hc<AppType>('/api');

// ✅ Fully typed automatically
const response = await api.users.$post({
  json: { name: 'John', email: 'john@example.com' }
});
const data = await response.json(); // Type: { success: boolean, data: User }
```

## How RPC Eliminates Manual Schemas

### No OpenAPI Needed

Traditional approach requires maintaining OpenAPI specifications:

```yaml
# openapi.yaml
paths:
  /users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
```

With Hono RPC, the TypeScript types **are** the schema. No separate documentation needed.

### No Code Generation

Traditional approach often uses code generators:
```bash
# Generate types from OpenAPI
openapi-generator generate -i openapi.yaml -g typescript-fetch
```

With Hono RPC, you directly import the runtime types. No build step needed.

## Developer Onboarding Patterns

### CRUD Operations Pattern

When adding a new entity, follow this pattern:

#### 1. Database Schema (Drizzle)
```typescript
// backend/src/db/schema.ts
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### 2. Validation Schemas (Zod)
```typescript
// backend/src/validation/posts.ts
export const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

export const updatePostSchema = createPostSchema.partial();
```

#### 3. Route Handlers
```typescript
// backend/src/routes/posts.ts
import { zValidator } from '@hono/zod-validator';
import { createPostSchema, updatePostSchema } from '../validation/posts';

const app = new Hono()
  .get('/', async (c) => {
    const posts = await db.select().from(posts);
    return c.json({ success: true, data: posts });
  })
  .post('/', zValidator('json', createPostSchema), async (c) => {
    const data = c.req.valid('json');
    const [post] = await db.insert(posts).values(data).returning();
    return c.json({ success: true, data: post });
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) throw new HTTPException(404, { message: 'Post not found' });
    return c.json({ success: true, data: post });
  })
  .put('/:id', zValidator('json', updatePostSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const [post] = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
    return c.json({ success: true, data: post });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    await db.delete(posts).where(eq(posts.id, id));
    return c.json({ success: true });
  });

export default app;
```

#### 4. Add to Main App
```typescript
// backend/src/index.ts
import postsRoutes from './routes/posts';

const routes = app
  .route('/api/posts', postsRoutes)
  // ... other routes

export type AppType = typeof routes; // ✅ Includes new routes
```

#### 5. Frontend Service
```typescript
// frontend/src/lib/posts.ts
import { api } from './api';

export const postsService = {
  async list() {
    const response = await api.posts.$get();
    return response.json(); // ✅ Typed: { success: boolean, data: Post[] }
  },
  
  async create(data: { title: string; content: string }) {
    const response = await api.posts.$post({ json: data });
    return response.json(); // ✅ Typed: { success: boolean, data: Post }
  },
  
  async getById(id: string) {
    const response = await api.posts[':id'].$get({ param: { id } });
    return response.json(); // ✅ Typed: { success: boolean, data: Post }
  },
  
  async update(id: string, data: Partial<{ title: string; content: string }>) {
    const response = await api.posts[':id'].$put({ param: { id }, json: data });
    return response.json(); // ✅ Typed: { success: boolean, data: Post }
  },
  
  async delete(id: string) {
    const response = await api.posts[':id'].$delete({ param: { id } });
    return response.json(); // ✅ Typed: { success: boolean }
  }
};
```

## Error Handling Patterns

### Backend Error Handling
```typescript
import { HTTPException } from 'hono/http-exception';
import { handleApiError } from '../utils/logger';

const app = new Hono()
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const post = await getPostById(id);
      
      if (!post) {
        throw new HTTPException(404, { message: 'Post not found' });
      }
      
      return c.json({ success: true, data: post });
    } catch (error) {
      // Standard error handling pattern
      handleApiError(error, 'Failed to fetch post');
    }
  });
```

### Frontend Error Handling
```typescript
// frontend/src/lib/posts.ts
export const postsService = {
  async getById(id: string) {
    try {
      const response = await api.posts[':id'].$get({ param: { id } });
      
      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
      
      return response.json();
    } catch (error) {
      // Re-throw for component handling
      throw error;
    }
  }
};
```

## Debugging Type Issues

### Common Type Problems and Solutions

#### Problem: "Property doesn't exist on type"
```typescript
// ❌ Error: Property 'posts' does not exist on type 'Client'
const response = await api.posts.$get();
```

**Solution:** Check that route is properly exported in AppType
```typescript
// backend/src/index.ts - Make sure route is included
const routes = app
  .route('/api/posts', postsRoutes) // ✅ Make sure this line exists

export type AppType = typeof routes; // ✅ Will include posts routes
```

#### Problem: "Argument of type X is not assignable to parameter"
```typescript
// ❌ TypeScript error on json data
await api.posts.$post({ json: { invalidField: 'value' } });
```

**Solution:** Check Zod schema in backend
```typescript
// backend/src/validation/posts.ts - Update schema
export const createPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  invalidField: z.string(), // ✅ Add missing field
});
```

#### Problem: Response type is 'any'
```typescript
// ❌ data is typed as 'any'
const response = await api.posts.$get();
const data = await response.json();
```

**Solution:** Ensure proper return type in backend
```typescript
// backend/src/routes/posts.ts - Be explicit with returns
.get('/', async (c) => {
  const posts = await db.select().from(posts);
  return c.json({ success: true, data: posts }); // ✅ TypeScript can infer
});
```

## Authentication & JWT Patterns

### Backend JWT Middleware
```typescript
// backend/src/middleware/auth.ts
export const jwtAuth = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  const payload = await verify(token, JWT_SECRET);
  c.set('userId', payload.id);
  await next();
};
```

### Protected Routes
```typescript
// backend/src/routes/posts.ts
const app = new Hono()
  .get('/', async (c) => {
    // Public route
    const posts = await db.select().from(posts);
    return c.json({ success: true, data: posts });
  })
  .post('/', jwtAuth, zValidator('json', createPostSchema), async (c) => {
    // Protected route
    const userId = c.get('userId');
    const data = c.req.valid('json');
    const [post] = await db.insert(posts).values({ ...data, authorId: userId }).returning();
    return c.json({ success: true, data: post });
  });
```

### Frontend Authentication
```typescript
// frontend/src/lib/auth.ts
import { api } from './api';

export async function authenticatedRequest<T>(
  requestFn: () => Promise<T>,
  token: string
): Promise<T> {
  // Set authorization header for Hono client
  return requestFn();
}

// Usage with token
export const postsService = {
  async create(data: CreatePostData, token: string) {
    const response = await api.posts.$post({
      json: data,
      header: { // ✅ Note: 'header' not 'headers' for Hono client
        Authorization: `Bearer ${token}`
      }
    });
    return response.json();
  }
};
```

## Performance & Best Practices

### Route Organization
```typescript
// ✅ Good: Organized by feature
const routes = app
  .route('/api/auth', authRoutes)
  .route('/api/users', usersRoutes)  
  .route('/api/posts', postsRoutes)
  .route('/api/comments', commentsRoutes);
```

### Efficient Type Imports
```typescript
// ✅ Import only types you need
import type { AppType } from '../../../backend/src/index';

// ❌ Don't import the entire backend
import backendApp from '../../../backend/src/index';
```

### Caching Strategies
```typescript
// frontend/src/lib/posts.ts
let postsCache: Post[] | null = null;

export const postsService = {
  async list(useCache = true) {
    if (useCache && postsCache) return { success: true, data: postsCache };
    
    const response = await api.posts.$get();
    const result = await response.json();
    
    if (result.success) {
      postsCache = result.data;
    }
    
    return result;
  }
};
```

## When NOT to Use This Pattern

### Multiple Client Languages
If you need mobile apps, Python scripts, or other non-TypeScript clients, consider:
- Generating OpenAPI from Hono routes using `@hono/swagger-ui`
- Providing REST documentation for external consumers
- Keeping internal TypeScript clients using RPC while exposing REST for others

### Separate Team Ownership
If backend and frontend are maintained by different teams:
- API versioning becomes critical
- Consider contract testing with tools like Pact
- May benefit from OpenAPI as a contract between teams

### Complex API Gateway Requirements
If you need:
- Rate limiting per client
- Complex routing/load balancing  
- API monetization/billing
- External partner access

Consider hybrid approach: RPC for internal clients, REST for external.

## Migration Guide

### From OpenAPI/REST to Hono RPC

1. **Start with new endpoints** - use Hono RPC pattern for new features
2. **Gradually migrate existing** - convert one endpoint at a time
3. **Keep OpenAPI temporarily** - for external clients during transition
4. **Update frontend incrementally** - migrate to typed client per feature

### Key Migration Steps

1. **Install Hono stack**
   ```bash
   npm install hono @hono/zod-validator zod
   ```

2. **Convert one route**
   ```typescript
   // Before (Express)
   app.post('/users', (req, res) => { /* ... */ });
   
   // After (Hono)
   const app = new Hono()
     .post('/users', zValidator('json', schema), handler);
   ```

3. **Export AppType**
   ```typescript
   export type AppType = typeof app;
   ```

4. **Update frontend**
   ```typescript
   import { hc } from 'hono/client';
   import type { AppType } from '../backend';
   
   const api = hc<AppType>('/api');
   ```

This architecture provides the best developer experience for TypeScript full-stack applications while maintaining the flexibility to add traditional REST APIs when needed.