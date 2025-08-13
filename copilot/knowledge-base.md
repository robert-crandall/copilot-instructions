# Knowledge Base

This file contains key insights, patterns, and best practices for the project.

## Critical Development Principles

### Type Safety Requirements (CRITICAL)

**ALWAYS USE SHARED TYPES FROM packages/types**

This is the most important rule in the codebase:

- **Frontend MUST import all data types from packages/types**: `import type { User, PublicUser } from 'types'`
- **Backend MUST re-export types from packages/types**: `export type { User } from 'types'`
- **NEVER create duplicate interfaces** that replicate existing shared types
- **NEVER rewrite type definitions** - always import from the shared types package (single source of truth)
- **For API types**: Frontend still imports AppType directly from backend: `import type { AppType } from '../../../backend/src/index'`
- **Fix typing issues by importing proper types** from packages/types, not by creating workarounds

**Types Architecture:**
- `packages/types`: Shared data interfaces (User, PublicUser, etc.)
- `backend/src/index.ts`: Exports AppType for Hono RPC type safety
- Frontend imports both for complete type coverage

### Error Handling

#### Backend Error Handling (Standard Pattern)

We use a standardized error handling approach in all API routes:

```typescript
import logger, { handleApiError } from '../utils/logger'

// In route handlers:
try {
  // Your code here
  return c.json({ success: true, data })
} catch (error) {
  // Standard error handling - logs the error and throws appropriate HTTPException
  handleApiError(error, 'Failed to perform operation')
}
```

The `handleApiError` utility:
1. Logs errors with appropriate level
2. Preserves HTTPExceptions when they occur
3. Wraps other errors with proper status codes
4. Suppresses excessive logging during tests

## Testing

### Testing Philosophy: NO MOCKS

Tests should use real instances instead of mocks whenever possible:

- **✅ DO**: Use real database connections with test databases
- **✅ DO**: Make real API calls in integration tests
- **✅ DO**: Set up proper test environments that mimic production
- **❌ DON'T**: Use mocked database connections
- **❌ DON'T**: Mock API responses
- **❌ DON'T**: Create fake implementations that don't match real behavior

**Benefits of no-mock testing:**
- Tests that catch real integration issues
- Closer to real-world usage scenarios
- Improved confidence in test coverage
- Avoids maintaining both implementation and mock logic

**Implementation guidelines:**
1. Set up dedicated test databases for integration tests
2. Use environment variables to configure test settings
3. Ensure proper cleanup between test runs
4. Containerize dependencies when needed for test isolation

This approach ensures tests validate the actual system behavior rather than just verifying mock interactions.


## Architecture Decisions

### Error Handling Strategy

We follow a standardized error handling approach throughout the codebase:

1. **Central logging utility**: All logs go through the `logger` module
2. **Environment-aware logging**: Different log levels for development, production and tests
3. **Standard error handling pattern**: Use `handleApiError` in catch blocks
4. **HTTP exception preservation**: Original HTTP status codes are preserved
5. **Client vs. Server errors**: 4xx errors can be suppressed in tests, while 5xx always log
6. **Standardization scripts**: Use `scripts/standardize_all_error_handling.sh` to enforce pattern

The `handleApiError` function centralizes the common pattern:
```typescript
// Before standardization
catch (error) {
  logger.error('Error message:', error)
  if (error instanceof HTTPException) throw error
  throw new HTTPException(500, { message: 'User-friendly message' })
}

// After standardization
catch (error) {
  handleApiError(error, 'User-friendly message')
}
```

### Monorepo Structure & Type Safety Philosophy

**Why Direct Type Imports Are Correct for Hono Stacks**

Our architecture intentionally uses direct type imports from backend to frontend. This is not a code smell or temporary solution - it's the **recommended and optimal pattern** for Hono Stacks:

- **Backend and frontend in same repo for tight coupling**
- **Frontend imports backend types directly**: `import type { AppType } from '../../backend/src/index'`
- **Single source of truth**: Backend exports all API types, frontend imports them
- **Shared utilities when beneficial**

**Benefits of this approach:**
- Automatic end-to-end type safety without manual schema definitions
- No OpenAPI/JSON Schema duplication or synchronization issues
- Compile-time validation of API contracts
- Refactoring safety - type changes propagate automatically
- Zero additional tooling or code generation needed

This tight coupling is **intentional** and provides better developer experience than traditional REST API patterns.

### State Management
- Use Svelte stores for global state
- Prefer reactive declarations over complex state management
- Keep component state local when possible

### API Design
- RESTful endpoints where appropriate
- Consistent response structure with `success`, `data`, `error` fields
- Use HTTP status codes appropriately

### Hono RPC vs Traditional REST APIs

**Why We Use Hono RPC Pattern Instead of OpenAPI/REST**

Traditional REST APIs require maintaining separate type definitions:
- Backend defines API endpoints and data models
- Frontend creates separate TypeScript interfaces
- OpenAPI schemas for documentation and validation
- Manual synchronization between all three

**Problems with traditional approach:**
- Type definitions get out of sync
- Runtime errors from mismatched interfaces  
- Manual maintenance of multiple sources of truth
- Complex code generation pipelines
- Breaking changes aren't caught at compile time

**Hono RPC eliminates these problems:**

```typescript
// Backend: Define once with Zod validation
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const routes = app
  .post('/users', zValidator('json', createUserSchema), async (c) => {
    const data = c.req.valid('json'); // Fully typed
    return c.json({ success: true, user: newUser });
  });

export type AppType = typeof routes; // Single type export
```

```typescript
// Frontend: Import and use with full type safety
import type { AppType } from '../../../backend/src/index';
import { hc } from 'hono/client';

const api = hc<AppType>(baseUrl);

// Fully typed - no manual interface definitions needed
const response = await api.users.$post({
  json: { name: 'John', email: 'john@example.com' }
});
const data = await response.json(); // Typed automatically
```

**Key advantages:**
- **Single source of truth**: Types defined once in backend
- **Automatic propagation**: Changes flow from backend to frontend
- **Compile-time safety**: Mismatched types cause TypeScript errors
- **No code generation**: Direct import of runtime types
- **Refactoring safety**: Rename detection works across full stack
- **Developer experience**: IntelliSense works perfectly

**When to use this pattern:**
- ✅ Monorepo with TypeScript frontend and backend
- ✅ Rapid development with frequent API changes
- ✅ Strong type safety requirements
- ✅ Small to medium team with shared codebase ownership

**When traditional REST might be better:**
- ❌ Multi-language clients requiring OpenAPI
- ❌ External API consumers needing documentation
- ❌ Separate teams maintaining frontend and backend
- ❌ Backend and frontend deployed independently with versioning

### Complete End-to-End Example: Adding a New Endpoint

Here's how to add a new feature from backend to frontend with full type safety:

**Step 1: Define Backend Route with Validation**
```typescript
// backend/src/routes/posts.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  tags: z.array(z.string()).optional()
});

const app = new Hono()
  .get('/', async (c) => {
    // List posts
    const posts = await db.select().from(posts);
    return c.json({ success: true, data: posts });
  })
  .post('/', zValidator('json', createPostSchema), async (c) => {
    // Create post with validation
    const data = c.req.valid('json'); // Fully typed from Zod
    const newPost = await db.insert(posts).values(data).returning();
    return c.json({ success: true, data: newPost[0] });
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id'); // Type-safe parameter
    const post = await db.select().from(posts).where(eq(posts.id, id));
    if (!post.length) {
      throw new HTTPException(404, { message: 'Post not found' });
    }
    return c.json({ success: true, data: post[0] });
  });

export default app;
```

**Step 2: Add to Main App for RPC Export**
```typescript
// backend/src/index.ts
import postsRoutes from './routes/posts';

const routes = app
  .get('/api/health', (c) => c.json({ status: 'ok' }))
  .route('/api/posts', postsRoutes) // Mount posts routes
  .route('/api/users', usersRoutes);

// Export for frontend - this includes ALL routes
export type AppType = typeof routes;
```

**Step 3: Use in Frontend with Full Type Safety**
```typescript
// frontend/src/lib/posts.ts
import { api } from './api'; // Typed client
import type { AppType } from '../../../backend/src/index';

// All operations are fully typed automatically
export const postsService = {
  async list() {
    const response = await api.posts.$get();
    return response.json(); // Type: { success: boolean, data: Post[] }
  },

  async create(post: { title: string; content: string; tags?: string[] }) {
    const response = await api.posts.$post({
      json: post // Type validated against Zod schema
    });
    return response.json(); // Type: { success: boolean, data: Post }
  },

  async getById(id: string) {
    const response = await api.posts[':id'].$get({
      param: { id } // Type-safe parameters
    });
    return response.json(); // Type: { success: boolean, data: Post }
  }
};
```

**Step 4: Use in Svelte Component**
```svelte
<!-- frontend/src/routes/posts/+page.svelte -->
<script lang="ts">
  import { postsService } from '$lib/posts';
  import { onMount } from 'svelte';

  let posts: Awaited<ReturnType<typeof postsService.list>>['data'] = [];
  let newPost = { title: '', content: '' };

  onMount(async () => {
    const result = await postsService.list();
    posts = result.data; // Fully typed
  });

  async function createPost() {
    try {
      const result = await postsService.create(newPost);
      posts = [...posts, result.data]; // Type-safe
      newPost = { title: '', content: '' };
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  }
</script>

<!-- Your component markup here -->
```

**Key Benefits Demonstrated:**
- ✅ **No manual type definitions** in frontend
- ✅ **Zod validation** automatically typed in frontend
- ✅ **Parameter typing** for dynamic routes  
- ✅ **Response typing** from backend return types
- ✅ **Compile-time errors** when APIs change
- ✅ **IntelliSense support** throughout the stack

### Hono Client Usage Details

The Hono client has a specific API that differs from standard fetch API:

- **Use `header` (singular) not `headers` (plural)** when setting HTTP headers with the Hono client:

```typescript
// CORRECT: Use 'header' (singular) with Hono client
const response = await api.route.$get({
  header: {
    Authorization: `Bearer ${token}`
  }
});

// INCORRECT: Don't use 'headers' (plural) with Hono client
const response = await api.route.$get({
  headers: { // This won't work with Hono client
    Authorization: `Bearer ${token}`
  }
});
```

- **JWT token field names**: When working with JWT tokens, ensure consistency between token creation and validation:
  - Use `userId` field in JWT tokens

### User ID Field Naming Convention

We follow a standardized approach for user identification fields across the system:

- **Database schema**: Uses `id` as the primary key field
- **JWT tokens**: Use `userId` field internally for compatibility
- **Backend API responses**: Always return `id` field for consistency
- **Frontend models**: Use `id` consistently

When working with JWT payload, remember to map the field name:

```typescript
// Map userId from JWT payload to id in our User model
const user: User = {
  id: payload.userId || '', // JWT payload uses userId
  name: payload.name,
  email: payload.email,
  // other fields...
};
```

This standardization simplifies our codebase by using a single field name (`id`) throughout our API responses and frontend models.

### Database Design
- UUID primary keys for all entities
- Proper foreign key relationships
- Timestamp fields for audit trails
- Snake_case for database, camelCase for TypeScript
