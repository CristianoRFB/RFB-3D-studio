import { describe, expect, it } from 'vitest';
import { INITIAL_DESIGN } from '../src/catalog';
import { generateKeyPair, SignJWT } from 'jose';
import { handlePrivateQuotes, verifyFirebaseIdToken,
  type SavedQuote, type QuoteDependencies, type QuoteEnv } from '../server/private-quotes';

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
    remove: async (_e, uid, key) => storage.delete(uid + ':' + key),
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
  it('fails closed if the rate limiter is unavailable, without writing any quote', async () => {
    const { deps, storage } = stubDeps();
    const response = await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }), {
      ...env, QUOTE_RATE_LIMITER: { limit: async () => { throw new Error('private infrastructure failure'); } },
    }, deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'QUOTE_SERVICE_TEMPORARILY_UNAVAILABLE' });
    expect(storage.size).toBe(0);
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

describe('quote deletion + signed JWT verification', () => {
  it('deletes only the verified owner quote, is repeatable, and rejects invalid paths', async () => {
    const { deps, storage } = stubDeps();
    expect((await handlePrivateQuotes(post({ items: [INITIAL_DESIGN] }), env, deps)).status).toBe(201);
    const del = (bearer = token, key = id) => new Request(baseURL + '/' + key, {
      method: 'DELETE', headers: { authorization: 'Bearer ' + bearer },
    });
    expect((await handlePrivateQuotes(del('not-allowed'.repeat(12)), env, deps)).status).toBe(401);
    expect((await handlePrivateQuotes(del(token, 'not-valid'), env, deps)).status).toBe(404);
    const remove = await handlePrivateQuotes(del(), env, deps);
    expect(remove.status).toBe(200);
    expect((await remove.json() as { deleted: boolean }).deleted).toBe(true);
    expect(storage.size).toBe(0);
    const repeated = await handlePrivateQuotes(del(), env, deps);
    expect((await repeated.json() as { deleted: boolean }).deleted).toBe(false);
  });
  it('checks a real RS256 signature, audience, issuer, lifetime, and disallows anonymous', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const project = 'demo-rfb-studio-tests';
    const issue = async (sub: string, issuer: string, audience: string, provider = 'password') =>
      new SignJWT({ sub, firebase: { sign_in_provider: provider } })
        .setProtectedHeader({ alg: 'RS256' }).setIssuer(issuer)
        .setAudience(audience).setIssuedAt().setExpirationTime('45m').sign(privateKey);
    const issuer = 'https://securetoken.google.com/' + project;
    const valid = await issue('alice', issuer, project);
    expect(await verifyFirebaseIdToken(valid, project, publicKey)).toBe('alice');
    await expect(verifyFirebaseIdToken(valid, 'other-project', publicKey)).rejects.toThrow();
    await expect(verifyFirebaseIdToken(await issue('alice', 'https://invalid.invalid/', project), project, publicKey)).rejects.toThrow();
    await expect(verifyFirebaseIdToken(await issue('alice', issuer, 'other-project'), project, publicKey)).rejects.toThrow();
    await expect(verifyFirebaseIdToken(await issue('alice', issuer, project, 'anonymous'), project, publicKey)).rejects.toThrow('INVALID_IDENTITY');
    const unrelated = await generateKeyPair('RS256');
    await expect(verifyFirebaseIdToken(valid, project, unrelated.publicKey)).rejects.toThrow();
  });
});
