import { describe, it, expect } from 'vitest';
import { CONDITIONS, IMMUNITY_MAP } from './constants.js';

describe('Constants', () => {
  describe('CONDITIONS', () => {
    it('should export an array of condition names', () => {
      expect(CONDITIONS).toBeInstanceOf(Array);
      expect(CONDITIONS.length).toBeGreaterThan(0);
    });

    it('should contain expected condition types', () => {
      const expectedConditions = [
        'strengthened',
        'muddled',
        'poisoned',
        'wounded',
        'stunned',
        'immobilized',
        'disarmed'
      ];

      expectedConditions.forEach((condition) => {
        expect(CONDITIONS).toContain(condition);
      });
    });

    it('should have all conditions as strings', () => {
      CONDITIONS.forEach((condition) => {
        expect(typeof condition).toBe('string');
      });
    });
  });

  describe('IMMUNITY_MAP', () => {
    it('should export an object mapping conditions to immunity names', () => {
      expect(IMMUNITY_MAP).toBeInstanceOf(Object);
      expect(Object.keys(IMMUNITY_MAP).length).toBeGreaterThan(0);
    });

    it('should contain expected immunity mappings', () => {
      const expectedMappings = {
        muddled: 'muddle',
        poisoned: 'poison',
        wounded: 'wound',
        stunned: 'stun',
        immobilized: 'immobilize',
        disarmed: 'disarm'
      };

      Object.entries(expectedMappings).forEach(([condition, immunity]) => {
        expect(IMMUNITY_MAP[condition]).toBe(immunity);
      });
    });

    it('should not contain mapping for strengthened', () => {
      expect(IMMUNITY_MAP.strengthened).toBeUndefined();
    });

    it('should have all values as strings', () => {
      Object.values(IMMUNITY_MAP).forEach((immunity) => {
        expect(typeof immunity).toBe('string');
      });
    });
  });

  describe('Integration', () => {
    it('should have most conditions represented in immunity map', () => {
      const conditionsWithoutImmunity = CONDITIONS.filter((condition) => !IMMUNITY_MAP[condition]);

      // Only 'strengthened' should not have an immunity counterpart
      expect(conditionsWithoutImmunity).toEqual(['strengthened']);
    });
  });
});
