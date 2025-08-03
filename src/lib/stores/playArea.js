import { writable } from 'svelte/store';

const initial =
	typeof localStorage !== 'undefined' && localStorage.getItem('playArea')
		? JSON.parse(localStorage.getItem('playArea'))
		: [];

export const playArea = writable(initial);

// Persist on change
if (typeof localStorage !== 'undefined') {
	playArea.subscribe((value) => {
		localStorage.setItem('playArea', JSON.stringify(value));
	});
}
