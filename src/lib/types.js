// src/lib/types.js
// @ts-check

/**
 * Shared base stats for cards shown on the board.
 * Regular monsters: numeric health.
 * Bosses: health is computed at add-time from a "NxC" expression in JSON.
 * @typedef {{ health: number, move: number, attack: number, range?: number, attributes?: string[] }} StatLine
 */

/**
 * Extra info only bosses have.
 * @typedef {{ healthExpr: string, specials: string[], immunities: string[], notes?: string }} BossMeta
 */

/**
 * Discriminated union by `type`.
 * - normal/elite = regular monsters
 * - boss = bosses
 * @typedef {{
 *   id: string;
 *   name: string;
 *   number: number;
 *   type: 'normal' | 'elite' | 'boss';
 *   currentHp: number;
 *   stats: StatLine;
 *   activeConditions: string[];
 *   bossMeta?: BossMeta;
 * }} Unit
 */

export {};
