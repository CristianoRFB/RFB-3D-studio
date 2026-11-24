import { describe, it, expect } from 'vitest';
import { INITIAL_DESIGN } from '../src/catalog';
import { createQuote, addCart, EMPTY_WORKSPACE } from '../src/records';
import { quoteSummaryText } from '../src/quote-summary';

describe('RFB quote manual summary', () => {
  it('is self-contained, explicitly non-commercial, and never triggers external IO', () => {
    const cart = addCart(EMPTY_WORKSPACE(), INITIAL_DESIGN, '2026-11-24T00:00:00.000Z', 'cart-test');
    const quote = createQuote(cart, '2026-11-24T00:00:00.000Z', 'quote-test').quotes[0];
    const content = quoteSummaryText(quote);
    expect(content).toContain('SEM VALIDADE COMERCIAL');
    expect(content).toContain('TOTAL ILUSTRATIVO: R$ 91,00');
    expect(content).toContain('Garrafa Aura');
    expect(content).toContain('envio é exclusivamente manual');
    expect(content).not.toContain('undefined');
  });
});
