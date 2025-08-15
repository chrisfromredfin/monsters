// src/lib/stores/playArea.js
// @ts-check
import { writable, derived } from 'svelte/store';

/** @typedef {import('$lib/types').Unit} Unit */

/** @returns {Unit[]} */
function loadInitial() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem('playArea');
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // migrate + normalize
    return parsed.map(
      /** @returns {Unit} */
      (u) => ({
        id: String(u.id ?? crypto?.randomUUID?.() ?? Date.now()),
        name: String(u.name ?? ''),
        number: Number(u.number ?? 1),
        type: u.type === 'elite' ? 'elite' : 'normal',
        stats: {
          health: Number(u.stats?.health ?? 0),
          move: Number(u.stats?.move ?? 0),
          attack: Number(u.stats?.attack ?? 0),
          range: u.stats?.range != null ? Number(u.stats.range) : undefined,
          attributes: Array.isArray(u.stats?.attributes) ? u.stats.attributes : []
        },
        currentHp: Number(u.currentHp ?? u.stats?.health ?? 0),
        activeConditions: Array.isArray(u.activeConditions) ? u.activeConditions : []
      })
    );
  } catch {
    return [];
  }
}

export const playArea =
  /** @type {import('svelte/store').Writable<Unit[]>} */
  (writable(loadInitial()));

if (typeof localStorage !== 'undefined') {
  playArea.subscribe(
    /** @param {Unit[]} value */
    (value) => localStorage.setItem('playArea', JSON.stringify(value))
  );
}

export const groupedUnits =
  /** @type {import('svelte/store').Readable<import('$lib/types').Unit[][]>} */
  (
    derived(playArea, (arr) => {
      /** @type {Record<string, import('$lib/types').Unit[]>} */
      const byName = {};
      for (const u of arr) (byName[u.name] ||= []).push(u);
      for (const k in byName) byName[k].sort((a, b) => a.number - b.number);
      return Object.values(byName);
    })
  );
