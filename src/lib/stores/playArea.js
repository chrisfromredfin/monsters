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
      
      for (const u of arr) {
        // Group all allies together under "Allies" regardless of their individual names
        const groupKey = u.type === 'ally' ? 'Allies' : u.name;
        (byName[groupKey] ||= []).push(u);
      }

      // Sort within each group
      for (const k in byName) {
        const group = byName[k];
        const isBossGroup = group.length === 1 && group[0].type === 'boss';
        const isAllyGroup = k === 'Allies';
        
        if (!isBossGroup) {
          group.sort((a, b) => {
            // For ally groups, sort by name first, then by creation order (id)
            if (isAllyGroup) {
              const nameCompare = a.name.localeCompare(b.name);
              if (nameCompare !== 0) return nameCompare;
              return a.id.localeCompare(b.id);
            }
            // For monster groups, sort elite first, then by number
            if (a.type !== b.type) return a.type === 'elite' ? -1 : 1;
            return a.number - b.number;
          });
        }
      }

      // Sort groups: monsters first, then bosses, then allies last
      const groups = Object.values(byName);
      groups.sort((g1, g2) => {
        const b1 = g1.length === 1 && g1[0].type === 'boss';
        const b2 = g2.length === 1 && g2[0].type === 'boss';
        const a1 = g1[0].type === 'ally';
        const a2 = g2[0].type === 'ally';
        
        // Allies last
        if (a1 && !a2) return 1;
        if (!a1 && a2) return -1;
        
        // Bosses second to last (before allies)
        if (b1 !== b2) return b1 ? 1 : -1;
        
        // For non-ally, non-boss groups (monsters), sort by name
        if (!a1 && !a2 && !b1 && !b2) {
          return g1[0].name.localeCompare(g2[0].name);
        }
        
        return 0;
      });

      return groups;
    })
  );
