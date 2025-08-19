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
        type: u.type === 'boss' ? 'boss' : u.type === 'elite' ? 'elite' : 'normal',
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

      for (const k in byName) {
        byName[k].sort((a, b) => {
          // bosses always last
          if (a.type === 'boss' && b.type !== 'boss') return 1;
          if (b.type === 'boss' && a.type !== 'boss') return -1;

          // elites before normals
          if (a.type !== b.type) return a.type === 'elite' ? -1 : 1;

          // then ascending by number
          return a.number - b.number;
        });
      }

      return Object.values(byName);
    })
  );
