import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'jose';
import { quoteLine, type DesignConfig } from '../src/catalog';
import { isValidDesign } from './worker';

export type QuoteEnv = {
  FIREBASE_PROJECT_ID?: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
  ENABLE_DEMO_QUOTE_PERSISTENCE?: string;
  QUOTE_RATE_LIMITER?: { limit: (config: { key: string }) => Promise<{ success: boolean }> };
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
};
export type SavedQuote = {
  id: string; ownerUid: string; requestHash: string; status: 'REQUESTED_DEMO';
  catalogVersion: string; createdAt: string;
  lines: ReturnType<typeof quoteLine>[]; totalCents: number;
};
export type QuoteDependencies = {
  verifyToken: (token: string, project: string) => Promise<string>;
  store: (env: QuoteEnv, uid: string, id: string, quote: SavedQuote) =>
    Promise<{ kind: 'created' | 'replay' | 'conflict'; quote?: SavedQuote }>;
  list: (env: QuoteEnv, uid: string) => Promise<SavedQuote[]>;
  remove: (env: QuoteEnv, uid: string, id: string) => Promise<boolean>;
};
const json = (status: number, value: unknown) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' },
});
const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const VALID_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_PROJECT = /^[a-z][a-z0-9-]{4,62}$/;
const VALID_UID = /^[a-zA-Z0-9_-]{2,128}$/;
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';

/** Firebase ID token check, with injectable trusted key source for cryptographic tests. */
export async function verifyFirebaseIdToken(
  token: string, project: string, trustedKeys: Parameters<typeof jwtVerify>[1] = keys,
): Promise<string> {
  const { payload } = await jwtVerify(token, trustedKeys, {
    audience: project, issuer: 'https://securetoken.google.com/' + project,
    algorithms: ['RS256'], maxTokenAge: '1 hour',
  });
  const provider = payload.firebase && typeof payload.firebase === 'object'
    ? (payload.firebase as { sign_in_provider?: unknown }).sign_in_provider : undefined;
  if (typeof payload.sub !== 'string' || !VALID_UID.test(payload.sub) || payload.sub.length > 128
      || provider === 'anonymous') throw new Error('INVALID_IDENTITY');
  return payload.sub;
}
async function serviceToken(env: QuoteEnv): Promise<string> {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
  const pem = (env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  if (!email || !pem.includes('PRIVATE KEY')) throw new Error('SERVICE_NOT_CONFIGURED');
  const key = await importPKCS8(pem, 'RS256');
  const token = await new SignJWT({ scope: 'https://www.googleapis.com/auth/datastore' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' }).setIssuer(email)
    .setAudience(GOOGLE_TOKEN).setIssuedAt().setExpirationTime('1h').sign(key);
  const result = await fetch(GOOGLE_TOKEN, { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: token }),
  });
  if (!result.ok) throw new Error('SERVICE_OAUTH_UNAVAILABLE');
  const payload = await result.json() as { access_token?: unknown };
  if (typeof payload.access_token !== 'string') throw new Error('SERVICE_OAUTH_UNAVAILABLE');
  return payload.access_token;
}
function docURL(project: string, uid: string, id?: string): string {
  const prefix = 'https://firestore.googleapis.com/v1/projects/' + project +
    '/databases/(default)/documents/users/' + uid + '/quotes';
  return id ? prefix + '/' + id : prefix;
}
function decodeFirestoreQuote(doc: unknown): SavedQuote | null {
  if (!doc || typeof doc !== 'object') return null;
  const fields = (doc as { fields?: Record<string, { stringValue?: string }> }).fields;
  if (!fields || typeof fields.payload?.stringValue !== 'string') return null;
  try {
    const parsed = JSON.parse(fields.payload.stringValue) as SavedQuote;
    if (!parsed || parsed.status !== 'REQUESTED_DEMO' || typeof parsed.ownerUid !== 'string'
        || typeof parsed.requestHash !== 'string') return null;
    return parsed;
  } catch { return null; }
}
async function persistQuote(env: QuoteEnv, uid: string, id: string, quote: SavedQuote):
  Promise<{ kind: 'created' | 'replay' | 'conflict'; quote?: SavedQuote }> {
  const project = env.FIREBASE_PROJECT_ID!;
  const token = await serviceToken(env);
  const baseHeaders = { Authorization: 'Bearer ' + token };
  const result = await fetch(docURL(project, uid) + '?documentId=' + id, {
    method: 'POST', headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: {
      ownerUid: { stringValue: uid },
      requestHash: { stringValue: quote.requestHash },
      payload: { stringValue: JSON.stringify(quote) },
    } }),
  });
  if (result.ok) return { kind: 'created', quote };
  if (result.status !== 409) throw new Error('FIRESTORE_WRITE_FAILED');
  const existing = await fetch(docURL(project, uid, id), { headers: baseHeaders });
  if (!existing.ok) throw new Error('FIRESTORE_REPLAY_READ_FAILED');
  const old = decodeFirestoreQuote(await existing.json());
  if (!old || old.ownerUid !== uid || old.requestHash !== quote.requestHash) return { kind: 'conflict' };
  return { kind: 'replay', quote: old };
}
async function listQuotes(env: QuoteEnv, uid: string): Promise<SavedQuote[]> {
  const token = await serviceToken(env);
  const endpoint = docURL(env.FIREBASE_PROJECT_ID!, uid) + '?pageSize=30';
  const result = await fetch(endpoint, { headers: { Authorization: 'Bearer ' + token } });
  if (!result.ok) throw new Error('FIRESTORE_LIST_FAILED');
  const data = await result.json() as { documents?: unknown[] };
  return (Array.isArray(data.documents) ? data.documents : []).map(decodeFirestoreQuote)
    .filter((x): x is SavedQuote => x !== null && x.ownerUid === uid)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
}
async function removeQuote(env: QuoteEnv, uid: string, id: string): Promise<boolean> {
  const token = await serviceToken(env);
  const result = await fetch(docURL(env.FIREBASE_PROJECT_ID!, uid, id), {
    method: 'DELETE', headers: { Authorization: 'Bearer ' + token },
  });
  if (result.status === 404) return false; // Idempotent delete: already removed.
  if (!result.ok) throw new Error('FIRESTORE_DELETE_FAILED');
  return true;
}
const liveDeps: QuoteDependencies = { verifyToken: verifyFirebaseIdToken, store: persistQuote, list: listQuotes, remove: removeQuote };
async function readJsonLimited(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  if (reader) for (;;) {
    const next = await reader.read(); if (next.done) break;
    size += next.value.byteLength;
    if (size > 16384) { await reader.cancel(); throw new Error('TOO_LARGE'); }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}
async function sha256(raw: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Idempotent, server-priced demonstration quote requests; strictly no payment/dispatch. */
export async function handlePrivateQuotes(
  request: Request, env: QuoteEnv = {}, deps: QuoteDependencies = liveDeps,
): Promise<Response> {
  const path = new URL(request.url).pathname;
  const base = '/api/private/quotes';
  const suffix = path.startsWith(base + '/') ? path.slice(base.length + 1) : null;
  if (suffix !== null && (!VALID_ID.test(suffix) || request.method !== 'DELETE')) return json(404, { error: 'NOT_FOUND' });
  if (suffix === null && request.method !== 'GET' && request.method !== 'POST')
    return json(405, { error: 'METHOD_NOT_ALLOWED' });
  if (env.ENABLE_DEMO_QUOTE_PERSISTENCE !== 'true' || !env.FIREBASE_PROJECT_ID
      || !VALID_PROJECT.test(env.FIREBASE_PROJECT_ID)
      || !env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      || !env.QUOTE_RATE_LIMITER) {
    return json(503, { error: 'QUOTES_NOT_CONFIGURED' });
  }
  const auth = request.headers.get('authorization') ?? '';
  const match = /^Bearer ([A-Za-z0-9_.-]{100,5000})$/.exec(auth);
  if (!match) return json(401, { error: 'AUTH_REQUIRED' });
  let uid: string;
  try { uid = await deps.verifyToken(match[1], env.FIREBASE_PROJECT_ID); }
  catch { return json(401, { error: 'INVALID_ID_TOKEN' }); }
  if (!VALID_UID.test(uid)) return json(401, { error: 'INVALID_ID_TOKEN' });
  const quota = await env.QUOTE_RATE_LIMITER.limit({ key: uid });
  if (!quota.success) return json(429, { error: 'RATE_LIMITED' });
  try {
    if (suffix !== null) {
      const removed = await deps.remove(env, uid, suffix);
      return json(200, { deleted: removed, kind: 'DEMONSTRATION_ONLY',
        disclaimer: 'Somente o registro desta conta pode ser excluído.' });
    }
    if (request.method === 'GET') return json(200, { quotes: await deps.list(env, uid), kind: 'DEMONSTRATION_ONLY' });
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return json(415, { error: 'UNSUPPORTED_MEDIA_TYPE' });
    }
    const id = request.headers.get('idempotency-key') ?? '';
    if (!VALID_ID.test(id)) return json(400, { error: 'IDEMPOTENCY_KEY_REQUIRED' });
    let input: unknown;
    try { input = await readJsonLimited(request); }
    catch (error) { return json(error instanceof Error && error.message === 'TOO_LARGE' ? 413 : 400, { error: 'INVALID_JSON' }); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return json(400, { error: 'INVALID_BODY' });
    const data = input as Record<string, unknown>;
    if (Object.keys(data).length !== 1 || !Array.isArray(data.items) || data.items.length < 1 || data.items.length > 12 ||
        !data.items.every(isValidDesign)) return json(400, { error: 'INVALID_ITEMS' });
    const lines = (data.items as DesignConfig[]).map(quoteLine);
    const hash = await sha256(JSON.stringify(lines.map(x => x.config)));
    const quote: SavedQuote = {
      id, ownerUid: uid, requestHash: hash, status: 'REQUESTED_DEMO',
      catalogVersion: lines[0].catalogVersion, createdAt: new Date().toISOString(),
      lines, totalCents: lines.reduce((sum, x) => sum + x.totalCents, 0),
    };
    const result = await deps.store(env, uid, id, quote);
    if (result.kind === 'conflict') return json(409, { error: 'IDEMPOTENCY_CONFLICT' });
    return json(result.kind === 'created' ? 201 : 200, {
      quote: result.quote, replay: result.kind === 'replay', kind: 'DEMONSTRATION_ONLY',
      disclaimer: 'Solicitação guardada em ambiente de demonstração; não é enviada a fornecedores nem paga.',
    });
  } catch {
    // Deliberately no raw upstream data or tokens in client-facing errors.
    return json(503, { error: 'QUOTE_SERVICE_TEMPORARILY_UNAVAILABLE' });
  }
}
