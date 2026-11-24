import type { User } from 'firebase/auth';
import type { DesignConfig } from '../catalog';

export type PrivateQuote = {
  id: string; status: 'REQUESTED_DEMO'; totalCents: number; createdAt: string;
};
export function isPrivateQuoteEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_QUOTE_REQUESTS === 'true';
}
async function callQuote(user: User, method: 'GET' | 'POST', body?: unknown, id?: string): Promise<unknown> {
  if (!isPrivateQuoteEnabled()) throw new Error('QUOTE_DISABLED');
  const headers: Record<string,string> = {
    Authorization: 'Bearer ' + await user.getIdToken(), Accept: 'application/json',
  };
  if (method === 'POST') { headers['content-type'] = 'application/json'; headers['idempotency-key'] = id ?? ''; }
  const response = await fetch('/api/private/quotes', {
    method, headers, body: method === 'POST' ? JSON.stringify(body) : undefined, cache: 'no-store',
  });
  if (!response.ok) throw new Error('QUOTE_UNAVAILABLE_' + response.status);
  return response.json() as Promise<unknown>;
}
export async function requestPrivateQuote(user: User, items: DesignConfig[], id: string) {
  const raw = await callQuote(user, 'POST', { items }, id);
  if (!raw || typeof raw !== 'object' || !('quote' in raw)) throw new Error('INVALID_QUOTE_RESPONSE');
  const result = raw as { quote: PrivateQuote; replay?: boolean };
  return { quote: result.quote, replay: Boolean(result.replay) };
}
export async function listPrivateQuotes(user: User): Promise<PrivateQuote[]> {
  const raw = await callQuote(user, 'GET');
  if (!raw || typeof raw !== 'object' || !('quotes' in raw)) throw new Error('INVALID_QUOTE_RESPONSE');
  const results = (raw as { quotes: unknown }).quotes;
  if (!Array.isArray(results)) throw new Error('INVALID_QUOTE_RESPONSE');
  return results.filter((v): v is PrivateQuote =>
    v !== null && typeof v === 'object' && v.status === 'REQUESTED_DEMO' &&
    typeof v.id === 'string' && typeof v.createdAt === 'string' && Number.isInteger(v.totalCents)).slice(0,30);
}

/** Delete only a quote owned by the Firebase UID in the verified ID token. */
export async function deletePrivateQuote(user: User, id: string): Promise<boolean> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('INVALID_QUOTE_ID');
  }
  if (!isPrivateQuoteEnabled()) throw new Error('QUOTE_DISABLED');
  const response = await fetch('/api/private/quotes/' + id, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + await user.getIdToken() },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('QUOTE_DELETE_UNAVAILABLE_' + response.status);
  const data = await response.json() as { deleted?: unknown };
  return data.deleted === true;
}
