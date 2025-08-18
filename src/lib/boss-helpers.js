// src/lib/boss-helpers.js
// @ts-check

/**
 * "10xC" -> 10 * partyCount
 * Falls back to 0 if it cannot parse.
 * @param {string} expr
 * @param {number} partyCount
 */
export function computeBossHealth(expr, partyCount) {
  const m = /^(\d+)\s*x\s*C$/i.exec(expr.trim());
  if (!m) return 0;
  const n = Number(m[1]);
  return n * Math.max(1, partyCount || 0);
}
