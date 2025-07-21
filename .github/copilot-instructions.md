# copilot-instructions.md

## Project Overview
This repository is a monorepo template for a microblogging app with full end-to-end type safety, featuring:
- Hono backend (TypeScript, JWT authentication, PostgreSQL via Drizzle ORM)
- tRPC for API contracts
- React + Vite SPA frontend
- Shared TypeScript types
- TailwindCSS and daisyUI for styling

It demonstrates best practices for agentic coding, authentication, and testing workflows.

## Folder Structure
- `/backend`: Hono server, tRPC routes, authentication, API endpoints
- `/frontend`: React SPA, tRPC client, UI components, authentication flows
- `/shared`: TypeScript types/interfaces shared between backend and frontend
- `/copilot/real-requirements.md`: Product requirements document
- `/copilot/tech-stack.md`: Tech stack and scaffolding instructions

## Coding Standards & Practices
- All code is TypeScript
- Use ES modules (import/export)
- Destructure imports when possible
- Mobile-first design, minimum touch target 44px
- Use TailwindCSS and daisyUI for UI
- Clean, minimalist interface with clear validation feedback
- JWT tokens stored in localStorage ("remember me") or sessionStorage
- Use React Query for API calls
- All API contracts are inferred from backend to frontend

## Agentic Coding Best Practices (from Anthropic Claude Code)
- Document common commands, core files, code style, and testing instructions in this file
- Be specific in instructions to Copilot and agents
- Reference files and URLs explicitly (e.g., #file:real-requirements.md)
- Use checklists and scratchpads for complex workflows
- Prefer workflows: explore, plan, code, commit; test-driven development; code, screenshot, iterate
- Use subagents for verification and deeper investigation
- Course correct early and often; ask for plans before coding
- Use `/clear` to reset context between tasks
- Mention files and folders explicitly for context
- Use headless mode for CI, linting, and automation

## Key Tools, Libraries, and Frameworks
- Backend: Hono, hono/jwt, Drizzle ORM, PostgreSQL
- Frontend: React, Vite, tRPC, React Query, TailwindCSS, daisyUI
- Testing: Real HTTP requests, browser interactions, both backend and frontend
- Environment: `ALLOW_REGISTRATION` and JWT secret via env vars

## Setup & Usage
- See #file:tech-stack.md for scaffolding and setup instructions
- See #file:real-requirements.md for product requirements and user stories

## Example Commands
- `npm run build` — Build the project
- `npm run typecheck` — Run the typechecker
- `npm run dev` — Start development server

## Additional Guidance
- For authentication, registration is only allowed when `ALLOW_REGISTRATION` is true
- All form fields must be validated client and server side
- JWT tokens valid for 30 days; "remember me" extends expiration
- Protect all routes requiring authentication
- Use clear error messages and visual feedback
- Out of scope: multi-factor auth, social login, email password reset, user roles
