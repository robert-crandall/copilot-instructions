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

## For specific technology stacks, see the following instructions:

- [SvelteKit](/sveltekit/sveltekit-llms.md)
- [TailwindCSS](/sveltekit/tailwindcss-llms.md)
- [TailwindCSS v4](/sveltekit/tailwindcss4-llms.md)
- [Drizzle ORM](/sveltekit/drizzle-llms.md)
