import fs from 'fs/promises';
import path from 'path';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const filePath = path.resolve('src/lib/server/data/monster-stats.json');
	const json = await fs.readFile(filePath, 'utf-8');
	const data = JSON.parse(json);

	return data;
}
