# Knowledge Base

This file contains key insights, patterns, and best practices for the project.

## Testing

### Testing Philosophy: NO MOCKS

**Date Added: June 29, 2025**

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
