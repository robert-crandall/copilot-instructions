# Hono Stacks Examples

This directory contains practical examples of using the Hono RPC pattern for end-to-end type safety.

## Basic CRUD Example

This example shows how to create a complete CRUD API with full type safety from backend to frontend.

### Backend Example (`backend/src/routes/todos.ts`)

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

// Zod schemas for validation - these automatically provide TypeScript types
const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

const updateTodoSchema = createTodoSchema.partial();

// Todo type is inferred from the database schema
interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database - replace with real database calls
let todos: Todo[] = [
  {
    id: '1',
    title: 'Learn Hono',
    description: 'Understand the RPC pattern',
    priority: 'high',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Chain all route methods for RPC compatibility
const app = new Hono()
  // GET /todos - List all todos
  .get('/', async (c) => {
    return c.json({ 
      success: true, 
      data: todos,
      total: todos.length 
    });
  })
  
  // POST /todos - Create new todo
  .post('/', zValidator('json', createTodoSchema), async (c) => {
    const data = c.req.valid('json'); // Fully typed from Zod schema
    
    const newTodo: Todo = {
      id: Math.random().toString(36).substring(7),
      ...data,
      description: data.description || null,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    todos.push(newTodo);
    
    return c.json({ 
      success: true, 
      data: newTodo 
    }, 201);
  })
  
  // GET /todos/:id - Get single todo
  .get('/:id', async (c) => {
    const id = c.req.param('id'); // Type-safe parameter extraction
    const todo = todos.find(t => t.id === id);
    
    if (!todo) {
      throw new HTTPException(404, { message: 'Todo not found' });
    }
    
    return c.json({ 
      success: true, 
      data: todo 
    });
  })
  
  // PUT /todos/:id - Update todo
  .put('/:id', zValidator('json', updateTodoSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json'); // Partial update data
    
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      throw new HTTPException(404, { message: 'Todo not found' });
    }
    
    todos[todoIndex] = {
      ...todos[todoIndex],
      ...data,
      updatedAt: new Date()
    };
    
    return c.json({ 
      success: true, 
      data: todos[todoIndex] 
    });
  })
  
  // PATCH /todos/:id/toggle - Toggle completion status
  .patch('/:id/toggle', async (c) => {
    const id = c.req.param('id');
    const todoIndex = todos.findIndex(t => t.id === id);
    
    if (todoIndex === -1) {
      throw new HTTPException(404, { message: 'Todo not found' });
    }
    
    todos[todoIndex].completed = !todos[todoIndex].completed;
    todos[todoIndex].updatedAt = new Date();
    
    return c.json({ 
      success: true, 
      data: todos[todoIndex] 
    });
  })
  
  // DELETE /todos/:id - Delete todo
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const todoIndex = todos.findIndex(t => t.id === id);
    
    if (todoIndex === -1) {
      throw new HTTPException(404, { message: 'Todo not found' });
    }
    
    todos.splice(todoIndex, 1);
    
    return c.json({ success: true });
  });

export default app;
```

### Add to Main App (`backend/src/index.ts`)

```typescript
import todosRoutes from './routes/todos';

const routes = app
  .get('/api/health', (c) => c.json({ status: 'ok' }))
  .route('/api/todos', todosRoutes) // Mount todos routes
  .route('/api/users', usersRoutes);

// Export includes all routes - todos are now part of AppType
export type AppType = typeof routes;
```

### Frontend Service (`frontend/src/lib/todos.ts`)

```typescript
import { api } from './api';
import type { AppType } from '../../../backend/src/index';

// Extract types from the API - no manual type definitions!
type TodosListResponse = Awaited<ReturnType<typeof api.todos.$get>>['json'];
type CreateTodoData = Parameters<typeof api.todos.$post>[0]['json'];
type UpdateTodoData = Parameters<typeof api.todos[':id'].$put>[0]['json'];

export const todosService = {
  // List all todos
  async list() {
    const response = await api.todos.$get();
    
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    
    return response.json(); // Type: { success: boolean, data: Todo[], total: number }
  },

  // Create new todo
  async create(data: CreateTodoData) {
    const response = await api.todos.$post({ json: data });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create todo');
    }
    
    return response.json(); // Type: { success: boolean, data: Todo }
  },

  // Get single todo
  async getById(id: string) {
    const response = await api.todos[':id'].$get({ param: { id } });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch todo');
    }
    
    return response.json(); // Type: { success: boolean, data: Todo }
  },

  // Update todo
  async update(id: string, data: UpdateTodoData) {
    const response = await api.todos[':id'].$put({ 
      param: { id }, 
      json: data 
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update todo');
    }
    
    return response.json(); // Type: { success: boolean, data: Todo }
  },

  // Toggle completion
  async toggleComplete(id: string) {
    const response = await api.todos[':id'].toggle.$patch({ param: { id } });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle todo');
    }
    
    return response.json(); // Type: { success: boolean, data: Todo }
  },

  // Delete todo
  async delete(id: string) {
    const response = await api.todos[':id'].$delete({ param: { id } });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete todo');
    }
    
    return response.json(); // Type: { success: boolean }
  }
};
```

### Svelte Component (`frontend/src/routes/todos/+page.svelte`)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { todosService } from '$lib/todos';
  
  // Extract type from service response
  type Todo = Awaited<ReturnType<typeof todosService.list>>['data'][0];
  
  let todos: Todo[] = [];
  let newTodo = {
    title: '',
    description: '',
    priority: 'medium' as const
  };
  let loading = false;
  let error = '';

  onMount(loadTodos);

  async function loadTodos() {
    try {
      loading = true;
      const result = await todosService.list();
      todos = result.data; // Fully typed
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load todos';
    } finally {
      loading = false;
    }
  }

  async function createTodo() {
    if (!newTodo.title.trim()) return;
    
    try {
      const result = await todosService.create(newTodo);
      todos = [...todos, result.data]; // Type-safe array operation
      newTodo = { title: '', description: '', priority: 'medium' };
      error = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create todo';
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      const result = await todosService.toggleComplete(todo.id);
      todos = todos.map(t => t.id === todo.id ? result.data : t);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to toggle todo';
    }
  }

  async function deleteTodo(todo: Todo) {
    try {
      await todosService.delete(todo.id);
      todos = todos.filter(t => t.id !== todo.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete todo';
    }
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Todos</h1>
  
  {#if error}
    <div class="alert alert-error mb-4">
      {error}
    </div>
  {/if}

  <!-- Create Todo Form -->
  <form on:submit|preventDefault={createTodo} class="mb-6">
    <div class="form-control">
      <input 
        type="text" 
        placeholder="What needs to be done?" 
        bind:value={newTodo.title}
        class="input input-bordered"
        required
      />
    </div>
    
    <div class="form-control">
      <textarea 
        placeholder="Description (optional)"
        bind:value={newTodo.description}
        class="textarea textarea-bordered mt-2"
      ></textarea>
    </div>
    
    <div class="form-control">
      <select bind:value={newTodo.priority} class="select select-bordered mt-2">
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
    </div>
    
    <button type="submit" class="btn btn-primary mt-2">
      Add Todo
    </button>
  </form>

  <!-- Todos List -->
  {#if loading}
    <div class="loading loading-spinner"></div>
  {:else if todos.length === 0}
    <p class="text-gray-500">No todos yet. Add one above!</p>
  {:else}
    <div class="space-y-2">
      {#each todos as todo (todo.id)}
        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={todo.completed}
                  on:change={() => toggleTodo(todo)}
                  class="checkbox"
                />
                <div class:line-through={todo.completed}>
                  <h3 class="font-semibold">{todo.title}</h3>
                  {#if todo.description}
                    <p class="text-sm text-gray-600">{todo.description}</p>
                  {/if}
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="badge badge-{todo.priority === 'high' ? 'error' : todo.priority === 'medium' ? 'warning' : 'info'}">
                  {todo.priority}
                </span>
                <button 
                  on:click={() => deleteTodo(todo)}
                  class="btn btn-error btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

## Key Benefits Demonstrated

1. **No Manual Types**: Frontend never defines Todo interface - it's inferred from backend
2. **Validation Propagation**: Zod schemas in backend automatically validate frontend requests  
3. **Parameter Safety**: Dynamic route parameters (`:id`) are type-checked
4. **Response Typing**: All API responses are automatically typed
5. **Refactoring Safety**: Changing backend types immediately shows errors in frontend
6. **IntelliSense**: Full autocomplete for all API endpoints and properties

## Testing the Example

### Backend Test (`backend/src/tests/todos.test.ts`)

```typescript
import { testClient } from 'hono/testing';
import app from '../routes/todos';

describe('Todos API', () => {
  const client = testClient(app);

  test('should list todos', async () => {
    const res = await client.$get();
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should create todo with validation', async () => {
    const res = await client.$post({
      json: {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high'
      }
    });
    
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Test Todo');
  });

  test('should validate required fields', async () => {
    const res = await client.$post({
      json: { title: '' } // Invalid: empty title
    });
    
    expect(res.status).toBe(400); // Zod validation error
  });
});
```

### Frontend Test (Playwright)

```typescript
// frontend/src/tests/todos.spec.ts
import { test, expect } from '@playwright/test';

test('todos CRUD operations', async ({ page }) => {
  await page.goto('/todos');

  // Create todo
  await page.fill('input[placeholder="What needs to be done?"]', 'Test Todo');
  await page.selectOption('select', 'high');
  await page.click('button:has-text("Add Todo")');

  // Verify creation
  await expect(page.locator('text=Test Todo')).toBeVisible();
  await expect(page.locator('.badge-error')).toBeVisible(); // High priority

  // Toggle completion
  await page.click('input[type="checkbox"]');
  await expect(page.locator('text=Test Todo').locator('..')).toHaveClass(/line-through/);

  // Delete todo
  await page.click('button:has-text("Delete")');
  await expect(page.locator('text=Test Todo')).not.toBeVisible();
});
```

This example shows the complete flow from backend definition to frontend usage with full type safety at every step.