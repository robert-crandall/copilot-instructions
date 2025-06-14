---
description: SvelteKit coding standards and best practices
applyTo: "**/*.{js,ts,svelte}"
---

# SvelteKit Development Guidelines

## Project Structure and Routing

- Follow SvelteKit's filesystem-based routing pattern in `src/routes`:
  - `src/routes` is the root route
  - `src/routes/about` creates an `/about` route
  - `src/routes/blog/[slug]` creates a parameterized route

- Use the correct route files with the `+` prefix:
  - `+page.svelte` - UI component for the page
  - `+page.server.js|ts` - Server-only code for data loading and form actions
  - `+page.js|ts` - Shared code that runs on both server and client
  - `+layout.svelte` - UI wrapper that applies to the current directory and all subdirectories
  - `+layout.server.js|ts` - Server-only layout code
  - `+error.svelte` - Error handling component
  - `+server.js|ts` - API endpoints and server routes

- Organize your code structure:
  - Place reusable components in `src/lib/components/`
  - Place server-only code in `src/lib/server/`
  - Place utilities in `src/lib/utils/`
  - Place stores in `src/lib/stores/`
  - Use `$lib` alias for importing from the lib directory

## Components

- Use `.svelte` extension for Svelte components
- Structure components with `<script>`, markup, and `<style>` sections
- Export props with `export let propName` syntax
- Add TypeScript types to props for better type safety:
  ```svelte
  <script lang="ts">
    export let name: string;
    export let count: number = 0;
  </script>
  ```
- Use `$:` for reactive declarations and statements
- Use the new `$derived` and `$effect` runes for clearer reactivity
- Use component events with `createEventDispatcher` for parent communication
- Create reusable actions with the `use:` directive

## Stores and State Management

- Import stores from `svelte/store`
- Use appropriate store types:
  - `writable` for mutable state
  - `readable` for read-only state
  - `derived` for computed values
- Access store values with the `$` prefix in components
- Use SvelteKit's built-in stores:
  - `$page` - Current page data and information
  - `$navigating` - Navigation status
  - `$app/stores` - Application-level stores

## Data Loading

- Use `load` functions in `+page.ts` or `+page.server.ts`:
  ```typescript
  export const load = async ({ params, fetch, depends }) => {
    // Load data here
    return {
      myData: data
    };
  };
  ```
- Use server-side `load` for sensitive operations or database access
- Use client-side `load` for browser-only APIs
- Use `depends()` to mark external dependencies
- Handle errors gracefully with try/catch
- Use `error` and `redirect` helpers for navigation control

## Form Handling

- Use progressive enhancement with native HTML forms
- Define form actions in `+page.server.js|ts`:
  ```typescript
  export const actions = {
    default: async ({ request }) => {
      const data = await request.formData();
      // Process form data
      return { success: true };
    }
  };
  ```
- Use `use:enhance` for JavaScript-enhanced forms:
  ```svelte
  <form method="POST" use:enhance>
  ```
- Validate form data on both client and server
- Use named form actions for multiple actions on one page
- Return validation errors as part of the action response

## Routing and Navigation

- Use `<a>` elements for standard navigation
- Add client-side features with `data-sveltekit-*` attributes:
  - `data-sveltekit-preload-data` for preloading
  - `data-sveltekit-reload` for full-page reload
- Use the `goto()` function from `$app/navigation` for programmatic navigation
- Use `beforeNavigate` and `afterNavigate` hooks for navigation lifecycle events
- Set up named layout groups with `(groupname)` directory syntax for shared layouts

## Security and Performance

- Keep sensitive code in `+server.js|ts` or `+page.server.js|ts` files
- Use `handle` hook in `hooks.server.js` for authentication
- Set appropriate caching strategies with `cache` functions
- Generate proper HTTP headers in server routes
- Use SvelteKit's adapter system for optimal deployment to your platform

Reference: [SvelteKit Instructions](../references/sveltekit-llms.md)
