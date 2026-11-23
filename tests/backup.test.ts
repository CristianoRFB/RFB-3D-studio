import { describe, expect, it } from 'vitest';
import { encodeBackup, decodeBackup } from '../src/backup';
import { INITIAL_DESIGN } from '../src/catalog';
import { EMPTY_WORKSPACE, saveDesign, addCart, createQuote } from '../src/records';

describe('backup local RFB Studio — privacidade', () => {
  const now = '2026-11-23T12:00:00.000Z';
  it('exporta e restaura dados normalizados de todas as áreas locais', () => {
    const saved = saveDesign(EMPTY_WORKSPACE(), INITIAL_DESIGN, 'Meu design', now, 'design-test');
    const cart = addCart(saved, INITIAL_DESIGN, now, 'cart-test');
    const completed = createQuote(cart, now, 'quote-test');
    expect(decodeBackup(encodeBackup(INITIAL_DESIGN, completed, now))).toEqual({ design: INITIAL_DESIGN, workspace: completed });
  });
  it('recusa formatos, versões e tamanho excedente sem modificar dados', () => {
    for(const raw of ['{}', '[]', '{bad', 'x'.repeat(200001), '{"schemaVersion":9}']) {
      expect(() => decodeBackup(raw)).toThrow();
    }
  });
  it('não aceita preços arbitrários vindos de backup adulterado', () => {
    const backup = JSON.parse(encodeBackup(INITIAL_DESIGN, EMPTY_WORKSPACE(), now));
    backup.workspace.quotes = [{ id: 'quote-test', createdAt: now, lines: [{ config: INITIAL_DESIGN, totalCents: -9999 }] }];
    const parsed = decodeBackup(JSON.stringify(backup));
    expect(parsed.workspace.quotes[0].totalCents).toBe(9100);
  });
});
