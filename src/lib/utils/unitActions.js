// src/lib/utils/unitActions.js
// Shared utility functions for unit management

import { playArea } from '$lib/stores/playArea.js';

/** @typedef {import('$lib/types').Unit} Unit */

/**
 * Remove a unit from the play area
 * @param {string} unitId - The ID of the unit to remove
 */
export function removeUnit(unitId) {
  playArea.update((arr) => arr.filter((u) => u.id !== unitId));
}

/**
 * Adjust a unit's HP by a delta amount
 * @param {Unit} unit - The unit to adjust
 * @param {number} delta - The amount to adjust HP by (positive or negative)
 */
export function adjustHp(unit, delta) {
  const max = unit.stats.health ?? 0;
  unit.currentHp = Math.max(0, Math.min(max, (unit.currentHp ?? max) + delta));
  playArea.update((a) => [...a]); // trigger reactivity/persistence
}

/**
 * Toggle a condition on a unit
 * @param {Unit} unit - The unit to toggle the condition on
 * @param {string} condition - The condition to toggle
 */
export function toggleCondition(unit, condition) {
  const list = unit.activeConditions ?? [];
  const isActive = list.includes(condition);
  unit.activeConditions = isActive ? list.filter((c) => c !== condition) : [...list, condition];
  playArea.update((a) => [...a]); // trigger reactivity/persistence
}
