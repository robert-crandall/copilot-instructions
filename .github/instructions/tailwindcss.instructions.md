---
description: Tailwind CSS v4 coding standards and best practices
applyTo: "**/*.{css,html,js,jsx,ts,tsx,svelte}"
---

# Tailwind CSS v4 Development Guidelines

## Theming and Configuration

- Use CSS theme variables with the `@theme` directive in the main CSS file.
- Define custom colors using OKLCH or other preferred color formats.
- Define spacing scales, typography, and breakpoints as CSS variables.

```css
/* app.css */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --color-brand-500: oklch(0.637 0.237 25.331);
  --breakpoint-lg: 64rem;
  --spacing: 0.25rem; /* Base for numeric spacing utilities */
}
```

## Utility Classes

- Use Tailwind utility classes as the primary styling approach.
- Avoid custom CSS except for complex animations or unique components.
- Use arbitrary values with square brackets when needed: `[--my-custom-value]`.
- Group related utilities with the `@apply` directive for complex components.

## Component Design

- Build UI from small, composable components using Tailwind utilities.
- Use consistent spacing and color schemes across components.
- Extract repeated patterns into component classes.
- Use responsive utilities with breakpoint prefixes: `md:`, `lg:`, etc.

## Best Practices

- Use JIT (Just-In-Time) compilation mode for development.
- Purge unused CSS in production builds.
- Use the official Tailwind plugins for advanced features.
- Maintain a consistent color palette and spacing scale.
