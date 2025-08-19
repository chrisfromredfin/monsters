# Testing Documentation

This project includes automated tests to ensure the reliability of core functionality, particularly the duplicate prevention logic for monster numbers.

## Test Framework Setup

- **Testing Framework**: Vitest
- **Component Testing**: @testing-library/svelte
- **Environment**: jsdom
- **Assertions**: jest-dom matchers

## Running Tests

```bash
# Run tests once
ddev yarn test:run

# Run tests in watch mode
ddev yarn test

# Run tests with UI
ddev yarn test:ui

# Run tests with coverage
ddev yarn test:coverage
```

## Test Coverage

### 1. Duplicate Prevention Logic (`AddPanel.logic.test.js`)

**Purpose**: Prevents regression of the duplicate monster number bug

**Core Scenarios Tested**:

- ✅ Allow adding monsters when no duplicates exist
- ✅ Prevent adding duplicate monster numbers for same monster type
- ✅ Handle different monster types independently
- ✅ Correctly identify existing numbers for specific monsters
- ✅ Handle edge cases gracefully
- ✅ Maintain data integrity during multiple operations

**Why This Matters**: The original bug allowed users to add multiple monsters with the same number (e.g., two "Ancient Artillery #3" units). These tests ensure this can never happen again.

### 2. Unit Actions (`unitActions.test.js`)

**Purpose**: Test shared utility functions for unit management

**Scenarios Tested**:

- ✅ Remove units by ID
- ✅ Adjust HP with bounds checking (0 to max)
- ✅ Toggle conditions on/off
- ✅ Handle edge cases (non-existent IDs, missing properties)

## Test Strategy

### Focus on Business Logic

Rather than testing UI rendering (which can be brittle), we focus on testing the core business logic that prevents data corruption and maintains game state integrity.

### Isolated Unit Tests

Each test file focuses on a specific area of functionality:

- **Logic tests**: Test the core algorithms and business rules
- **Utility tests**: Test shared helper functions
- **Integration tests**: Test that different parts work together correctly

### Regression Prevention

The duplicate prevention tests specifically target the bug that was discovered, ensuring it can never reoccur without failing tests.

## Test Data Structure

Tests use realistic monster data structures that match the actual game data:

```javascript
{
  id: 'unique-id',
  name: 'Ancient Artillery',
  number: 1,
  type: 'normal', // or 'elite' or 'boss'
  stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
  currentHp: 6,
  activeConditions: []
}
```

## Continuous Integration

Tests run automatically on:

- Local development (`yarn test`)
- Build process verification
- Future CI/CD pipeline integration

## Adding New Tests

When adding new features:

1. **Test the core logic first** - Create focused unit tests for business rules
2. **Test edge cases** - What happens with invalid input?
3. **Test integration points** - How does this interact with existing features?
4. **Follow the naming pattern** - `*.test.js` for general tests, `*.logic.test.js` for business logic

## Example Test Pattern

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  it('should handle the happy path', () => {
    // Arrange: Set up test data
    // Act: Perform the action
    // Assert: Verify the result
  });

  it('should handle edge cases', () => {
    // Test boundary conditions
  });

  it('should prevent invalid states', () => {
    // Test that bugs can't occur
  });
});
```

This testing approach ensures that critical bugs like the duplicate monster number issue are caught early and never make it to production.
