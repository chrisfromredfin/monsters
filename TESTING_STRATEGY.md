# Testing Strategy

This project follows Svelte's recommended testing approach with a focus on **logic testing** and **end-to-end testing** rather than brittle component rendering tests.

## 🎯 **Testing Philosophy**

Based on [Svelte's official testing guidance](https://svelte.dev/docs/svelte/testing), our approach is:

1. **Unit Tests** - Test business logic, utilities, and stores
2. **Integration Tests** - Test how different parts work together (still in isolation)
3. **E2E Tests** - Test the full user experience with Playwright
4. **Avoid Component Tests** - As recommended by Svelte docs, component rendering tests are brittle and hard to maintain

## 📊 **Coverage Report**

Our current coverage focuses on **testable business logic**:

```bash
yarn run test:coverage
```

**Current Results:**

- ✅ **81.67%** overall coverage of testable code
- ✅ **100%** coverage of `constants.js` and `boss-helpers.js`
- ✅ **72%** coverage of stores (playArea.js has some untested error paths)
- ✅ **100%** coverage of `unitActions.js`

**What's Excluded from Coverage:**

- `.svelte` files (tested via E2E instead)
- Config files (`*.config.js`, `*.config.ts`)
- Test files themselves
- Generated/type files

## 🧪 **Test Categories**

### Unit Tests (`src/**/*.test.js`)

**What we test:**

- Business logic functions
- Store behavior
- Utility functions
- Constants and configurations

**Examples:**

- `AddPanel.test.js` - Business logic simulation (monster addition, boss health calculation, ally naming)
- `constants.test.js` - Configuration validation
- `unitActions.test.js` - Action utilities
- `playArea.test.js` - Store state management

### E2E Tests (`tests/*.spec.js`)

**What we test:**

- Full user workflows
- Component interactions
- UI behavior
- Cross-browser compatibility

**Examples:**

- `addPanel.spec.js` - Complete AddPanel user workflows
- `basic.spec.js` - Homepage and navigation

## 🚀 **Running Tests**

### Unit & Integration Tests

```bash
# Run tests in watch mode
yarn test

# Run tests once
yarn test:run

# Run with coverage report
yarn test:coverage

# Run tests with UI
yarn test:ui
```

### E2E Tests (Playwright with DDEV)

```bash
# Run E2E tests (headless)
yarn test:e2e

# Run E2E tests with UI (opens browser interface)
yarn test:e2e:ui

# Run E2E tests in headed mode (see browser)
yarn test:e2e:headed

# Generate test code by browsing
ddev playwright codegen

# View test reports
ddev playwright show-report
```

**Special DDEV Features:**

- ✅ **KasmVNC Access**: https://monsters.ddev.site:8444 (username: your local username, password: secret)
- ✅ **Test Reports**: https://monsters.ddev.site:9324
- ✅ **Cross-browser testing**: Chromium, Firefox, WebKit
- ✅ **No dependency issues**: All browsers run in containerized environment

## 📁 **Test File Organization**

```
src/
├── lib/
│   ├── components/
│   │   ├── AddPanel.test.js       # Logic tests for AddPanel
│   │   └── AddPanel.svelte        # Component (not unit tested)
│   ├── stores/
│   │   ├── playArea.js
│   │   └── groupedUnits.test.js   # Store behavior tests
│   ├── utils/
│   │   ├── unitActions.js
│   │   └── unitActions.test.js    # Utility function tests
│   └── constants.test.js          # Constants validation
tests/
├── addPanel.spec.js               # E2E tests for AddPanel
└── basic.spec.js                  # Basic app E2E tests
```

## ✅ **Benefits of This Approach**

1. **Stable Tests** - Logic tests don't break when UI changes
2. **Fast Execution** - No DOM rendering for unit tests
3. **Comprehensive Coverage** - E2E tests catch integration issues
4. **Svelte 5 Compatible** - No lifecycle rendering issues
5. **Meaningful Metrics** - Coverage focuses on business logic
6. **Easy Maintenance** - Tests focus on behavior, not implementation

## 🎯 **When to Add New Tests**

### Add Unit Tests When:

- Creating new utility functions
- Adding business logic to stores
- Writing helper functions
- Creating constants or configurations

### Add E2E Tests When:

- Adding new user workflows
- Creating new UI components with complex interactions
- Testing cross-component integration
- Verifying accessibility or browser compatibility

### Don't Add Tests For:

- Simple Svelte components without logic
- Styling or layout changes
- Configuration files
- Type definitions

## 🔧 **Configuration Files**

- `vitest.config.js` - Unit/integration test configuration
- `playwright.config.js` - E2E test configuration
- `src/setupTests.js` - Test environment setup

This strategy provides comprehensive coverage while avoiding the pitfalls of brittle component tests, exactly as recommended by the Svelte team.
