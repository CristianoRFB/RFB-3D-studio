import { describe, expect, it } from 'vitest';
import { INITIAL_DESIGN, CATALOG_VERSION, PRODUCTS, chooseProduct, normalizeDesign, quoteLine } from '../src/catalog';
import { EMPTY_WORKSPACE, addCart, createQuote, encodeWorkspace, normalizeWorkspace, readWorkspace, saveDesign } from '../src/records';

describe('catálogo e precificação determinística', () => {
  it('mantém total em centavos, sem floats de preço', () => {
    const line = quoteLine(INITIAL_DESIGN);
    expect(line.totalCents).toBe((7900 + 1200));
    expect(line.catalogVersion).toBe(CATALOG_VERSION);
    expect(quoteLine({ ...INITIAL_DESIGN, quantity: 10, finishId: 'metalico', addonId: 'alca' }).totalCents).toBe((7900 + 1200 + 1900 + 1200) * 10);
  });
  it('aplica whitelist e regras de compatibilidade', () => {
    const unsafe = normalizeDesign({ ...INITIAL_DESIGN, productId: 'nexo', finishId: 'metalico', addonId: 'alca', sizeId: 'fake', quantity: 999 });
    expect(unsafe).toEqual({ ...INITIAL_DESIGN, productId: 'nexo', finishId: 'fosco', addonId: 'nenhum', sizeId: 'm', quantity: 1 });
    expect(chooseProduct({ ...INITIAL_DESIGN, finishId: 'metalico', addonId: 'alca' }, 'nexo').finishId).toBe('fosco');
    expect(PRODUCTS.length).toBe(3);
  });
  it('não permite cliente injetar preço', () => {
    const bad = { ...INITIAL_DESIGN, priceCents: -1000000, totalCents: 1 };
    expect(quoteLine(bad).unitCents).toBe(9100);
    expect(quoteLine({ ...INITIAL_DESIGN, quantity: Number.POSITIVE_INFINITY }).totalCents).toBe(9100);
  });
});
describe('persistência demonstrativa versionada', () => {
  it('salva/recarrega designs, carrinho e orçamento sem efeitos externos', () => {
    const t = '2026-11-22T13:00:00.000Z';
    const ws = saveDesign(EMPTY_WORKSPACE(), INITIAL_DESIGN, 'Garrafa favorita', t, 'design001');
    const inCart = addCart(ws, { ...INITIAL_DESIGN, quantity: 2 }, t, 'cart001');
    const done = createQuote(inCart, t, 'quote001');
    expect(done.cart).toHaveLength(0);
    expect(done.quotes[0].totalCents).toBe(18200);
    expect(readWorkspace(encodeWorkspace(done))).toEqual(done);
    expect(readWorkspace('{oops')).toEqual(EMPTY_WORKSPACE());
  });
  it('recusa versões desconhecidas e recalcula preços adulterados', () => {
    expect(normalizeWorkspace({ version: 100, designs: [{ id: 'x' }] })).toEqual(EMPTY_WORKSPACE());
    const withFake = {
      version: 2, designs: [], cart: [], quotes: [{ id: 'quote001', createdAt: '', lines: [{ config: INITIAL_DESIGN, totalCents: -999999 }] }]
    };
    expect(normalizeWorkspace(withFake).quotes[0].totalCents).toBe(9100);
  });
});
