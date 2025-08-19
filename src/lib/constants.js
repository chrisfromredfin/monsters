// src/lib/constants.js
// Shared constants used across multiple components

export const CONDITIONS = [
  'strengthened',
  'muddled',
  'poisoned',
  'wounded',
  'stunned',
  'immobilized',
  'disarmed'
];

export const IMMUNITY_MAP = {
  muddled: 'muddle',
  poisoned: 'poison',
  wounded: 'wound',
  stunned: 'stun',
  immobilized: 'immobilize',
  disarmed: 'disarm'
  // strengthened has no immunity counterpart
};
