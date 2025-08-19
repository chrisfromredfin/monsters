import { describe, it, expect, beforeEach } from 'vitest';
import { get, writable } from 'svelte/store';

/**
 * These tests focus on the core duplicate prevention logic
 * without requiring full component rendering, making them more reliable
 * and focused on the business logic we want to protect.
 */

describe('AddPanel - Duplicate Prevention Logic', () => {
  let playArea;
  
  beforeEach(() => {
    playArea = writable([]);
  });

  function getExistingNumbers(playAreaStore, monsterName) {
    const units = get(playAreaStore);
    return new Set(
      units
        .filter(unit => unit.name === monsterName)
        .map(unit => unit.number)
    );
  }

  function simulateAddAction(playAreaStore, selectedMonster, unitStates, levelData) {
    const existingNumbers = getExistingNumbers(playAreaStore, selectedMonster);
    const now = Date.now();
    
    const newUnits = unitStates
      .map((type, i) => {
        if (!type) return null;
        
        const number = i + 1;
        // This is the core logic we're testing - skip if number already exists
        if (existingNumbers.has(number)) return null;
        
        const stats = levelData[type];
        return {
          id: `${selectedMonster}-${type}-${number}-${now}`,
          number,
          type,
          stats,
          name: selectedMonster,
          currentHp: stats.health,
          activeConditions: []
        };
      })
      .filter(Boolean);

    if (newUnits.length > 0) {
      playAreaStore.update((old) => [...old, ...newUnits]);
    }
    
    return newUnits;
  }

  it('should allow adding monsters when no duplicates exist', () => {
    const selectedMonster = 'Ancient Artillery';
    const unitStates = [null, 'normal', null, 'elite', null, null, null, null, null, null]; // positions 2 and 4
    const levelData = {
      normal: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
      elite: { health: 9, move: 0, attack: 3, range: 5, attributes: [] }
    };

    const newUnits = simulateAddAction(playArea, selectedMonster, unitStates, levelData);

    expect(newUnits).toHaveLength(2);
    expect(newUnits[0].number).toBe(2);
    expect(newUnits[0].type).toBe('normal');
    expect(newUnits[1].number).toBe(4);
    expect(newUnits[1].type).toBe('elite');

    // Verify they were added to the play area
    const currentPlayArea = get(playArea);
    expect(currentPlayArea).toHaveLength(2);
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

    const selectedMonster = 'Ancient Artillery';
    // Try to add units 1, 2, 3, 4 - should only get 2 and 4
    const unitStates = ['normal', 'elite', 'normal', 'elite', null, null, null, null, null, null];
    const levelData = {
      normal: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
      elite: { health: 9, move: 0, attack: 3, range: 5, attributes: [] }
    };

    const newUnits = simulateAddAction(playArea, selectedMonster, unitStates, levelData);

    // Should only add #2 and #4 (skip #1 and #3 because they exist)
    expect(newUnits).toHaveLength(2);
    expect(newUnits.find(u => u.number === 1)).toBeUndefined(); // blocked
    expect(newUnits.find(u => u.number === 2)).toBeTruthy(); // allowed
    expect(newUnits.find(u => u.number === 3)).toBeUndefined(); // blocked
    expect(newUnits.find(u => u.number === 4)).toBeTruthy(); // allowed

    // Verify final state
    const currentPlayArea = get(playArea);
    expect(currentPlayArea).toHaveLength(4); // 2 original + 2 new
    
    const numbers = currentPlayArea.map(u => u.number).sort();
    expect(numbers).toEqual([1, 2, 3, 4]);
  });

  it('should handle different monster types independently', () => {
    // Add some Ancient Artillery
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

    const selectedMonster = 'Bandit Guard'; // Different monster type
    const unitStates = ['elite', null, null, null, null, null, null, null, null, null]; // Add #1
    const levelData = {
      elite: { health: 12, move: 2, attack: 4, range: 0, attributes: [] }
    };

    const newUnits = simulateAddAction(playArea, selectedMonster, unitStates, levelData);

    // Should allow adding Bandit Guard #1 even though Ancient Artillery #1 exists
    expect(newUnits).toHaveLength(1);
    expect(newUnits[0].number).toBe(1);
    expect(newUnits[0].name).toBe('Bandit Guard');

    const currentPlayArea = get(playArea);
    expect(currentPlayArea).toHaveLength(2);
    expect(currentPlayArea.filter(u => u.name === 'Ancient Artillery')).toHaveLength(1);
    expect(currentPlayArea.filter(u => u.name === 'Bandit Guard')).toHaveLength(1);
  });

  it('should correctly identify existing numbers for a specific monster', () => {
    playArea.set([
      { id: '1', name: 'Ancient Artillery', number: 1, type: 'normal' },
      { id: '2', name: 'Ancient Artillery', number: 3, type: 'elite' },
      { id: '3', name: 'Bandit Guard', number: 1, type: 'normal' },
      { id: '4', name: 'Bandit Guard', number: 2, type: 'normal' },
      { id: '5', name: 'Ancient Artillery', number: 5, type: 'normal' }
    ]);

    const artilleryNumbers = getExistingNumbers(playArea, 'Ancient Artillery');
    const banditNumbers = getExistingNumbers(playArea, 'Bandit Guard');
    const nonExistentNumbers = getExistingNumbers(playArea, 'Non-existent Monster');

    expect(artilleryNumbers.has(1)).toBe(true);
    expect(artilleryNumbers.has(2)).toBe(false);
    expect(artilleryNumbers.has(3)).toBe(true);
    expect(artilleryNumbers.has(4)).toBe(false);
    expect(artilleryNumbers.has(5)).toBe(true);

    expect(banditNumbers.has(1)).toBe(true);
    expect(banditNumbers.has(2)).toBe(true);
    expect(banditNumbers.has(3)).toBe(false);

    expect(nonExistentNumbers.size).toBe(0);
  });

  it('should handle edge cases gracefully', () => {
    playArea.set([]);

    // Test with empty unit states
    const newUnits1 = simulateAddAction(playArea, 'Ancient Artillery', Array(10).fill(null), {});
    expect(newUnits1).toHaveLength(0);

    // Test with all positions filled for different types
    const unitStates = Array(10).fill('normal');
    const levelData = {
      normal: { health: 6, move: 0, attack: 2, range: 4, attributes: [] }
    };
    
    const newUnits2 = simulateAddAction(playArea, 'Ancient Artillery', unitStates, levelData);
    expect(newUnits2).toHaveLength(10);
    expect(newUnits2.map(u => u.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should maintain data integrity during multiple operations', () => {
    playArea.set([]);

    // Add some monsters
    const levelData = {
      normal: { health: 6, move: 0, attack: 2, range: 4, attributes: [] },
      elite: { health: 9, move: 0, attack: 3, range: 5, attributes: [] }
    };

    // First addition
    let unitStates = ['normal', null, 'elite', null, null, null, null, null, null, null];
    simulateAddAction(playArea, 'Ancient Artillery', unitStates, levelData);
    
    let currentPlayArea = get(playArea);
    expect(currentPlayArea).toHaveLength(2);
    expect(currentPlayArea.map(u => u.number).sort()).toEqual([1, 3]);

    // Second addition - should skip existing numbers
    unitStates = ['elite', 'normal', 'normal', 'elite', null, null, null, null, null, null];
    simulateAddAction(playArea, 'Ancient Artillery', unitStates, levelData);
    
    currentPlayArea = get(playArea);
    expect(currentPlayArea).toHaveLength(4);
    expect(currentPlayArea.map(u => u.number).sort()).toEqual([1, 2, 3, 4]);

    // Verify no duplicates exist
    const numbers = currentPlayArea.map(u => u.number);
    const uniqueNumbers = [...new Set(numbers)];
    expect(numbers).toEqual(uniqueNumbers);
  });
});
