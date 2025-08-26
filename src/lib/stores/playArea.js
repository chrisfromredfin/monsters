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
        type:
          u.type === 'boss'
            ? 'boss'
            : u.type === 'elite'
              ? 'elite'
              : u.type === 'ally'
                ? 'ally'
                : 'normal',
        stats: {
          health: Number(u.stats?.health ?? 0),
          move: Number(u.stats?.move ?? 0),
          attack: Number(u.stats?.attack ?? 0),
          range: u.stats?.range != null ? Number(u.stats.range) : undefined,
          attributes: Array.isArray(u.stats?.attributes) ? u.stats.attributes : []
        },
        currentHp: Number(u.currentHp ?? u.stats?.health ?? 0),
        activeConditions: Array.isArray(u.activeConditions) ? u.activeConditions : [],
        bossMeta:
          u.type === 'boss'
            ? {
                healthExpr: String(u.bossMeta?.healthExpr ?? ''),
                specials: Array.isArray(u.bossMeta?.specials) ? u.bossMeta.specials : [],
                immunities: Array.isArray(u.bossMeta?.immunities) ? u.bossMeta.immunities : [],
                // omit notes if empty/undefined
                ...(typeof u.bossMeta?.notes === 'string' && u.bossMeta.notes
                  ? { notes: u.bossMeta.notes }
                  : {})
              }
            : undefined
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

      // Sort within each non-boss group: elite first, then number asc
      for (const k in byName) {
        const group = byName[k];
        const isBossGroup = group.length === 1 && group[0].type === 'boss';
        if (!isBossGroup) {
          group.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'elite' ? -1 : 1;
            return a.number - b.number;
          });
        }
      }

      // Sort groups: boss groups last; tie-breaker by name for stability
      const groups = Object.values(byName);
      groups.sort((g1, g2) => {
        const b1 = g1.length === 1 && g1[0].type === 'boss';
        const b2 = g2.length === 1 && g2[0].type === 'boss';
        if (b1 !== b2) return b1 ? 1 : -1;
        return g1[0].name.localeCompare(g2[0].name);
      });

      return groups;
    })
  );
