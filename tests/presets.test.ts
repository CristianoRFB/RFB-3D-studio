import { describe, expect, it } from 'vitest';
import { PRESETS } from '../src/presets';
import { normalizeDesign, quoteLine } from '../src/catalog';

describe('presets originais', () => {
  it('possuem identificadores únicos, combinações permitidas e totais determinísticos', () => {
    expect(new Set(PRESETS.map(x => x.id)).size).toBe(PRESETS.length);
    expect(PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of PRESETS) {
      expect(normalizeDesign(preset.config)).toEqual(preset.config);
      expect(quoteLine(preset.config).totalCents).toBeGreaterThan(0);
    }
  });
});
