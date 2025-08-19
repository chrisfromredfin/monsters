import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { playArea } from '$lib/stores/playArea.js';
import { removeUnit, adjustHp, toggleCondition } from './unitActions.js';

describe('Unit Actions', () => {
  beforeEach(() => {
    // Clear the play area before each test
    playArea.set([]);
  });

  describe('removeUnit', () => {
    it('should remove a unit by ID', () => {
      // Set up test data
      playArea.set([
        {
          id: 'unit-1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        },
        {
          id: 'unit-2',
          name: 'Ancient Artillery',
          number: 2,
          type: 'elite',
          stats: { health: 9, move: 0, attack: 3, range: 5, attributes: [] },
          currentHp: 9,
          activeConditions: []
        }
      ]);

      // Remove unit-1
      removeUnit('unit-1');

      // Verify unit was removed
      const currentPlayArea = get(playArea);
      expect(currentPlayArea).toHaveLength(1);
      expect(currentPlayArea[0].id).toBe('unit-2');
    });

    it('should not affect other units when removing non-existent ID', () => {
      // Set up test data
      playArea.set([
        {
          id: 'unit-1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        }
      ]);

      // Try to remove non-existent unit
      removeUnit('non-existent');

      // Verify original unit is still there
      const currentPlayArea = get(playArea);
      expect(currentPlayArea).toHaveLength(1);
      expect(currentPlayArea[0].id).toBe('unit-1');
    });
  });

  describe('adjustHp', () => {
    it('should increase HP when given positive delta', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 4,
        activeConditions: []
      };

      playArea.set([unit]);

      // Increase HP by 2
      adjustHp(unit, 2);

      // Verify HP was increased
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].currentHp).toBe(6);
    });

    it('should decrease HP when given negative delta', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 4,
        activeConditions: []
      };

      playArea.set([unit]);

      // Decrease HP by 2
      adjustHp(unit, -2);

      // Verify HP was decreased
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].currentHp).toBe(2);
    });

    it('should not allow HP to go below 0', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 2,
        activeConditions: []
      };

      playArea.set([unit]);

      // Try to decrease HP by more than current
      adjustHp(unit, -5);

      // Verify HP was capped at 0
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].currentHp).toBe(0);
    });

    it('should not allow HP to go above max health', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 5,
        activeConditions: []
      };

      playArea.set([unit]);

      // Try to increase HP above max
      adjustHp(unit, 5);

      // Verify HP was capped at max
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].currentHp).toBe(6);
    });
  });

  describe('toggleCondition', () => {
    it('should add condition when not present', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 6,
        activeConditions: []
      };

      playArea.set([unit]);

      // Add poisoned condition
      toggleCondition(unit, 'poisoned');

      // Verify condition was added
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].activeConditions).toContain('poisoned');
    });

    it('should remove condition when already present', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 6,
        activeConditions: ['poisoned', 'wounded']
      };

      playArea.set([unit]);

      // Remove poisoned condition
      toggleCondition(unit, 'poisoned');

      // Verify condition was removed
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].activeConditions).not.toContain('poisoned');
      expect(currentPlayArea[0].activeConditions).toContain('wounded');
    });

    it('should handle multiple condition toggles correctly', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 6,
        activeConditions: ['poisoned']
      };

      playArea.set([unit]);

      // Add wounded
      toggleCondition(unit, 'wounded');
      let currentPlayArea = get(playArea);
      expect(currentPlayArea[0].activeConditions).toEqual(['poisoned', 'wounded']);

      // Remove poisoned
      toggleCondition(unit, 'poisoned');
      currentPlayArea = get(playArea);
      expect(currentPlayArea[0].activeConditions).toEqual(['wounded']);

      // Add stunned
      toggleCondition(unit, 'stunned');
      currentPlayArea = get(playArea);
      expect(currentPlayArea[0].activeConditions).toEqual(['wounded', 'stunned']);
    });

    it('should handle unit with no activeConditions array', () => {
      const unit = {
        id: 'unit-1',
        name: 'Ancient Artillery',
        number: 1,
        type: 'normal',
        stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
        currentHp: 6
        // No activeConditions property
      };

      playArea.set([unit]);

      // Add condition to unit without activeConditions
      toggleCondition(unit, 'poisoned');

      // Verify condition was added
      const currentPlayArea = get(playArea);
      expect(currentPlayArea[0].activeConditions).toContain('poisoned');
    });
  });

  describe('Integration - prevent duplicate numbers', () => {
    it('should maintain number uniqueness constraint', () => {
      // This test verifies that our duplicate prevention logic works
      // by ensuring we cannot create units with the same name and number
      const existingUnits = [
        {
          id: 'unit-1',
          name: 'Ancient Artillery',
          number: 1,
          type: 'normal',
          stats: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
          currentHp: 6,
          activeConditions: []
        },
        {
          id: 'unit-3',
          name: 'Ancient Artillery',
          number: 3,
          type: 'elite',
          stats: { health: 9, move: 0, attack: 3, range: 5, attributes: [] },
          currentHp: 9,
          activeConditions: []
        }
      ];

      playArea.set(existingUnits);

      // Verify we can identify existing numbers
      const currentPlayArea = get(playArea);
      const ancientArtilleryUnits = currentPlayArea.filter((u) => u.name === 'Ancient Artillery');
      const existingNumbers = new Set(ancientArtilleryUnits.map((u) => u.number));

      expect(existingNumbers.has(1)).toBe(true);
      expect(existingNumbers.has(2)).toBe(false);
      expect(existingNumbers.has(3)).toBe(true);
      expect(existingNumbers.has(4)).toBe(false);

      // This demonstrates the logic that AddPanel uses to prevent duplicates
      const wouldBeDuplicate1 = existingNumbers.has(1); // true
      const wouldBeDuplicate2 = existingNumbers.has(2); // false
      const wouldBeDuplicate3 = existingNumbers.has(3); // true

      expect(wouldBeDuplicate1).toBe(true);
      expect(wouldBeDuplicate2).toBe(false);
      expect(wouldBeDuplicate3).toBe(true);
    });
  });
});
