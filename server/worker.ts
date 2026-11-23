import { CATALOG_VERSION, PRODUCTS, normalizeDesign, quoteLine, type DesignConfig } from '../src/catalog';

/** Cloudflare-compatible handler. This API calculates DEMO prices only; never creates orders. */
const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const response = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

/** Reject extra fields and invalid options instead of silently turning hostile requests into defaults. */
export function isValidDesign(input: unknown): input is DesignConfig {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  const required = ['version', 'productId', 'colorId', 'finishId', 'sizeId', 'addonId', 'quantity'];
  if (Object.keys(value).length !== required.length || Object.keys(value).some(k => !required.includes(k))) return false;
  if (value.version !== 2 || !PRODUCTS.some(p => p.id === value.productId)) return false;
  if (!Number.isInteger(value.quantity) || (value.quantity as number) < 1 || (value.quantity as number) > 10) return false;
  const safe = normalizeDesign(value);
  return required.every(key => safe[key as keyof DesignConfig] === value[key]);
}
export async function handleRequest(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  if (pathname === '/api/health' && request.method === 'GET') {
    return response(200, { service: 'rfb-studio-demo', status: 'ok', catalogVersion: CATALOG_VERSION });
  }
  if (pathname !== '/api/demo-quote') return response(404, { error: 'NOT_FOUND' });
  if (request.method !== 'POST') return response(405, { error: 'METHOD_NOT_ALLOWED' });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return response(415, { error: 'UNSUPPORTED_MEDIA_TYPE' });
  // Stream a bounded payload: never buffer an arbitrary request body in a Free Worker.
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  if (reader) {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > 16384) {
        await reader.cancel();
        return response(413, { error: 'PAYLOAD_TOO_LARGE' });
      }
      chunks.push(next.value);
    }
  }
  const payload = new Uint8Array(bytes);
  let cursor = 0;
  for (const chunk of chunks) { payload.set(chunk, cursor); cursor += chunk.byteLength; }
  const raw = new TextDecoder().decode(payload);
  let input: unknown;
  try { input = JSON.parse(raw) as unknown; }
  catch { return response(400, { error: 'MALFORMED_JSON' }); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return response(400, { error: 'INVALID_BODY' });
  const data = input as Record<string, unknown>;
  if (Object.keys(data).length !== 1 || !Array.isArray(data.items) || data.items.length < 1 || data.items.length > 12) {
    return response(400, { error: 'INVALID_ITEMS' });
  }
  if (!data.items.every(isValidDesign)) return response(400, { error: 'INVALID_CONFIGURATION' });
  const lines = (data.items as DesignConfig[]).map(quoteLine);
  return response(200, { mode: 'DEMONSTRATION_ONLY', catalogVersion: CATALOG_VERSION, lines,
    totalCents: lines.reduce((sum, line) => sum + line.totalCents, 0),
    disclaimer: 'Preços ilustrativos sem validade comercial; sem pedidos, pagamentos ou dados pessoais.' });
}
export default { fetch: handleRequest };
