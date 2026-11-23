import { describe, expect, it } from 'vitest';
import { INITIAL_DESIGN } from '../src/catalog';
import { handlePrivateQuotes, type SavedQuote, type QuoteDependencies, type QuoteEnv } from '../server/private-quotes';

const token = 'x'.repeat(128);
const baseURL = 'https://test.invalid/api/private/quotes';
const id = 'b07fca2f-e57f-4fd1-83b0-d2e2d3b97277';
const env: QuoteEnv = {
  ENABLE_DEMO_QUOTE_PERSISTENCE: 'true', FIREBASE_PROJECT_ID: 'demo-rfb-studio-tests',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'not-real@example.invalid',
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 'test-only-private-key',
  QUOTE_RATE_LIMITER: { limit: async () => ({ success: true }) },
};
function post(body: unknown, key = id, bearer = token, contentType = 'application/json') {
  return new Request(baseURL, {
    method: 'POST', headers: { authorization: 'Bearer ' + bearer, 'idempotency-key': key, 'content-type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
function stubDeps() {
  const storage = new Map<string,SavedQuote>();
  const deps: QuoteDependencies = {
    verifyToken: async bearer => {
      if (bearer !== token) throw new Error('Unauthenticated');
      return 'alice';
    },
    store: async (_e, uid, key, quote) => {
      const k = uid + ':' + key;
      const prior = storage.get(k);
      if (prior && prior.requestHash !== quote.requestHash) return { kind: 'conflict' };
      if (prior) return { kind: 'replay', quote: prior };
      storage.set(k, quote); return { kind: 'created', quote };
    },
    list: async (_e, uid) => [...storage.values()].filter(q => q.ownerUid === uid),
  };
  return { deps, storage };
}
describe('authenticated demonstration quote contract (mocked external IO)', () => {
  it('fails closed without server config, auth or rate limiter', async () => {
    const { deps } = stubDeps();
    expect((await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }), {}, deps)).status).toBe(503);
    expect((await handlePrivateQuotes(new Request(baseURL), env, deps)).status).toBe(401);
    expect((await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }, id, 'bad'.repeat(50)), env, deps)).status).toBe(401);
    expect((await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }), { ...env, QUOTE_RATE_LIMITER: { limit: async()=>({success:false}) } }, deps)).status).toBe(429);
  });
  it('uses verified UID, recalculates prices and preserves idempotency', async () => {
    const { deps, storage } = stubDeps();
    const first = await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }), env, deps);
    expect(first.status).toBe(201);
    const body = await first.json() as { quote: SavedQuote; replay: boolean; kind: string };
    expect(body.quote.ownerUid).toBe('alice');
    expect(body.quote.totalCents).toBe(9100);
    expect(body.kind).toBe('DEMONSTRATION_ONLY');
    expect(storage.size).toBe(1);
    const second = await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }), env, deps);
    expect(second.status).toBe(200);
    expect((await second.json() as { replay: boolean }).replay).toBe(true);
    expect(storage.size).toBe(1);
    const mismatch = await handlePrivateQuotes(post({ items: [{ ...INITIAL_DESIGN, quantity: 2 }] }), env, deps);
    expect(mismatch.status).toBe(409);
    const listed = await handlePrivateQuotes(new Request(baseURL, { headers: { authorization: 'Bearer ' + token } }), env, deps);
    expect(listed.status).toBe(200);
    expect((await listed.json() as { quotes: SavedQuote[] }).quotes).toHaveLength(1);
  });
  it('rejects forged totals, invalid variants, malformed JSON, IDs and unsupported methods', async () => {
    const { deps } = stubDeps();
    expect((await handlePrivateQuotes(post({ items: [{ ...INITIAL_DESIGN, totalCents: 1 }] }), env, deps)).status).toBe(400);
    expect((await handlePrivateQuotes(post({ items: [{ ...INITIAL_DESIGN, productId: 'nexo', finishId: 'metalico' }] }), env, deps)).status).toBe(400);
    expect((await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }, 'not-uuid'), env, deps)).status).toBe(400);
    expect((await handlePrivateQuotes(post('{'), env, deps)).status).toBe(400);
    expect((await handlePrivateQuotes(post('a'.repeat(20000)), env, deps)).status).toBe(413);
    expect((await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }, id, token, 'text/plain'), env, deps)).status).toBe(415);
    expect((await handlePrivateQuotes(new Request(baseURL, { method: 'DELETE' }), env, deps)).status).toBe(405);
  });
});
