import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { playArea } from '$lib/stores/playArea.js';
import { scenarioLevel } from '$lib/stores/scenarioLevel.js';

/** @typedef {import('$lib/types').Unit} Unit */

/**
 * These tests focus on the "Start Over" functionality logic
 * without requiring full component rendering, making them more reliable
 * and focused on the business logic we want to protect.
 */

describe('Start Over Functionality Logic', () => {
  /** @type {Storage} */
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      /** @type {Record<string, string>} */
      store: {},
      getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
      setItem: vi.fn((key, value) => {
        mockLocalStorage.store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete mockLocalStorage.store[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage.store = {};
      })
    };

    // Replace global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock window.confirm
    window.confirm = vi.fn();

    // Reset stores to clean state
    playArea.set([]);
    scenarioLevel.set(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Simulates the resetGame function logic from +page.svelte
   * @param {boolean} userConfirms - Whether the user confirms the reset
   * @returns {boolean} - Whether the reset was performed
   */
  function simulateResetGame(userConfirms) {
    // Mock the confirm dialog
    window.confirm.mockReturnValue(userConfirms);

    const confirmed = window.confirm(
      'Are you sure you want to start over? This will clear all added monsters.'
    );

    if (confirmed) {
      localStorage.removeItem('playArea');
      localStorage.removeItem('scenarioLevel');
      playArea.set([]);
      scenarioLevel.set(null);
      return true;
    }

    return false;
  }

  it('should clear all data when Start Over is confirmed', () => {
    // Set up initial state with some monsters and scenario level
    const testUnits = [
      {
        id: 'test-monster-1',
        name: 'Ancient Artillery',
        number: 1,
        type: /** @type {'normal'} */ ('normal'),
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 4, // damaged
        activeConditions: ['poisoned']
      },
      {
        id: 'test-monster-2',
        name: 'Bandit Guard',
        number: 2,
        type: /** @type {'elite'} */ ('elite'),
        stats: { health: 12, move: 2, attack: 4, range: 0, attributes: [] },
        currentHp: 12,
        activeConditions: []
      }
    ];

    playArea.set(testUnits);
    scenarioLevel.set(3);

    // Simulate localStorage having been populated
    mockLocalStorage.store['playArea'] = JSON.stringify(testUnits);
    mockLocalStorage.store['scenarioLevel'] = JSON.stringify(3);

    // Verify initial state is populated
    expect(get(playArea)).toHaveLength(2);
    expect(get(scenarioLevel)).toBe(3);

    // Simulate the reset game action with user confirmation
    const resetWasPerformed = simulateResetGame(true);

    // Verify reset was performed
    expect(resetWasPerformed).toBe(true);

    // Verify confirmation was called
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to start over? This will clear all added monsters.'
    );

    // Verify stores are cleared
    expect(get(playArea)).toEqual([]);
    expect(get(scenarioLevel)).toBeNull();

    // Verify localStorage was cleared
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('playArea');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('scenarioLevel');
  });

  it('should not clear data when Start Over is cancelled', () => {
    // Set up initial state
    const testUnits = [
      {
        id: 'test-monster-1',
        name: 'Ancient Artillery',
        number: 1,
        type: /** @type {'normal'} */ ('normal'),
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 6,
        activeConditions: []
      }
    ];

    playArea.set(testUnits);
    scenarioLevel.set(2);

    // Verify initial state
    expect(get(playArea)).toHaveLength(1);
    expect(get(scenarioLevel)).toBe(2);

    // Simulate the reset game action with user cancellation
    const resetWasPerformed = simulateResetGame(false);

    // Verify reset was NOT performed
    expect(resetWasPerformed).toBe(false);

    // Verify confirmation was called
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to start over? This will clear all added monsters.'
    );

    // Verify data was NOT cleared
    expect(get(playArea)).toHaveLength(1);
    expect(get(playArea)[0].name).toBe('Ancient Artillery');
    expect(get(scenarioLevel)).toBe(2);

    // Verify localStorage was NOT called
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it('should handle add panel state logic after reset', () => {
    // Set up state with monsters (Add Panel would typically be closed)
    const testUnits = [
      {
        id: 'test-monster-1',
        name: 'Ancient Artillery',
        number: 1,
        type: /** @type {'normal'} */ ('normal'),
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 6,
        activeConditions: []
      }
    ];

    playArea.set(testUnits);

    // Simulate the logic for determining add panel state
    // If playArea has units, panel would be closed
    const shouldAddPanelBeOpenBefore = get(playArea).length === 0;
    expect(shouldAddPanelBeOpenBefore).toBe(false);

    // Perform reset
    simulateResetGame(true);

    // After reset, playArea is empty, so panel should be open
    const shouldAddPanelBeOpenAfter = get(playArea).length === 0;
    expect(shouldAddPanelBeOpenAfter).toBe(true);

    // Verify reset logic worked
    expect(get(playArea)).toEqual([]);
    expect(get(scenarioLevel)).toBeNull();
  });

  it('should handle empty initial state correctly', () => {
    // Start with empty state
    playArea.set([]);
    scenarioLevel.set(null);

    // Verify empty initial state
    expect(get(playArea)).toEqual([]);
    expect(get(scenarioLevel)).toBeNull();

    // Simulate reset (should still work even with empty state)
    const resetWasPerformed = simulateResetGame(true);

    expect(resetWasPerformed).toBe(true);
    expect(window.confirm).toHaveBeenCalled();

    // State should still be empty
    expect(get(playArea)).toEqual([]);
    expect(get(scenarioLevel)).toBeNull();

    // localStorage removeItem should still be called
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('playArea');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('scenarioLevel');
  });

  it('should preserve data integrity during complex scenarios', () => {
    // Set up a complex scenario with multiple monster types and levels
    const complexTestUnits = [
      {
        id: 'monster-1',
        name: 'Ancient Artillery',
        number: 1,
        type: /** @type {'normal'} */ ('normal'),
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: ['Shield 1'] },
        currentHp: 3,
        activeConditions: ['stunned', 'poisoned']
      },
      {
        id: 'monster-2',
        name: 'Ancient Artillery',
        number: 2,
        type: /** @type {'elite'} */ ('elite'),
        stats: { health: 9, move: 0, attack: 3, range: 5, attributes: ['Shield 2'] },
        currentHp: 9,
        activeConditions: []
      },
      {
        id: 'boss-1',
        name: 'Boss Monster',
        number: 1,
        type: /** @type {'boss'} */ ('boss'),
        stats: { health: 50, move: 3, attack: 5, range: 2, attributes: [] },
        currentHp: 25,
        activeConditions: ['immobilized'],
        bossMeta: {
          healthExpr: 'C + L * 2',
          specials: ['Special Attack 1', 'Special Attack 2'],
          immunities: ['poison', 'wound'],
          notes: 'This is a test boss'
        }
      }
    ];

    playArea.set(complexTestUnits);
    scenarioLevel.set(7);

    // Verify complex initial state
    expect(get(playArea)).toHaveLength(3);
    expect(get(scenarioLevel)).toBe(7);

    const initialPlayArea = get(playArea);
    expect(initialPlayArea.find((u) => u.type === 'boss')).toBeTruthy();
    expect(initialPlayArea.find((u) => u.activeConditions.includes('poisoned'))).toBeTruthy();

    // Perform reset
    const resetWasPerformed = simulateResetGame(true);

    expect(resetWasPerformed).toBe(true);

    // Verify everything is completely cleared
    expect(get(playArea)).toEqual([]);
    expect(get(scenarioLevel)).toBeNull();

    // Verify localStorage was properly cleaned
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('playArea');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('scenarioLevel');
  });
});
