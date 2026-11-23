import { describe, expect, it } from 'vitest';
import handler from '../server/worker';
import { INITIAL_DESIGN, CATALOG_VERSION } from '../src/catalog';

function req(body: unknown, headers: Record<string,string> = { 'content-type': 'application/json' }): Request {
  return new Request('https://rfb.example/api/demo-quote', { method: 'POST', headers, body: JSON.stringify(body) });
}
describe('Cloudflare Worker: cotação demonstrativa sem efeitos externos', () => {
  it('aceita configs válidas e computa preços no servidor sem confiar no cliente', async () => {
    const res = await handler.fetch(req({ items: [{ ...INITIAL_DESIGN, quantity: 2 }] }));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const data = await res.json() as { mode: string; catalogVersion: string; totalCents: number };
    expect(data.mode).toBe('DEMONSTRATION_ONLY');
    expect(data.catalogVersion).toBe(CATALOG_VERSION);
    expect(data.totalCents).toBe(18200);
  });
  it('recusa preço forjado, variantes incompatíveis, linhas demais e JSON inválido', async () => {
    expect((await handler.fetch(req({items:[{ ...INITIAL_DESIGN, totalCents: -1 }]}))).status).toBe(400);
    expect((await handler.fetch(req({items:[{ ...INITIAL_DESIGN, productId: 'nexo', finishId: 'metalico' }]}))).status).toBe(400);
    expect((await handler.fetch(req({items:Array.from({length:13},()=>INITIAL_DESIGN)}))).status).toBe(400);
    const malformed = new Request('https://rfb.example/api/demo-quote', { method:'POST',headers:{'content-type':'application/json'},body:'{' });
    expect((await handler.fetch(malformed)).status).toBe(400);
  });
  it('restringe métodos, mídia e tamanho de corpo', async () => {
    expect((await handler.fetch(new Request('https://rfb.example/api/demo-quote'))).status).toBe(405);
    expect((await handler.fetch(req({items:[INITIAL_DESIGN]}, {'content-type':'text/plain'}))).status).toBe(415);
    const oversized = new Request('https://rfb.example/api/demo-quote', {method:'POST',headers:{'content-type':'application/json'},body:'a'.repeat(16400)});
    expect((await handler.fetch(oversized)).status).toBe(413);
    expect((await handler.fetch(new Request('https://rfb.example/api/health'))).status).toBe(200);
  });
});
