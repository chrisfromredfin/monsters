// src/lib/types.js
// @ts-check

/**
 * A single monster's base stats at a given level.
 * `attributes` are strings like "Target 2", "Shield 1", etc.
 * @typedef {Object} UnitStats
 * @property {number} health
 * @property {number} move
 * @property {number} attack
 * @property {number} [range]
 * @property {string[]} attributes
 */

/**
 * Boss-specific stats at a given level.
 * Health is often a formula like "8xC" (8 times character count)
 * @typedef {Object} BossStats
 * @property {string|number} health
 * @property {number} move
 * @property {number} attack
 * @property {number} [range]
 * @property {string[]} [special1]
 * @property {string[]} [special2]
 * @property {string[]} [immunities]
 * @property {string} [notes]
 */

/** @typedef {'normal' | 'elite' | 'boss'} UnitType */

/**
 * Status effects your UI can toggle on a unit.
 * Add more here if you introduce new icons.
 * @typedef {'strengthened'|'muddled'|'poisoned'|'wounded'|'stunned'|'immobilized'|'disarmed'} Condition
 */

/**
 * One monster instance on the board.
 * @typedef {Object} Unit
 * @property {string} id
 * @property {string} name
 * @property {number} number
 * @property {UnitType} type
 * @property {number|string} currentHp
 * @property {UnitStats|BossStats} stats
 * @property {Condition[]} activeConditions
 */

// Make this file a module so TS recognizes it for `import('$lib/types')`
export {};
