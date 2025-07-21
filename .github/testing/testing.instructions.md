````instructions
---
description: Integration-first testing approach with real API calls following agentic coding best practices
applyTo: "**/*.{test,spec}.{js,ts,jsx,tsx,svelte}"
---

# Testing Guidelines - Integration-First with Agentic Coding Best Practices

## Agentic Testing Workflows

### 1. Explore, Plan, Code, Commit
This versatile workflow suits many testing problems:

1. **Explore**: Read relevant test files, source code, or documentation. Don't write any code yet. For complex problems, break down investigation into smaller questions.
2. **Plan**: Create a plan for testing approach. Think through the testing strategy thoroughly, considering edge cases and integration points.
3. **Code**: Implement the test solution. Verify the reasonableness of tests as you implement them.
4. **Commit**: Commit the tests and update any documentation.

### 2. Write Tests, Commit; Code, Iterate, Commit (TDD)
Test-driven development becomes more powerful with agentic coding:

1. **Write Tests**: Write tests based on expected input/output pairs. Focus on TDD principles to avoid mock implementations.
2. **Verify Failure**: Run tests and confirm they fail. Don't write implementation code yet.
3. **Commit Tests**: Commit the tests when satisfied.
4. **Implement**: Write code that passes tests, without modifying the tests. Keep iterating until all tests pass.
5. **Verify**: Verify that implementation isn't overfitting to tests with independent review.
6. **Commit Code**: Commit once satisfied.

### 3. Test, Screenshot, Iterate
For UI testing with visual targets:

1. Set up screenshot capability (Puppeteer, manual screenshots)
2. Provide visual mocks or expected UI states
3. Implement tests, take screenshots, and iterate until results match expectations
4. Commit when satisfied

## Optimization Best Practices

### Be Specific in Test Instructions
Success improves with specific instructions:

```
❌ "add tests for foo.py"
✅ "write integration tests for foo.py covering the edge case where user is logged out. use real API calls, avoid mocks"

❌ "test the login flow"  
✅ "create E2E tests for login flow: test valid credentials, invalid email, wrong password, and session persistence. use real authentication endpoints"
```

### Course Correct Early and Often
- Create a test plan before coding
- Interrupt and redirect when needed during any phase
- Go back in history and edit previous approaches when taking different directions
- Undo changes when taking different approaches

### Keep Context Focused
During long testing sessions, reset context frequently between tasks to maintain focus.

### Use Checklists and Scratchpads for Complex Test Workflows
For large test migrations or refactors:

1. Create a Markdown checklist of all test files and issues
2. Address each item one by one, checking off completed items
3. Use GitHub issues or Markdown files as working scratchpads

Example workflow for fixing lint issues in tests:
1. Run lint command and write errors to Markdown checklist
2. Fix each issue individually, verify, and check off before moving to next

### Mention Files and Reference Examples
- Explicitly reference test files and source files
- Mention files you want to examine or modify
- Reference specific test patterns or existing test examples

## Multi-Agent Testing Workflows

### Code Review Pattern
1. Have one agent write tests
2. Reset context or start fresh session
3. Have second agent review the tests
4. Start third agent to read both tests and feedback
5. Have final agent edit tests based on review

### Parallel Testing
1. Create multiple git worktrees: `git worktree add ../project-tests-a feature-tests`
2. Work in each worktree for different test suites
3. Run independent test tasks simultaneously

## Testing Philosophy

### Integration-First Approach
- **Primary**: Real HTTP requests and database operations
- **Backend**: Test complete request/response cycle with real API calls  
- **Frontend**: Test components with actual backend integration
- **Minimal Unit**: Only for pure functions and critical business logic
- **NO BUSINESS LOGIC IN TESTS**: Import and use actual business logic

### Testing Strategy by Layer

#### Backend Integration Tests (Primary)
```typescript
// ✅ Integration test with real HTTP requests
describe('Users API', () => {
  it('should create and retrieve user with real database', async () => {
    const createRes = await app.request('/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'John', email: 'john@test.com' }),
      headers: { 'Content-Type': 'application/json' }
    })
    
    expect(createRes.status).toBe(201)
    const created = await createRes.json()
    
    const getRes = await app.request(`/users/${created.id}`)
    expect(getRes.status).toBe(200)
    
    const retrieved = await getRes.json()
    expect(retrieved).toEqual(created)
  })
})
```

#### Frontend Component Integration
```typescript
// ✅ Component test with real API integration
describe('UserProfile Component', () => {
  it('should load user data from real API', async () => {
    render(UserProfile, { props: { userId: 'test-user-123' } })
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

#### Minimal Unit Testing
```typescript
// ✅ Unit test for pure function only
describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    expect(calculateTotal(100, 0.1)).toBe(110)
  })
})
```

## Automated Testing for CI/CD

Use automated testing workflows for continuous integration:

```bash
# Automated test fixing
npm run test -- --reporter=verbose > test-results.txt
# Review failures and fix systematically

# Test generation for API endpoints
# Generate integration tests for all endpoints in src/api/
# Use real HTTP requests, no mocks

# Test migration from Jest to Vitest
# Update imports and configuration
# Verify all tests pass after migration
```

## Common Test Commands

Document these in your project's instructions:

- `npm run test` — Run all tests
- `npm run test:integration` — Backend and frontend integration tests  
- `npm run test:e2e` — End-to-end Playwright tests
- `npm run test:ci` — All tests for CI
- `npm run test:watch` — Watch mode for development

## Key Principles

- **Real over Mock**: Use real HTTP requests and database operations
- **Integration over Unit**: Focus on testing component interactions  
- **Specify Clearly**: Give specific, detailed testing instructions
- **Iterate Frequently**: Course correct early, use visual feedback when possible
- **Plan First**: Always explore and plan before writing tests
- **Use Context Tools**: Leverage checklists and multi-agent workflows

## Testing Tools and Setup

### Recommended Stack
- **Backend Integration**: Vitest + Hono testing utilities (`app.request()`, `testClient()`)
- **Frontend Integration**: Vitest + @testing-library/svelte + jsdom
- **E2E Testing**: Playwright with multiple browsers
- **Database**: Real test database with proper setup/teardown

### Key Testing Principles
- **Real over Mock**: Use real HTTP requests and database operations
- **Integration over Unit**: Focus on testing component interactions
- **Type Safety**: Leverage Hono's type-safe testing utilities
- **NO BUSINESS LOGIC IN TESTS**: Import and use actual business logic

## When to Add Different Types of Tests

### Integration Tests (Primary - Always Add)
- **Backend API endpoints** - Test every route with real HTTP requests
- **Frontend components** that interact with APIs
- **Authentication and authorization** flows
- **Database operations** and data persistence
- **Middleware and validation** logic

### Unit Tests (Minimal - Only When Needed)
- **Pure functions** with complex algorithms or calculations
- **Utility functions** used across multiple components
- **Data transformation** functions with complex logic
- **Validation functions** with multiple rules

### E2E Tests (Complete Workflows)
- **Critical user journeys** that span multiple pages/components
- **Cross-browser compatibility** for supported browsers
- **Mobile responsiveness** and touch interactions
- **Performance-critical** user flows

### What NOT to Test
- **Simple getters/setters** - No value added
- **Mocked API calls** - Test real integration instead
- **Third-party library internals** - Trust the library's tests
- **Trivial functions** without business logic

## Test Organization and Naming

### File Organization
- Place test files next to source files: `utils.ts` → `utils.test.ts`
- Use `.test.` suffix for unit tests
- Use `.e2e.` suffix for end-to-end tests
- Keep test files small and focused

### Clear Test Names
```typescript
// ✅ Clear and minimal
describe('UserValidator', () => {
  it('rejects invalid email formats');
  it('accepts valid email formats');
});

// ❌ Too verbose
describe('UserValidator email validation functionality', () => {
  it('should return false when email does not contain @ symbol');
});
```

## Coverage Philosophy

### Integration Coverage (Primary Goal)
- **Backend API Endpoints**: 100% of routes tested with real HTTP requests
- **Frontend Components**: All components that make API calls tested
- **Critical User Flows**: 100% coverage via E2E tests
- **Database Operations**: All CRUD operations tested with real database

### Quality over Quantity
- **Real integration tests** are worth more than extensive unit tests
- **One integration test** can replace dozens of mocked unit tests
- **Focus on critical paths** that users actually experience
- **Test behavior, not implementation details**

This approach ensures your application works correctly in production while maintaining efficient and meaningful test coverage.
