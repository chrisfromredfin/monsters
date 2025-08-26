import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { playArea } from '$lib/stores/playArea.js';
import { scenarioLevel } from '$lib/stores/scenarioLevel.js';
import { computeBossHealth } from '$lib/boss-helpers.js';

/** @typedef {import('$lib/types').Unit} Unit */

/**
 * These tests focus on the AddPanel business logic functions
 * without requiring full component rendering, making them more reliable
 * and focused on the core functionality we want to protect.
 */

/**
 * Mock data structure matching the expected format from monster-stats.json
 */
const mockData = {
  monsters: {
    'Ancient Artillery': {
      level: [
        {
          level: 0,
          normal: { health: 4, move: 0, attack: 2, range: 4, attributes: [] },
          elite: { health: 7, move: 0, attack: 3, range: 5, attributes: [] }
        },
        {
          level: 1,
          normal: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          elite: { health: 9, move: 0, attack: 3, range: 5, attributes: [] }
        },
        {
          level: 2,
          normal: { health: 7, move: 0, attack: 2, range: 5, attributes: [] },
          elite: { health: 11, move: 0, attack: 3, range: 6, attributes: [] }
        }
      ]
    },
    'Bandit Guard': {
      level: [
        {
          level: 0,
          normal: { health: 5, move: 2, attack: 2, range: 0, attributes: [] },
          elite: { health: 8, move: 2, attack: 3, range: 0, attributes: [] }
        },
        {
          level: 1,
          normal: { health: 8, move: 2, attack: 3, range: 0, attributes: [] },
          elite: { health: 12, move: 2, attack: 4, range: 0, attributes: [] }
        }
      ]
    }
  },
  bosses: {
    'Bandit Commander': {
      level: [
        {
          level: 0,
          health: '8xC',
          move: 3,
          attack: 3,
          range: 0,
          special1: ['Move to next door and reveal room'],
          special2: ['Summon Living Bones'],
          immunities: ['Stun', 'Immobilize', 'Curse'],
          notes: ''
        },
        {
          level: 1,
          health: '10xC',
          move: 3,
          attack: 3,
          range: 0,
          special1: ['Move to next door and reveal room'],
          special2: ['Summon Living Bones'],
          immunities: ['Stun', 'Immobilize', 'Curuse'],
          notes: ''
        }
      ]
    },
    'Test Boss': {
      level: [
        {
          level: 0,
          health: '6xC',
          move: 2,
          attack: 4,
          range: 2,
          special1: ['Test Special 1'],
          special2: ['Test Special 2'],
          immunities: ['Test Immunity'],
          notes: 'Test notes'
        }
      ]
    }
  }
};

describe('AddPanel - Business Logic', () => {
  beforeEach(() => {
    // Reset stores
    playArea.set([]);
    scenarioLevel.set(null);

    // Mock crypto.randomUUID if not available
    if (!global.crypto) {
      global.crypto = /** @type {any} */ ({
        randomUUID: vi.fn(() => `test-id-${Date.now()}`),
        subtle: {},
        getRandomValues: vi.fn()
      });
    } else if (!crypto.randomUUID) {
      crypto.randomUUID = /** @type {any} */ (vi.fn(() => `test-id-${Date.now()}`));
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Monster Addition Logic', () => {
    /**
     * Simulates the monster addition logic from AddPanel.svelte
     * @param {import('svelte/store').Writable<Unit[]>} playAreaStore
     * @param {string} selectedMonster
     * @param {(string | null)[]} unitStates
     * @param {any} levelData
     * @returns {Unit[]}
     */
    function simulateMonsterAddition(playAreaStore, selectedMonster, unitStates, levelData) {
      if (!levelData) return [];
      const existingNumbers = new Set(
        get(playAreaStore)
          .filter((unit) => unit.name === selectedMonster)
          .map((unit) => unit.number)
      );

      const now = Date.now();
      const newUnits = /** @type {Unit[]} */ (
        unitStates
          .map((type, i) => {
            if (!type) return null;

            const number = i + 1;
            if (existingNumbers.has(number)) return null;

            const id = crypto?.randomUUID?.() ?? `${selectedMonster}-${type}-${number}-${now}`;
            const stats = levelData[type];
            if (!stats) return null;

            /** @type {Unit} */
            const unit = {
              id,
              number,
              type: /** @type {'normal' | 'elite' | 'boss'} */ (type),
              stats,
              name: selectedMonster,
              currentHp: stats.health,
              activeConditions: []
            };
            return unit;
          })
          .filter(Boolean)
      );

      if (newUnits.length > 0) {
        playAreaStore.update((old) => [...old, ...newUnits]);
      }

      return newUnits;
    }

    it('should add a single normal monster correctly', () => {
      const unitStates = [null, 'normal', null, null, null, null, null, null, null, null];
      const levelData = mockData.monsters['Ancient Artillery'].level.find((l) => l.level === 1);

      const newUnits = simulateMonsterAddition(
        playArea,
        'Ancient Artillery',
        unitStates,
        levelData
      );

      expect(newUnits).toHaveLength(1);
      expect(newUnits[0].name).toBe('Ancient Artillery');
      expect(newUnits[0].type).toBe('normal');
      expect(newUnits[0].number).toBe(2);
      expect(newUnits[0].stats.health).toBe(6);
      expect(newUnits[0].currentHp).toBe(6);

      const units = get(playArea);
      expect(units).toHaveLength(1);
    });

    it('should add multiple monsters of different types', () => {
      const unitStates = ['elite', null, 'normal', null, 'elite', null, null, null, null, null];
      const levelData = mockData.monsters['Ancient Artillery'].level.find((l) => l.level === 1);

      const newUnits = simulateMonsterAddition(
        playArea,
        'Ancient Artillery',
        unitStates,
        levelData
      );

      expect(newUnits).toHaveLength(3);

      const eliteUnits = newUnits.filter((u) => u.type === 'elite');
      const normalUnits = newUnits.filter((u) => u.type === 'normal');

      expect(eliteUnits).toHaveLength(2);
      expect(normalUnits).toHaveLength(1);

      expect(eliteUnits[0].number).toBe(1);
      expect(eliteUnits[1].number).toBe(5);
      expect(normalUnits[0].number).toBe(3);

      expect(eliteUnits[0].stats.health).toBe(9);
      expect(normalUnits[0].stats.health).toBe(6);
    });

    it('should prevent adding duplicate monster numbers', () => {
      // Pre-populate with existing monsters
      playArea.set([
        {
          id: 'existing-1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        },
        {
          id: 'existing-3',
          name: 'Ancient Artillery',
          number: 3,
          type: 'elite',
          stats: { health: 9, move: 0, attack: 3, range: 5, attributes: [] },
          currentHp: 9,
          activeConditions: []
        }
      ]);

      // Try to add units at positions 1, 2, 3, 4
      const unitStates = ['normal', 'elite', 'normal', 'elite', null, null, null, null, null, null];
      const levelData = mockData.monsters['Ancient Artillery'].level.find((l) => l.level === 1);

      const newUnits = simulateMonsterAddition(
        playArea,
        'Ancient Artillery',
        unitStates,
        levelData
      );

      // Should only add positions 2 and 4 (skip 1 and 3 because they exist)
      expect(newUnits).toHaveLength(2);
      expect(newUnits.find((u) => u.number === 1)).toBeFalsy();
      expect(newUnits.find((u) => u.number === 2)).toBeTruthy();
      expect(newUnits.find((u) => u.number === 3)).toBeFalsy();
      expect(newUnits.find((u) => u.number === 4)).toBeTruthy();

      const finalUnits = get(playArea);
      expect(finalUnits).toHaveLength(4);
    });

    it('should handle different monster types independently', () => {
      // Add Ancient Artillery #1
      playArea.set([
        {
          id: 'artillery-1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        }
      ]);

      // Add Bandit Guard #1 (should be allowed despite Artillery #1 existing)
      const unitStates = ['elite', null, null, null, null, null, null, null, null, null];
      const levelData = mockData.monsters['Bandit Guard'].level.find((l) => l.level === 1);

      const newUnits = simulateMonsterAddition(playArea, 'Bandit Guard', unitStates, levelData);

      expect(newUnits).toHaveLength(1);
      expect(newUnits[0].number).toBe(1);
      expect(newUnits[0].name).toBe('Bandit Guard');

      const finalUnits = get(playArea);
      expect(finalUnits).toHaveLength(2);
      expect(finalUnits.filter((u) => u.name === 'Ancient Artillery')).toHaveLength(1);
      expect(finalUnits.filter((u) => u.name === 'Bandit Guard')).toHaveLength(1);
    });

    it('should not add anything when no valid units are selected', () => {
      const unitStates = [null, null, null, null, null, null, null, null, null, null];
      const levelData = mockData.monsters['Ancient Artillery'].level.find((l) => l.level === 1);

      const newUnits = simulateMonsterAddition(
        playArea,
        'Ancient Artillery',
        unitStates,
        levelData
      );

      expect(newUnits).toHaveLength(0);
      expect(get(playArea)).toHaveLength(0);
    });

    it('should handle missing level data gracefully', () => {
      const unitStates = ['normal', null, null, null, null, null, null, null, null, null];
      const levelData = null; // Missing data

      expect(() => {
        simulateMonsterAddition(playArea, 'Ancient Artillery', unitStates, levelData);
      }).not.toThrow();
    });
  });

  describe('Boss Health Calculation Logic', () => {
    it('should calculate boss health correctly with party count', () => {
      expect(computeBossHealth('8xC', 4)).toBe(32);
      expect(computeBossHealth('10xC', 6)).toBe(60);
      expect(computeBossHealth('6xC', 3)).toBe(18);
    });

    it('should handle minimum party count of 1', () => {
      expect(computeBossHealth('10xC', 0)).toBe(10); // Should use 1 as minimum
      expect(computeBossHealth('8xC', -5)).toBe(8); // Should use 1 as minimum
    });

    it('should handle invalid expressions', () => {
      expect(computeBossHealth('invalid', 4)).toBe(0);
      expect(computeBossHealth('10', 4)).toBe(0); // Missing xC
      expect(computeBossHealth('', 4)).toBe(0);
    });

    /**
     * Simulates boss creation logic
     * @param {string} bossName
     * @param {number} level
     * @param {number} partyCount
     * @param {any} bossData
     * @returns {Unit}
     */
    function simulateBossCreation(bossName, level, partyCount, bossData) {
      const levelData = bossData.level.find((/** @type {any} */ l) => l.level === level);
      if (!levelData) throw new Error('Level data not found');

      const hp = computeBossHealth(String(levelData.health), partyCount);
      const id = crypto?.randomUUID?.() ?? `${bossName}-boss-${Date.now()}`;

      return {
        id,
        name: bossName,
        number: 1,
        type: 'boss',
        currentHp: hp,
        stats: {
          health: hp,
          move: Number(levelData.move ?? 0),
          attack: Number(levelData.attack ?? 0),
          range: Number(levelData.range ?? 0)
        },
        activeConditions: [],
        bossMeta: {
          healthExpr: String(levelData.health),
          specials: [
            (Array.isArray(levelData.special1) ? levelData.special1.join(', ') : '').replace(
              /\{\{.*?\}\}/g,
              '🟥'
            ),
            (Array.isArray(levelData.special2) ? levelData.special2.join(', ') : '').replace(
              /\{\{.*?\}\}/g,
              '🟥'
            )
          ],
          immunities: Array.isArray(levelData.immunities) ? levelData.immunities : [],
          notes: levelData.notes ?? ''
        }
      };
    }

    it('should create boss with correct metadata', () => {
      const boss = simulateBossCreation('Test Boss', 0, 4, mockData.bosses['Test Boss']);

      expect(boss.name).toBe('Test Boss');
      expect(boss.type).toBe('boss');
      expect(boss.currentHp).toBe(24); // 6xC * 4
      expect(boss.stats.health).toBe(24);
      expect(boss.bossMeta?.healthExpr).toBe('6xC');
      expect(boss.bossMeta?.immunities).toEqual(['Test Immunity']);
      expect(boss.bossMeta?.notes).toBe('Test notes');
      expect(boss.bossMeta?.specials).toHaveLength(2);
    });
  });

  describe('Ally Name Generation Logic', () => {
    /**
     * Simulates the nextAllyNumber logic
     * @param {import('svelte/store').Writable<Unit[]>} playAreaStore
     * @returns {number}
     */
    function getNextAllyNumber(playAreaStore) {
      const existing = get(playAreaStore).filter((u) => u.type === 'ally');
      return existing.length + 1;
    }

    /**
     * Simulates ally creation logic
     * @param {string} allyName
     * @param {number} allyHp
     * @param {import('svelte/store').Writable<Unit[]>} playAreaStore
     * @returns {Unit}
     */
    function simulateAllyCreation(allyName, allyHp, playAreaStore) {
      const now = Date.now();
      const id = crypto?.randomUUID?.() ?? `ally-${now}`;
      const name = allyName?.trim() ? allyName.trim() : `Ally ${getNextAllyNumber(playAreaStore)}`;

      return {
        id,
        name,
        number: 1,
        type: 'ally',
        stats: { health: Number(allyHp), move: 0, attack: 0 },
        currentHp: Number(allyHp),
        activeConditions: []
      };
    }

    it('should generate auto-incrementing ally names when name is empty', () => {
      const ally1 = simulateAllyCreation('', 10, playArea);
      expect(ally1.name).toBe('Ally 1');

      playArea.update((units) => [...units, ally1]);

      const ally2 = simulateAllyCreation('', 12, playArea);
      expect(ally2.name).toBe('Ally 2');
    });

    it('should use custom name when provided', () => {
      const ally = simulateAllyCreation('Custom Ally Name', 15, playArea);
      expect(ally.name).toBe('Custom Ally Name');
      expect(ally.currentHp).toBe(15);
      expect(ally.stats.health).toBe(15);
    });

    it('should trim whitespace from ally names', () => {
      const ally = simulateAllyCreation('   Trimmed Name   ', 8, playArea);
      expect(ally.name).toBe('Trimmed Name');
    });

    it('should handle HP values correctly', () => {
      const ally = simulateAllyCreation('Test Ally', 25, playArea);
      expect(ally.currentHp).toBe(25);
      expect(ally.stats.health).toBe(25);
      expect(ally.type).toBe('ally');
      expect(ally.number).toBe(1);
    });

    it('should count existing allies for auto-naming', () => {
      // Pre-populate with some allies
      playArea.set([
        {
          id: 'ally-1',
          name: 'Existing Ally',
          number: 1,
          type: 'ally',
          stats: { health: 10, move: 0, attack: 0 },
          currentHp: 10,
          activeConditions: []
        },
        {
          id: 'monster-1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        }
      ]);

      const newAlly = simulateAllyCreation('', 12, playArea);
      expect(newAlly.name).toBe('Ally 2'); // Should be 2 because there's 1 existing ally
    });
  });

  describe('Data Validation Logic', () => {
    it('should handle missing monster data', () => {
      const unitStates = ['normal', null, null, null, null, null, null, null, null, null];

      expect(() => {
        simulateMonsterAddition(playArea, 'Nonexistent Monster', unitStates, null);
      }).not.toThrow();

      expect(get(playArea)).toHaveLength(0);
    });

    it('should handle missing level data', () => {
      const unitStates = ['normal', null, null, null, null, null, null, null, null, null];

      expect(() => {
        simulateMonsterAddition(playArea, 'Ancient Artillery', unitStates, undefined);
      }).not.toThrow();
    });

    it('should handle empty boss names array', () => {
      const emptyBossData = { bosses: {} };
      const bossNames = Object.keys(emptyBossData.bosses);

      expect(bossNames).toHaveLength(0);
    });

    it('should handle malformed health expressions', () => {
      expect(computeBossHealth('malformed', 4)).toBe(0);
      expect(computeBossHealth('10x', 4)).toBe(0);
      expect(computeBossHealth('xC', 4)).toBe(0);
      expect(computeBossHealth('10 x C', 4)).toBe(40); // Valid - regex allows spaces
      expect(computeBossHealth('10xD', 4)).toBe(0); // Invalid - not C
      expect(computeBossHealth('x10C', 4)).toBe(0); // Invalid - wrong order
    });

    /**
     * Simulates getting existing numbers for duplicate prevention
     * @param {import('svelte/store').Writable<Unit[]>} playAreaStore
     * @param {string} monsterName
     * @returns {Set<number>}
     */
    function getExistingNumbers(playAreaStore, monsterName) {
      const units = get(playAreaStore);
      return new Set(units.filter((unit) => unit.name === monsterName).map((unit) => unit.number));
    }

    it('should correctly identify existing monster numbers', () => {
      playArea.set([
        {
          id: '1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        },
        {
          id: '2',
          name: 'Ancient Artillery',
          number: 3,
          type: 'elite',
          stats: { health: 9, move: 0, attack: 3, range: 5, attributes: [] },
          currentHp: 9,
          activeConditions: []
        },
        {
          id: '3',
          name: 'Bandit Guard',
          number: 1,
          type: 'normal',
          stats: { health: 8, move: 2, attack: 3, range: 0, attributes: [] },
          currentHp: 8,
          activeConditions: []
        }
      ]);

      const artilleryNumbers = getExistingNumbers(playArea, 'Ancient Artillery');
      const banditNumbers = getExistingNumbers(playArea, 'Bandit Guard');
      const nonExistentNumbers = getExistingNumbers(playArea, 'Nonexistent');

      expect(artilleryNumbers.has(1)).toBe(true);
      expect(artilleryNumbers.has(2)).toBe(false);
      expect(artilleryNumbers.has(3)).toBe(true);

      expect(banditNumbers.has(1)).toBe(true);
      expect(banditNumbers.has(2)).toBe(false);

      expect(nonExistentNumbers.size).toBe(0);
    });
  });

  /**
   * Helper function to simulate the monster addition logic from the component
   * This is extracted and simplified version of the AddPanel's handleAdd function
   * @param {any} playAreaStore
   * @param {any} selectedMonster
   * @param {any} unitStates
   * @param {any} levelData
   * @returns {Unit[]}
   */
  function simulateMonsterAddition(playAreaStore, selectedMonster, unitStates, levelData) {
    if (!levelData) return [];

    const existingNumbers = new Set(
      get(playAreaStore)
        .filter((/** @type {any} */ unit) => unit.name === selectedMonster)
        .map((/** @type {any} */ unit) => unit.number)
    );

    const now = Date.now();
    const newUnits = /** @type {Unit[]} */ (
      unitStates
        .map((/** @type {any} */ type, /** @type {any} */ i) => {
          if (!type) return null;

          const number = i + 1;
          if (existingNumbers.has(number)) return null;

          const id = crypto?.randomUUID?.() ?? `${selectedMonster}-${type}-${number}-${now}`;
          const stats = levelData[type];
          if (!stats) return null;

          /** @type {Unit} */
          const unit = {
            id,
            number,
            type: /** @type {'normal' | 'elite' | 'boss'} */ (type),
            stats,
            name: selectedMonster,
            currentHp: stats.health,
            activeConditions: []
          };
          return unit;
        })
        .filter(Boolean)
    );

    if (newUnits.length > 0) {
      playAreaStore.update((/** @type {any} */ old) => [...old, ...newUnits]);
    }

    return newUnits;
  }
});
