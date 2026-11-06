import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const data = JSON.parse(readFileSync(resolve('src/lib/server/data/monster-stats.json'), 'utf-8'));

const FC_MONSTERS = ['Aesther Ashblade', 'Aesther Scout', 'Valrath Savage', 'Valrath Tracker'];

const FC_BOSSES = ['Human Commander', 'Manifestation of Corruption', 'Valrath Commander'];

describe('Forgotten Circles monster-stats', () => {
  it('includes all FC monsters and bosses', () => {
    for (const name of FC_MONSTERS) {
      expect(data.monsters, `missing monster ${name}`).toHaveProperty(name);
    }
    for (const name of FC_BOSSES) {
      expect(data.bosses, `missing boss ${name}`).toHaveProperty(name);
    }
  });

  it('gives every FC monster levels 0-7 with normal and elite stat lines', () => {
    for (const name of FC_MONSTERS) {
      const levels = data.monsters[name].level;
      expect(levels).toHaveLength(8);
      for (let i = 0; i <= 7; i++) {
        const block = levels[i];
        expect(block.level).toBe(i);
        for (const rank of ['normal', 'elite']) {
          const stats = block[rank];
          expect(stats).toMatchObject({
            health: expect.any(Number),
            move: expect.any(Number),
            attack: expect.any(Number),
            range: expect.any(Number)
          });
          expect(Array.isArray(stats.attributes)).toBe(true);
        }
      }
    }
  });

  it('gives every FC boss levels 0-7 with NxC health expressions', () => {
    for (const name of FC_BOSSES) {
      const levels = data.bosses[name].level;
      expect(levels).toHaveLength(8);
      for (let i = 0; i <= 7; i++) {
        const block = levels[i];
        expect(block.level).toBe(i);
        expect(String(block.health)).toMatch(/^\d+xC$/i);
        expect(typeof block.move).toBe('number');
        expect(typeof block.attack).toBe('number');
        expect(typeof block.range).toBe('number');
        expect(Array.isArray(block.special1)).toBe(true);
        expect(Array.isArray(block.special2)).toBe(true);
        expect(Array.isArray(block.immunities)).toBe(true);
      }
    }
  });

  // Spot-checks from official FC stat cards (gloomhaven-card-browser images)
  it('matches verified Valrath Savage card stats', () => {
    const savage = data.monsters['Valrath Savage'].level;
    const l0 = savage[0];
    expect(l0.normal).toMatchObject({ health: 6, move: 2, attack: 2, range: 0, attributes: [] });
    expect(l0.elite).toMatchObject({ health: 10, move: 2, attack: 3, range: 0 });

    const l4 = savage[4];
    expect(l4.normal).toMatchObject({
      health: 10,
      move: 3,
      attack: 2,
      range: 0,
      attributes: ['Shield 2']
    });
    expect(l4.elite.health).toBe(18);
    expect(l4.elite.attributes).toContain('All adjacent allies add +1 Attack to all attacks');
  });

  it('matches verified Aesther Ashblade card stats', () => {
    const ash = data.monsters['Aesther Ashblade'].level;
    const l0 = ash[0];
    expect(l0.normal).toMatchObject({ health: 8, move: 3, attack: 2, range: 0 });
    expect(l0.elite).toMatchObject({
      health: 12,
      move: 3,
      attack: 3,
      attributes: ['Poison']
    });
    const l3 = ash[3];
    expect(l3.elite.attributes).toEqual(
      expect.arrayContaining(['Poison', 'Attackers gain Disadvantage'])
    );
  });

  it('matches verified boss health expressions from cards', () => {
    expect(data.bosses['Human Commander'].level[0].health).toBe('6xC');
    expect(data.bosses['Human Commander'].level[7].health).toBe('20xC');
    expect(data.bosses['Manifestation of Corruption'].level[0].health).toBe('22xC');
    expect(data.bosses['Manifestation of Corruption'].level[7].health).toBe('65xC');
    expect(data.bosses['Valrath Commander'].level[0].health).toBe('10xC');
    expect(data.bosses['Valrath Commander'].level[7].health).toBe('33xC');
  });

  it('applies FC boss immunities at every level', () => {
    const expected = {
      'Human Commander': ['Stun', 'Poison', 'Disarm', 'Immobilize', 'Wound', 'Curse'],
      'Valrath Commander': ['Stun', 'Muddle', 'Disarm', 'Immobilize', 'Wound', 'Curse'],
      'Manifestation of Corruption': [
        'Muddle',
        'Disarm',
        'Wound',
        'Poison',
        'Immobilize',
        'Stun',
        'Curse'
      ]
    };

    for (const [name, immunities] of Object.entries(expected)) {
      for (const block of data.bosses[name].level) {
        expect(block.immunities, `${name} L${block.level}`).toEqual(immunities);
      }
    }
  });
});
