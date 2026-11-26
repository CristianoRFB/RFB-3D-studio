import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PREVIEW_ORIGIN = 'https://rfb-studio-preview.on7.workers.dev';
const required = ['API_KEY','AUTH_DOMAIN','PROJECT_ID','APP_ID'].map(k => 'VITE_FIREBASE_' + k);

// Only environment metadata is reported, never credential values.
export function validateEnvironment(env, mode = 'demo') {
  const errors = [];
  const filled = required.filter(k => String(env[k] ?? '').trim());
  if (Object.keys(env).some(k => k.startsWith('VITE_') && /PRIVATE_KEY|SERVICE_ACCOUNT|SECRET|PASSWORD|ACCESS_TOKEN/i.test(k))) errors.push('CLIENT_SECRET_VARIABLE');
  if (env.VITE_USE_FIREBASE_EMULATORS === 'true') errors.push('EMULATORS_FORBIDDEN_IN_PREVIEW');
  if (env.VITE_ENABLE_QUOTE_REQUESTS === 'true' || env.ENABLE_DEMO_QUOTE_PERSISTENCE === 'true') errors.push('QUOTE_PERSISTENCE_MUST_STAY_DISABLED');
  if (mode === 'demo' && filled.length) errors.push('DEMO_MUST_NOT_CONNECT_FIREBASE');
  if (mode === 'firebase') {
    if (filled.length !== required.length) errors.push('FIREBASE_CONFIG_INCOMPLETE');
    const id = String(env.VITE_FIREBASE_PROJECT_ID ?? '');
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(id) || id.startsWith('demo-')) errors.push('INVALID_LIVE_PROJECT');
    if (id !== env.RFB_STUDIO_APPROVED_FIREBASE_PROJECT) errors.push('PROJECT_NOT_EXPLICITLY_APPROVED');
    if (env.VITE_FIREBASE_AUTH_DOMAIN !== id + '.firebaseapp.com') errors.push('AUTH_DOMAIN_PROJECT_MISMATCH');
    if (!/^1:\d+:web:[a-f0-9]+$/i.test(String(env.VITE_FIREBASE_APP_ID ?? ''))) errors.push('INVALID_WEB_APP_ID');
  }
  return errors;
}

export async function verifyBuild(directory = 'dist') {
  const html = await readFile(resolve(directory, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["'](\/assets\/[^"']+\.js)["']/g)].map(m => m[1]);
  assert.ok(scripts.length > 0, 'Missing Vite entry assets');
  for (const path of scripts) {
    assert.match(path, /^\/assets\/[\w.-]+\.js$/);
    assert.ok((await stat(resolve(directory, '.' + path))).isFile(), 'Missing entry asset');
  }
  return scripts.length;
}

// No bearer token, real account, remote persistence or customer data is used.
export async function smokePreview(origin, request = fetch) {
  assert.equal(origin, PREVIEW_ORIGIN, 'Only the isolated Studio preview is permitted');
  async function check(path, status, options = {}) {
    const response = await request(origin + path, { ...options, redirect: 'error', signal: AbortSignal.timeout(12000) });
    assert.equal(response.status, status, path + ': unexpected status');
    if (path.startsWith('/api/')) {
      assert.match(response.headers.get('content-type') ?? '', /application\/json/i);
      assert.match(response.headers.get('cache-control') ?? '', /no-store/i);
      return response.json();
    }
    assert.match(response.headers.get('content-type') ?? '', /text\/html/i);
    return response.text();
  }
  const home = await check('/', 200);
  assert.match(home, /RFB\s*Studio/i);
  const health = await check('/api/health', 200);
  assert.equal(health.service, 'rfb-studio-demo');
  assert.equal(health.status, 'ok');
  const disabled = await check('/api/private/quotes', 503);
  assert.equal(disabled.error, 'QUOTES_NOT_CONFIGURED');
  const missing = await check('/api/infra-smoke-not-found', 404);
  assert.equal(missing.error, 'NOT_FOUND');
  const demo = await check('/api/demo-quote', 200, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({items:[{version:2,productId:'aura',colorId:'lilas',finishId:'fosco',sizeId:'m',addonId:'nenhum',quantity:1}]}) });
  assert.equal(demo.mode, 'DEMONSTRATION_ONLY');
  assert.equal(demo.totalCents, 9100);
  assert.equal(demo.catalogVersion, health.catalogVersion);
  return 5;
}

export async function selfTest() {
  assert.deepEqual(validateEnvironment({}), []);
  assert.ok(validateEnvironment({VITE_FIREBASE_API_KEY:'test'}).includes('DEMO_MUST_NOT_CONNECT_FIREBASE'));
  assert.ok(validateEnvironment({VITE_USE_FIREBASE_EMULATORS:'true'}).includes('EMULATORS_FORBIDDEN_IN_PREVIEW'));
  assert.ok(validateEnvironment({VITE_SERVICE_ACCOUNT_PRIVATE_KEY:'fixture'}).includes('CLIENT_SECRET_VARIABLE'));
  assert.ok(validateEnvironment({ENABLE_DEMO_QUOTE_PERSISTENCE:'true'}).includes('QUOTE_PERSISTENCE_MUST_STAY_DISABLED'));
  const env = { VITE_FIREBASE_API_KEY:'fixture', VITE_FIREBASE_AUTH_DOMAIN:'rfb-studio-qa.firebaseapp.com', VITE_FIREBASE_PROJECT_ID:'rfb-studio-qa', VITE_FIREBASE_APP_ID:'1:123:web:abcd', RFB_STUDIO_APPROVED_FIREBASE_PROJECT:'rfb-studio-qa' };
  assert.deepEqual(validateEnvironment(env,'firebase'), []);
  assert.ok(validateEnvironment({...env,RFB_STUDIO_APPROVED_FIREBASE_PROJECT:'other-project'},'firebase').includes('PROJECT_NOT_EXPLICITLY_APPROVED'));
  assert.ok(validateEnvironment({...env,VITE_FIREBASE_AUTH_DOMAIN:'other-project.firebaseapp.com'},'firebase').includes('AUTH_DOMAIN_PROJECT_MISMATCH'));
  assert.ok(validateEnvironment({},'firebase').includes('FIREBASE_CONFIG_INCOMPLETE'));
  const fake = async url => {
    const path = new URL(url).pathname;
    if (path === '/') return new Response('<title>RFB Studio</title>',{headers:{'content-type':'text/html'}});
    const values = {'/api/health':[200,{service:'rfb-studio-demo',status:'ok',catalogVersion:'fixture'}],'/api/private/quotes':[503,{error:'QUOTES_NOT_CONFIGURED'}],'/api/infra-smoke-not-found':[404,{error:'NOT_FOUND'}],'/api/demo-quote':[200,{mode:'DEMONSTRATION_ONLY',totalCents:9100,catalogVersion:'fixture'}]};
    const [status, body] = values[path];
    return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  };
  assert.equal(await smokePreview(PREVIEW_ORIGIN,fake),5);
  await assert.rejects(smokePreview('https://other.invalid',fake));
  await assert.rejects(smokePreview(PREVIEW_ORIGIN,async()=>new Response('bad',{status:500})));
}
async function main() {
  const mode = process.argv[2];
  if (mode === '--self-test') { await selfTest(); console.log('PASS: infrastructure preflight self-tests (synthetic, no network)'); return; }
  if (mode === '--smoke') { console.log('PASS: preview smoke checks:', await smokePreview(process.argv[3])); return; }
  if (mode !== '--demo' && mode !== '--firebase') throw new Error('Use --self-test, --demo, --firebase or --smoke <approved-preview-origin>');
  const errors = validateEnvironment(process.env,mode.slice(2));
  if (errors.length) throw new Error(errors.join(', '));
  const n = await verifyBuild();
  console.log('PASS: deployment preflight; entry assets:', n, '(not a deployment or cost approval)');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error=>{ console.error('FAIL:',error.message); process.exitCode=1; });
