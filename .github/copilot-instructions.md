# Copilot Instructions

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## How We Work: The Core Philosophy

Our goal is to build robust, maintainable features with a consistent and predictable workflow. Follow these core principles above all else.

### 1. One Feature at a Time

- We work on one and only one feature from start to finish.
- Do not make changes unrelated to the current feature. This keeps our commits focused and our work testable.

### 2. The Feature Development Cycle

Every new feature **must** follow this specific, sequential order. Do not skip or reorder steps. Each step must be completed before starting the next.

1.  **Database Schema & Migration**: Define the schema changes in Drizzle, then generate and apply the database migration.
2.  **Backend API & Type Export**: Implement the Hono endpoints and business logic. Ensure all necessary types are exported for the frontend.
3.  **Backend Integration Tests**: Write tests to validate the new API, logic, and database interactions.
4.  **All backend tests must pass before moving on.** Run `bun run test` in backend
5.  **Frontend Implementation**: Build the SvelteKit components, importing types directly from the backend to ensure type safety.
6.  **Frontend E2E Tests**: Write end-to-end tests that simulate user interaction and verify the feature works from the browser to the database.
7.  **All frontend tests must pass before finalizing the feature.** Run `bun run test:e2e` in frontend
8.  **Test entire feature**: Run `scripts/test_pr` to validate the complete feature.

### 3. Document Key Decisions

- To ensure consistency, we document important architectural patterns and decisions.
- When you encounter a situation with multiple valid approaches, make a decision, and then **document it in [knowledge-base.md](../copilot/knowledge-base.md)**.
- **Example**: If you decide that API endpoints should always get the `UserID` from the JWT token rather than a query parameter, document this rule so we apply it everywhere.

---

## Working Effectively

### Bootstrap, Build, and Test the Repository

**ALWAYS run these steps first before making any changes:**

1. **Install Bun runtime**: `curl -fsSL https://bun.sh/install | bash && source ~/.bashrc`
2. **Start PostgreSQL**: `docker run --name postgres-test -e POSTGRES_DB=example_app -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres:15`
3. **Install dependencies**:
   - Root: `bun install` -- takes ~16s
   - Backend: `cd backend && bun install` -- takes ~16s
   - Frontend: `cd frontend && bun install` -- takes ~16s
4. **Setup environment**: `cp .env.example .env`
5. **Setup database**: `bun run db:setup --force` -- takes ~5s
6. **Setup test database**: `NODE_ENV=test bun run db:setup --force` -- takes ~5s

### Build and Test Commands

**CRITICAL TIMING EXPECTATIONS - NEVER CANCEL these commands:**

- **Backend type check**: `cd backend && bun run check` -- takes ~1s
- **Backend tests**: `cd backend && bun test` -- takes ~3s. NEVER CANCEL. Set timeout to 60s minimum.
- **Frontend type check**: `cd frontend && bun run check` -- takes ~5s. NEVER CANCEL. Set timeout to 60s minimum.
- **Frontend build**: `cd frontend && bun run build` -- takes ~3s. NEVER CANCEL. Set timeout to 120s minimum.
- **Frontend lint**: `cd frontend && bun run lint` -- takes ~5s
- **Formatting**: `bun run format` -- takes ~3s
- **Complete backend test suite**: `bun run test:backend` -- takes ~9s. NEVER CANCEL. Set timeout to 300s minimum.

### Run the Application

**ALWAYS run the bootstrapping steps first before starting servers.**

- **Full development environment**: `bun run dev` -- starts both backend and frontend, takes ~4s to fully start
- **Backend only**: `bun run backend:force` -- starts backend on port 3000, takes ~2s
- **Frontend only**: `bun run frontend` -- starts frontend on port 5173, takes ~2s
- **Database studio**: `bun run db:studio` -- opens Drizzle Studio

### Validation Scenarios

**ALWAYS manually validate any new code through these complete scenarios:**

1. **User Registration Flow**:

   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

   Expected: Returns user object with JWT token

2. **User Login Flow**:

   ```bash
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

   Expected: Returns user object with JWT token

3. **Authenticated API Access**:

   ```bash
   curl -H "Authorization: Bearer [JWT_TOKEN]" http://localhost:3000/api/hello
   ```

   Expected: Returns personalized hello message

4. **Frontend Accessibility**: Visit `http://localhost:5173/` and verify the UI loads

### E2E Testing Setup

**E2E tests require Playwright browser installation:**

- Install browsers: `bunx playwright install chromium` -- takes ~5-10 minutes. NEVER CANCEL.
- Run E2E tests: `bun run test:frontend` -- includes E2E, takes ~1-2 minutes. NEVER CANCEL. Set timeout to 300s minimum.

### Additional Validation Steps

**ALWAYS run these before committing changes:**

- Format code: `bun run format`
- Type check backend: `cd backend && bun run check`
- Type check frontend: `cd frontend && bun run check`
- Lint frontend: `cd frontend && bun run lint`
- Test backend: `cd backend && bun test`

---

## Key Projects and Architecture

### Backend (`backend/`)

- **Framework**: Hono with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Port**: 3000 (configurable via PORT env var)
- **Entry Point**: `src/index.ts`
- **Key Commands**: `bun run dev`, `bun run check`, `bun test`

### Frontend (`frontend/`)

- **Framework**: SvelteKit with Svelte 5
- **Styling**: Tailwind CSS v4 + DaisyUI
- **Icons**: Lucide Svelte
- **Port**: 5173 (Vite default)
- **Key Commands**: `bun run dev`, `bun run build`, `bun run check`, `bun run lint`

### Database

- **Migrations**: Located in `backend/src/db/migrations/`
- **Schema**: Defined in `backend/src/db/schema.ts`
- **Generate migration**: `cd backend && bun run db:generate`
- **Apply migrations**: `cd backend && bun run db:migrate` or `bun run db:setup`

### Testing

- **Backend Tests**: Located in `backend/src/tests/` using Vitest
- **E2E Tests**: Located in `tests/e2e/` using Playwright
- **Test script**: `bun run test` (runs all tests)

---

## Common Issues and Solutions

1. **"Cannot find package 'commander'"**: Run `bun add commander tsx` in project root
2. **"Database does not exist" in tests**: Run `NODE_ENV=test bun run db:setup --force`
3. **Backend lint fails**: Backend uses `bun run check` instead of `lint`
4. **E2E tests fail**: Install Playwright browsers with `bunx playwright install chromium`
5. **Port 3000 conflicts**: The start script reserves port 3000 for Copilot compatibility

## Environment Variables

Required in `.env` file:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: At least 32 characters for JWT signing
- `ALLOW_REGISTRATION`: "true" or "false" to control user registration
- `PORT`: Backend server port (default: 3000)

---

## External Resources & Tech Stack

For detailed guidance on specific technologies, refer to these documents.

- **Knowledge Base**: For common patterns, architectural decisions, and tips, see [knowledge-base.md](../copilot/knowledge-base.md).
- **Hono (Backend)**: For best practices, see [hono.instructions.md](./instructions/hono.instructions.md).
- **SvelteKit (Frontend)**: For best practices, see [sveltekit.instructions.md](./instructions/sveltekit.instructions.md).
- **Tailwind CSS**: For styling guidelines, see [tailwindcss.instructions.md](./instructions/tailwindcss.instructions.md).
