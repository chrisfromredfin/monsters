import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { playArea, groupedUnits } from './playArea.js';

/** @typedef {import('$lib/types').Unit} Unit */

/**
 * Helper function to create a mock unit
 * @param {Partial<Unit>} overrides
 * @returns {Unit}
 */
function createUnit(overrides = {}) {
  return {
    id: crypto?.randomUUID?.() ?? `test-${Date.now()}-${Math.random()}`,
    name: 'Test Monster',
    number: 1,
    type: 'normal',
    stats: { health: 10, move: 2, attack: 3, range: 1, attributes: [] },
    currentHp: 10,
    activeConditions: [],
    ...overrides
  };
}

describe('groupedUnits Store - Ally Grouping Logic', () => {
  beforeEach(() => {
    // Clear the playArea store before each test
    playArea.set([]);
  });

  describe('Ally Grouping', () => {
    it('should group all allies under single "Allies" key regardless of name', () => {
      const testUnits = [
        createUnit({ name: 'Ally 1', type: 'ally' }),
        createUnit({ name: 'Bob', type: 'ally' }),
        createUnit({ name: 'Healer', type: 'ally' }),
        createUnit({ name: 'Ancient Artillery', type: 'normal' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      // Should have 2 groups: "Ancient Artillery" and "Allies"
      expect(groups).toHaveLength(2);

      // Find the allies group
      const alliesGroup = groups.find((group) => group.length > 0 && group[0].type === 'ally');

      expect(alliesGroup).toBeTruthy();
      expect(alliesGroup).toHaveLength(3);

      // All allies should be in the same group
      const allyNames = alliesGroup.map((unit) => unit.name).sort();
      expect(allyNames).toEqual(['Ally 1', 'Bob', 'Healer']);
    });

    it('should sort allies within group by name alphabetically, then by ID', () => {
      const testUnits = [
        createUnit({ id: 'id-3', name: 'Charlie', type: 'ally' }),
        createUnit({ id: 'id-1', name: 'Alice', type: 'ally' }),
        createUnit({ id: 'id-4', name: 'Alice', type: 'ally' }), // Same name, different ID
        createUnit({ id: 'id-2', name: 'Bob', type: 'ally' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      const alliesGroup = groups.find((group) => group.length > 0 && group[0].type === 'ally');

      expect(alliesGroup).toHaveLength(4);

      // Should be sorted by name first, then by ID for ties
      expect(alliesGroup[0].name).toBe('Alice');
      expect(alliesGroup[0].id).toBe('id-1'); // Earlier ID
      expect(alliesGroup[1].name).toBe('Alice');
      expect(alliesGroup[1].id).toBe('id-4'); // Later ID
      expect(alliesGroup[2].name).toBe('Bob');
      expect(alliesGroup[3].name).toBe('Charlie');
    });

    it('should handle single ally correctly', () => {
      const testUnits = [createUnit({ name: 'Solo Ally', type: 'ally' })];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].name).toBe('Solo Ally');
      expect(groups[0][0].type).toBe('ally');
    });

    it('should handle empty ally names gracefully', () => {
      const testUnits = [
        createUnit({ name: '', type: 'ally', id: 'empty-1' }),
        createUnit({ name: 'Named Ally', type: 'ally', id: 'named-1' }),
        createUnit({ name: '', type: 'ally', id: 'empty-2' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      const alliesGroup = groups.find((group) => group.length > 0 && group[0].type === 'ally');

      expect(alliesGroup).toHaveLength(3);
      // Empty names should sort first, then by ID
      expect(alliesGroup[0].name).toBe('');
      expect(alliesGroup[0].id).toBe('empty-1');
      expect(alliesGroup[1].name).toBe('');
      expect(alliesGroup[1].id).toBe('empty-2');
      expect(alliesGroup[2].name).toBe('Named Ally');
    });
  });

  describe('Group Ordering', () => {
    it('should order groups as: Monsters → Bosses → Allies', () => {
      const testUnits = [
        createUnit({ name: 'Ally 1', type: 'ally' }),
        createUnit({ name: 'Boss Monster', type: 'boss' }),
        createUnit({ name: 'Regular Monster', type: 'normal' }),
        createUnit({ name: 'Ally 2', type: 'ally' }),
        createUnit({ name: 'Elite Monster', type: 'elite' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(4); // Regular Monster, Elite Monster, Boss Monster, Allies

      // Check the order
      expect(groups[0][0].name).toBe('Elite Monster'); // Monster group (sorted by name)
      expect(groups[1][0].name).toBe('Regular Monster'); // Monster group (sorted by name)
      expect(groups[2][0].name).toBe('Boss Monster'); // Boss group
      expect(groups[3][0].type).toBe('ally'); // Allies group (last)
    });

    it('should sort monster groups alphabetically by name', () => {
      const testUnits = [
        createUnit({ name: 'Zebra Monster', type: 'normal' }),
        createUnit({ name: 'Alpha Monster', type: 'elite' }),
        createUnit({ name: 'Beta Monster', type: 'normal' }),
        createUnit({ name: 'Ally', type: 'ally' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(4);

      // Monster groups should be sorted alphabetically
      expect(groups[0][0].name).toBe('Alpha Monster');
      expect(groups[1][0].name).toBe('Beta Monster');
      expect(groups[2][0].name).toBe('Zebra Monster');
      expect(groups[3][0].type).toBe('ally'); // Allies always last
    });

    it('should place allies last even with multiple bosses', () => {
      const testUnits = [
        createUnit({ name: 'Ally', type: 'ally' }),
        createUnit({ name: 'Boss A', type: 'boss' }),
        createUnit({ name: 'Boss B', type: 'boss' }),
        createUnit({ name: 'Monster', type: 'normal' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(4);

      // Should be: Monster, Boss A, Boss B, Allies
      expect(groups[0][0].name).toBe('Monster');
      expect(groups[1][0].name).toBe('Boss A');
      expect(groups[2][0].name).toBe('Boss B');
      expect(groups[3][0].type).toBe('ally');
    });
  });

  describe('Monster Group Sorting (Existing Logic)', () => {
    it('should sort monsters within group: elite first, then by number', () => {
      const testUnits = [
        createUnit({ name: 'Test Monster', type: 'normal', number: 3 }),
        createUnit({ name: 'Test Monster', type: 'elite', number: 2 }),
        createUnit({ name: 'Test Monster', type: 'normal', number: 1 }),
        createUnit({ name: 'Test Monster', type: 'elite', number: 1 })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(1);
      const monsterGroup = groups[0];

      // Should be sorted: elite #1, elite #2, normal #1, normal #3
      expect(monsterGroup[0].type).toBe('elite');
      expect(monsterGroup[0].number).toBe(1);
      expect(monsterGroup[1].type).toBe('elite');
      expect(monsterGroup[1].number).toBe(2);
      expect(monsterGroup[2].type).toBe('normal');
      expect(monsterGroup[2].number).toBe(1);
      expect(monsterGroup[3].type).toBe('normal');
      expect(monsterGroup[3].number).toBe(3);
    });

    it('should not sort boss groups (single unit)', () => {
      const testUnits = [createUnit({ name: 'Boss Monster', type: 'boss', number: 1 })];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].type).toBe('boss');
    });
  });

  describe('Mixed Scenarios', () => {
    it('should handle complex mixed scenario correctly', () => {
      const testUnits = [
        // Multiple allies with different names
        createUnit({ id: 'ally-1', name: 'Healer', type: 'ally' }),
        createUnit({ id: 'ally-2', name: 'Ally 1', type: 'ally' }),
        createUnit({ id: 'ally-3', name: 'Bob', type: 'ally' }),

        // Multiple monsters of same type
        createUnit({ name: 'Ancient Artillery', type: 'elite', number: 1 }),
        createUnit({ name: 'Ancient Artillery', type: 'normal', number: 2 }),
        createUnit({ name: 'Ancient Artillery', type: 'normal', number: 1 }),

        // Different monster type
        createUnit({ name: 'Bandit Guard', type: 'normal', number: 1 }),

        // Boss
        createUnit({ name: 'Big Boss', type: 'boss', number: 1 })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(4);

      // Verify order: Ancient Artillery, Bandit Guard, Big Boss, Allies
      expect(groups[0][0].name).toBe('Ancient Artillery');
      expect(groups[1][0].name).toBe('Bandit Guard');
      expect(groups[2][0].name).toBe('Big Boss');
      expect(groups[3][0].type).toBe('ally');

      // Verify Ancient Artillery internal sorting (elite first, then by number)
      const artilleryGroup = groups[0];
      expect(artilleryGroup).toHaveLength(3);
      expect(artilleryGroup[0].type).toBe('elite');
      expect(artilleryGroup[0].number).toBe(1);
      expect(artilleryGroup[1].type).toBe('normal');
      expect(artilleryGroup[1].number).toBe(1);
      expect(artilleryGroup[2].type).toBe('normal');
      expect(artilleryGroup[2].number).toBe(2);

      // Verify allies sorting (alphabetical by name)
      const alliesGroup = groups[3];
      expect(alliesGroup).toHaveLength(3);
      expect(alliesGroup[0].name).toBe('Ally 1');
      expect(alliesGroup[1].name).toBe('Bob');
      expect(alliesGroup[2].name).toBe('Healer');
    });

    it('should handle only allies scenario', () => {
      const testUnits = [
        createUnit({ name: 'Ally 3', type: 'ally' }),
        createUnit({ name: 'Ally 1', type: 'ally' }),
        createUnit({ name: 'Ally 2', type: 'ally' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(3);

      // Should be sorted alphabetically
      expect(groups[0][0].name).toBe('Ally 1');
      expect(groups[0][1].name).toBe('Ally 2');
      expect(groups[0][2].name).toBe('Ally 3');
    });

    it('should handle empty play area', () => {
      playArea.set([]);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(0);
    });

    it('should maintain referential integrity of units', () => {
      const originalAlly = createUnit({ name: 'Test Ally', type: 'ally' });
      const testUnits = [originalAlly];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups[0][0]).toBe(originalAlly); // Same reference
    });
  });

  describe('Edge Cases', () => {
    it('should handle units with undefined/null properties gracefully', () => {
      const testUnits = [
        {
          id: 'test-1',
          name: 'Broken Unit',
          number: 1,
          type: 'ally',
          stats: { health: 5, move: 0, attack: 0 },
          currentHp: 5,
          activeConditions: []
          // Missing some optional properties
        }
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].type).toBe('ally');
    });

    it('should handle duplicate IDs gracefully', () => {
      const testUnits = [
        createUnit({ id: 'duplicate', name: 'Ally A', type: 'ally' }),
        createUnit({ id: 'duplicate', name: 'Ally B', type: 'ally' })
      ];

      playArea.set(testUnits);
      const groups = get(groupedUnits);

      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      // Should still group them together despite duplicate IDs
    });
  });
});
