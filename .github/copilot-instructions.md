# GitHub Copilot General Instructions

## General Guidelines

- Prefer modern ES6+ JavaScript/TypeScript patterns and syntax.
- Use async/await instead of raw promises or callbacks.
- Follow a functional programming approach where appropriate.
- Use descriptive variable and function names.
- Add comments for complex logic, but keep code self-documenting when possible.
- Include type annotations in TypeScript code.
- Write unit tests for new functionality.

## Code Style

- Use 2-space indentation.
- Use semicolons at the end of statements.
- Use single quotes for strings.
- Prefer const over let. Avoid var.
- Use arrow functions for callbacks.
- Use template literals for string interpolation.

## Project Structure

- Keep components small and focused on a single responsibility.
- Place shared utilities in appropriate utility modules.
- Organize code by feature rather than by type when possible.
- Maintain clear separation between UI components and business logic.

## Best Practices

### Function Design

- Write small, single-purpose functions (max 20-30 lines).
- Use pure functions when possible (no side effects).
- Return early to avoid deep nesting.
- Use meaningful parameter names and avoid boolean parameters.
- Prefer function composition over complex conditional logic.

### Data and Identifiers

- Use UUIDs for database primary keys instead of auto-incrementing integers.
- Use semantic naming: `userId` instead of `id`, `createdAt` instead of `date`.
- Prefer enums or constants over magic strings/numbers.
- Use TypeScript interfaces for object shapes and API contracts.

### Error Handling

- Always handle errors explicitly - don't let them fail silently.
- Use Result/Either patterns or try-catch with specific error types.
- Provide meaningful error messages with context.
- Log errors with sufficient detail for debugging.
- Validate inputs at boundaries (API endpoints, function parameters).

### Security

- Never trust user input - validate and sanitize all data.
- Use parameterized queries to prevent SQL injection.
- Implement proper authentication and authorization checks.
- Avoid exposing sensitive data in client-side code.
- Use environment variables for secrets and configuration.

### Performance

- Avoid premature optimization, but be aware of common performance pitfalls.
- Use lazy loading for large datasets or expensive operations.
- Implement proper pagination for list endpoints.
- Cache expensive computations and database queries appropriately.
- Use database indexes for frequently queried fields.

### Code Organization

- Use dependency injection for better testability.
- Separate concerns: data access, business logic, and presentation.
- Implement consistent error handling patterns across the application.
- Use configuration objects instead of long parameter lists.
- Follow consistent naming conventions throughout the codebase.

### Date and DateTime Handling

- Store all datetime fields as `timestamptz` (timestamp with timezone) in PostgreSQL.
- Always work with UTC in the backend and database layer.
- Convert to user's local timezone only in the presentation layer (frontend).
- Use ISO 8601 format for API responses: `2024-03-15T14:30:00Z`.
- Use libraries like `date-fns-tz` or `Temporal` API for timezone conversions.
- Store user's timezone preference in user settings or detect from browser.
- For recurring events, store timezone information separately from the timestamp.
- Use `Date.now()` or `new Date().toISOString()` for current timestamps.
- Never rely on `new Date()` without timezone information for user-facing dates.
- For date-only fields (birthdays, deadlines), use `date` type in PostgreSQL.

## For specific technology stacks, see the following instructions:

- [SvelteKit](instructions/sveltekit.instructions.md)
- [TailwindCSS](instructions/tailwindcss.instructions.md)
- [daisyUI](instructions/daisyui.instructions.md)
- [Drizzle ORM](references/drizzle-llms.md)
