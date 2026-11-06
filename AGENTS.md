# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Gloomhaven Monster Tracker app built with SvelteKit 5, configured as a static site generator (SSG) using `@sveltejs/adapter-static`. It tracks monster health, conditions, and provides tools for managing game state in tabletop gaming sessions.

## Essential Development Commands

All commands must be run through DDEV as this project uses a DDEV container environment.

### Development Workflow

```bash
# Re-start development server (runs on https://monsters.ddev.site)
ddev restart

# Build for production (static site generation)
ddev yarn run build

# Preview production build
ddev yarn preview

# Format code with Prettier
ddev yarn run format

# Lint code (Prettier + ESLint)
ddev yarn run lint

# Type checking (note: NOT `ddev yarn check` which is something else)
ddev yarn run check
```

### Testing Commands

```bash
# Run unit tests once
ddev yarn test:run

# Run unit tests in watch mode
ddev yarn test

# Run tests with UI interface
ddev yarn test:ui

# Run tests with coverage report
ddev yarn test:coverage

# End-to-end tests with Playwright
ddev yarn test:e2e

# E2E tests with UI (browser interface)
ddev yarn test:e2e:ui

# E2E tests in headed mode (visible browser)
ddev yarn test:e2e:headed
```

### DDEV Specific Features

```bash
# Launch the site in browser
ddev launch

# Access KasmVNC for GUI testing: https://monsters.ddev.site:8444
# View Playwright test reports: https://monsters.ddev.site:9324

# Generate Playwright test code interactively
ddev playwright codegen

# View Playwright test reports
ddev playwright show-report
```

## Architecture Overview

### Core Stores and State Management

The application uses Svelte stores for state management with localStorage persistence:

- **`playArea`** (`src/lib/stores/playArea.js`) - Main store containing all active units (monsters, bosses, allies)
- **`scenarioLevel`** (`src/lib/stores/scenarioLevel.js`) - Current scenario level (1-7)
- **`groupedUnits`** (derived from `playArea`) - Units grouped by name/type for display

### Unit Domain Model

All entities (monsters, bosses, allies) implement the `Unit` type defined in `src/lib/types.js`:

```typescript
type Unit = {
  id: string;
  name: string;
  number: number;
  type: 'normal' | 'elite' | 'boss' | 'ally';
  currentHp: number;
  stats: StatLine;
  activeConditions: string[];
  bossMeta?: BossMeta; // Only for boss units
};
```

### Critical Business Logic

**Duplicate Prevention Algorithm** (`src/lib/components/AddPanel.svelte`):

- Prevents adding monsters with duplicate numbers for the same monster type
- Uses `existingNumbers` Set to track used numbers per monster name
- Core logic tested extensively in `AddPanel.logic.test.js`

**Boss Health Calculation** (`src/lib/boss-helpers.js`):

- Parses expressions like "10xC" where C = party count
- `computeBossHealth(expr, partyCount)` function handles the calculation

**Unit Actions** (`src/lib/utils/unitActions.js`):

- `removeUnit()` - Remove units from play area
- `adjustHp()` - Modify HP with bounds checking (0 to max)
- `toggleCondition()` - Toggle status conditions on/off

### Static Site Generation Flow

1. **Data Loading**: `src/routes/+page.server.js` loads monster stats from JSON at build time
2. **Prerendering**: `export const prerender = true` enables SSG
3. **Asset Bundling**: Monster images and icons loaded via `src/lib/assets/registry.ts`
4. **Build Output**: Static files generated to `build/` directory

### Component Architecture

- **AddPanel**: Complex form for adding monsters/bosses/allies with duplicate prevention
- **Card Components**: `MonsterCard`, `BossCard`, `AllyCard` for displaying units
- **Shared UI**: `HealthBar`, `ConditionsDisplay`, `HpControls` for common functionality

## Development Notes

### Testing Strategy

This project follows Svelte's recommended testing approach:

1. **Unit Tests**: Focus on business logic, stores, and utilities (not component rendering)
2. **End-to-End Tests**: Test full user workflows with Playwright
3. **Avoid Component Tests**: Svelte components are tested through E2E tests instead

**Key Testing Files**:

- `AddPanel.logic.test.js` - Critical duplicate prevention logic
- `unitActions.test.js` - Shared utility functions
- `playArea.test.js` - Store behavior and persistence
- `tests/e2e/` - Full user workflow tests

### DDEV Container Usage

- All development must use DDEV commands (`ddev yarn ...`)
- The development server runs inside the container but is accessible at `https://monsters.ddev.site`
- Playwright tests run in a containerized environment with cross-browser support
- Use `ddev exec` if you need to run commands inside the container

### Static Site Generation Considerations

- The app generates a fully static site (no server-side runtime)
- All data is loaded at build time from `src/lib/server/data/monster-stats.json`
- localStorage is used for client-side state persistence
- Images and assets are bundled and optimized during build

### Code Organization

```
src/
├── lib/
│   ├── components/         # Svelte components
│   ├── stores/            # Svelte stores
│   ├── utils/             # Utility functions
│   ├── assets/            # Images, icons, registry
│   ├── server/data/       # JSON data files
│   ├── constants.js       # Shared constants
│   ├── types.js          # TypeScript type definitions
│   └── boss-helpers.js   # Boss-specific utilities
├── routes/               # SvelteKit pages
└── setupTests.js        # Test environment setup
```

### Important Gotchas

- **Store State in Tests**: Always reset stores in `beforeEach()` to prevent test interference
- **Crypto API Mocking**: Mock `crypto.randomUUID()` in test environments for consistent IDs
- **DDEV Prefix**: Never run `yarn` or `npm` commands directly - always use `ddev yarn`
- **Browser Access**: Development server runs on container port 3000, accessible via DDEV router (just go to https://monsters.ddev.site)
- **Asset Loading**: Monster images use specific naming convention: `Horz-{Monster Name}.png`

### Performance Considerations

- The app handles large monster image assets (1MB+ PNG files)
- Store operations trigger localStorage writes on every change
- Derived stores (`groupedUnits`) recalculate on every `playArea` update
- Static generation pre-optimizes all assets at build time

This architecture provides a reliable, testable foundation for the Gloomhaven Monster Tracker while maintaining excellent performance through static site generation.
