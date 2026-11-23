import { describe, expect, it } from 'vitest';
import { COLORS, DEFAULT_CONFIG, FINISHES, clamp, encodeStudioConfig, parseStudioConfig, readStudioConfig } from '../src/studio';

describe('configuração demonstrativa RFB Studio G2', () => {
  it('usa padrão para JSON ausente, inválido, excedente e versões desconhecidas', () => {
    expect(readStudioConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(readStudioConfig('{invalid')).toEqual(DEFAULT_CONFIG);
    expect(readStudioConfig('x'.repeat(2049))).toEqual(DEFAULT_CONFIG);
    expect(parseStudioConfig({ version: 99, colorId: 'coral' })).toEqual(DEFAULT_CONFIG);
  });
  it('aceita somente cores e acabamentos permitidos', () => {
    expect(parseStudioConfig({ version: 1, colorId: 'coral', finishId: 'metalico' }))
      .toEqual({ version: 1, colorId: 'coral', finishId: 'metalico' });
    expect(parseStudioConfig({ version: 1, colorId: '#fff;evil', finishId: 'admin' })).toEqual(DEFAULT_CONFIG);
    expect(parseStudioConfig(['coral'])).toEqual(DEFAULT_CONFIG);
  });
  it('codifica e recupera configuração após recarregar a página', () => {
    for (const color of COLORS) for (const finish of FINISHES) {
      const config = { version: 1 as const, colorId: color.id, finishId: finish.id };
      expect(readStudioConfig(encodeStudioConfig(config))).toEqual(config);
    }
  });
  it('impede zoom inválido ou fora dos limites', () => {
    expect(clamp(Infinity, .65, 1.6)).toBe(.65);
    expect(clamp(5, .65, 1.6)).toBe(1.6);
    expect(clamp(-5, .65, 1.6)).toBe(.65);
    expect(clamp(1.1, .65, 1.6)).toBe(1.1);
  });
});
