import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  doc, getDoc, getDocs, runTransaction, deleteDoc, collection, query, limit, type Firestore,
} from 'firebase/firestore';
import { INITIAL_DESIGN } from '../src/catalog';
import { handlePrivateQuotes, type QuoteDependencies, type QuoteEnv, type SavedQuote } from '../server/private-quotes';

const key = 'ab2d1881-bd85-4359-8c14-bdf4601933e7';
const endpoint = 'https://example.test/api/private/quotes';
const secretEnv: QuoteEnv = {
  FIREBASE_PROJECT_ID: 'demo-rfb-studio-tests',
  ENABLE_DEMO_QUOTE_PERSISTENCE: 'true',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'emulator@demo.invalid',
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: 'emulator-no-real-secret',
  QUOTE_RATE_LIMITER: { limit: async () => ({ success: true }) },
};
let env: RulesTestEnvironment;
function storedQuote(uid: string, id: string, data: SavedQuote) {
  return { ownerUid: uid, requestHash: data.requestHash, payload: JSON.stringify(data) };
}
function ref(db: Firestore, uid: string, id: string) {
  return doc(db, 'users', uid, 'quotes', id);
}
const dependencies: QuoteDependencies = {
  verifyToken: async token => {
    if (token === 'a'.repeat(120)) return 'alice';
    if (token === 'b'.repeat(120)) return 'bob';
    throw new Error('INVALID_TOKEN');
  },
  store: async (_config, uid, id, data) =>
    env.withSecurityRulesDisabled(async ctx => runTransaction(ctx.firestore(), async tx => {
      const target = ref(ctx.firestore(), uid, id);
      const old = await tx.get(target);
      if (old.exists()) {
        const oldData = old.data();
        if (oldData?.requestHash === data.requestHash)
          return { kind: 'replay' as const, quote: JSON.parse(oldData.payload as string) as SavedQuote };
        return { kind: 'conflict' as const };
      }
      tx.set(target, storedQuote(uid, id, data));
      return { kind: 'created' as const, quote: data };
    })),
  list: async (_config, uid) =>
    env.withSecurityRulesDisabled(async ctx => {
      const rows = await getDocs(query(collection(ctx.firestore(), 'users', uid, 'quotes'), limit(30)));
      return rows.docs.map(s => JSON.parse(s.data().payload as string) as SavedQuote);
    }),
  remove: async (_config, uid, id) =>
    env.withSecurityRulesDisabled(async ctx => {
      const target = ref(ctx.firestore(), uid, id);
      if (!(await getDoc(target)).exists()) return false;
      await deleteDoc(target);
      return true;
    }),
};
function request(uid: 'alice' | 'bob', method = 'POST', id = key, quantity = 1) {
  const token = uid === 'alice' ? 'a'.repeat(120) : 'b'.repeat(120);
  return new Request(endpoint + (method === 'DELETE' ? '/' + id : ''), {
    method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
      'Idempotency-Key': id },
    body: method === 'POST' ? JSON.stringify({ items: [{ ...INITIAL_DESIGN, quantity }] }) : undefined,
  });
}
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rfb-studio-tests',
    firestore: { host: '127.0.0.1', port: 8080,
      rules: readFileSync('firestore.rules', 'utf8') },
  });
  await env.clearFirestore();
});
afterAll(async () => { await env?.cleanup(); });
describe('quote HTTP API + real Firestore Emulator persistence', () => {
  it('creates, replays and rejects changed payload with same UUID without double writing', async () => {
    const first = await handlePrivateQuotes(request('alice'), secretEnv, dependencies);
    expect(first.status).toBe(201);
    const firstBody = await first.json() as { quote: SavedQuote };
    expect(firstBody.quote.ownerUid).toBe('alice');
    expect(firstBody.quote.totalCents).toBe(9100);
    const duplicate = await handlePrivateQuotes(request('alice'), secretEnv, dependencies);
    expect(duplicate.status).toBe(200);
    expect((await duplicate.json() as { replay: boolean }).replay).toBe(true);
    const changed = await handlePrivateQuotes(request('alice', 'POST', key, 2), secretEnv, dependencies);
    expect(changed.status).toBe(409);
    const own = await env.authenticatedContext('alice').firestore();
    const foreign = await env.authenticatedContext('bob').firestore();
    expect((await getDoc(ref(own, 'alice', key))).exists()).toBe(true);
    await assertFails(getDoc(ref(foreign, 'alice', key)));
    await assertFails(deleteDoc(ref(own, 'alice', key)));
  });
  it('separates account documents even for the same UUID, owner reads and deletes only own quotes', async () => {
    expect((await handlePrivateQuotes(request('bob'), secretEnv, dependencies)).status).toBe(201);
    const alice = await handlePrivateQuotes(request('alice', 'GET'), secretEnv, dependencies);
    const bob = await handlePrivateQuotes(request('bob', 'GET'), secretEnv, dependencies);
    expect((await alice.json() as { quotes: SavedQuote[] }).quotes.map(q => q.ownerUid)).toEqual(['alice']);
    expect((await bob.json() as { quotes: SavedQuote[] }).quotes.map(q => q.ownerUid)).toEqual(['bob']);
    await assertFails(getDoc(ref(env.unauthenticatedContext().firestore(), 'users-other', key)));
    expect((await handlePrivateQuotes(request('alice', 'DELETE'), secretEnv, dependencies)).status).toBe(200);
    expect((await getDoc(ref(env.authenticatedContext('bob').firestore(), 'bob', key))).exists()).toBe(true);
    expect((await handlePrivateQuotes(request('alice', 'DELETE'), secretEnv, dependencies)).status).toBe(200);
    expect((await handlePrivateQuotes(request('bob', 'DELETE'), secretEnv, dependencies)).status).toBe(200);
  });
});
