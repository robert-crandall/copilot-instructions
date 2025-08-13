# Shared Types Package

This package contains shared type definitions used across both frontend and backend to ensure end-to-end type safety.

## Purpose

The `packages/types` directory serves as the single source of truth for data type definitions, eliminating duplicate type definitions and ensuring consistency across the full stack.

## Structure

- `index.ts` - Main entry point, re-exports all shared types
- `users.ts` - User-related type definitions
- Additional type files can be added as the application grows

## Usage

### In Backend

```typescript
// Re-export shared types for backwards compatibility
export type { User, PublicUser, NewUser, UserUpdate } from 'types';
```

### In Frontend

```typescript
// Import shared types directly
import type { User, PublicUser } from 'types';
```

### In Frontend Components

```typescript
// Use in component props or stores
import type { PublicUser } from 'types';

let user: PublicUser | null = null;
```

## Available Types

### User Types

- `User` - Complete user object (includes sensitive fields like password)
- `PublicUser` - User object safe for API responses (excludes password)
- `NewUser` - Data required to create a new user
- `UserUpdate` - Data that can be updated for an existing user (all fields optional)

## Benefits

- **Single Source of Truth**: All data types defined in one place
- **End-to-End Type Safety**: Changes propagate automatically from backend to frontend
- **No Duplication**: Eliminates duplicate type definitions across the codebase
- **Clear Separation**: Data types vs API types (AppType) are clearly separated
- **Maintainability**: Easier to maintain and update shared contracts

## Guidelines

1. **Always import from `types`**: Never duplicate type definitions
2. **Keep types pure**: Don't include business logic in type definitions
3. **Use semantic names**: Type names should be clear and descriptive
4. **Document complex types**: Add JSDoc comments for complex types
5. **Version carefully**: Type changes can break both frontend and backend
