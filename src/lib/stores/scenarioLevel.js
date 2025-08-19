import { writable } from 'svelte/store';

const initial =
  typeof localStorage !== 'undefined' && localStorage.getItem('scenarioLevel')
    ? JSON.parse(localStorage.getItem('scenarioLevel'))
    : null;

export const scenarioLevel = writable(initial);

// Save on change
if (typeof localStorage !== 'undefined') {
  scenarioLevel.subscribe((value) => {
    localStorage.setItem('scenarioLevel', JSON.stringify(value));
  });
}
