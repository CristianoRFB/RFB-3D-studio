import { INITIAL_DESIGN, normalizeDesign, quoteLine, type DesignConfig, type QuoteLine } from './catalog';

export const STORE_KEY = 'rfbstudio:workspace:v2';
export type SavedDesign = { id: string; label: string; config: DesignConfig; updatedAt: string };
export type CartItem = { id: string; config: DesignConfig; addedAt: string };
export type DemoQuote = {
  id: string; createdAt: string; status: 'DEMONSTRATIVO';
  catalogVersion: string; lines: QuoteLine[]; totalCents: number;
};
export type Workspace = { version: 2; designs: SavedDesign[]; cart: CartItem[]; quotes: DemoQuote[] };
export const EMPTY_WORKSPACE = (): Workspace => ({ version: 2, designs: [], cart: [], quotes: [] });
const safeId = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{3,80}$/.test(value);
const safeDate = (value: unknown): string => typeof value === 'string' && /^20\d\d-\d\d-\d\dT/.test(value) ? value.slice(0, 35) : '';
const safeName = (value: unknown): string => typeof value === 'string' ? value.trim().slice(0, 60) : '';

/** Every hydrated demo quote is recalculated, never trusted from browser storage. */
export function normalizeWorkspace(input: unknown): Workspace {
  const output = EMPTY_WORKSPACE();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return output;
  const data = input as Record<string, unknown>;
  if (data.version !== 2) return output;
  if (Array.isArray(data.designs)) {
    output.designs = data.designs.slice(0, 30).filter(x => x && typeof x === 'object' && safeId(x.id))
      .map(x => ({ id: x.id as string, label: safeName(x.label) || 'Meu design', config: normalizeDesign(x.config), updatedAt: safeDate(x.updatedAt) }));
  }
  if (Array.isArray(data.cart)) {
    output.cart = data.cart.slice(0, 30).filter(x => x && typeof x === 'object' && safeId(x.id))
      .map(x => ({ id: x.id as string, config: normalizeDesign(x.config), addedAt: safeDate(x.addedAt) }));
  }
  if (Array.isArray(data.quotes)) {
    output.quotes = data.quotes.slice(0, 30).filter(x => x && typeof x === 'object' && safeId(x.id) && Array.isArray(x.lines))
      .map(x => {
        const lines = (x.lines as unknown[]).slice(0, 30).map(item => quoteLine(normalizeDesign(item && typeof item === 'object' ? (item as { config?: unknown }).config : null)));
        return { id: x.id as string, createdAt: safeDate(x.createdAt), status: 'DEMONSTRATIVO' as const,
          catalogVersion: lines[0]?.catalogVersion ?? 'demo-2026-11-22-v1',
          lines, totalCents: lines.reduce((sum, item) => sum + item.totalCents, 0) };
      });
  }
  return output;
}
export function readWorkspace(raw: string | null): Workspace {
  if (!raw || raw.length > 200000) return EMPTY_WORKSPACE();
  try { return normalizeWorkspace(JSON.parse(raw) as unknown); }
  catch { return EMPTY_WORKSPACE(); }
}
export function encodeWorkspace(ws: Workspace): string { return JSON.stringify(normalizeWorkspace(ws)); }
export function createId(): string {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') throw new Error('UUID criptográfico não disponível');
  return crypto.randomUUID();
}
export function saveDesign(ws: Workspace, config: DesignConfig, label: string, now: string, id: string): Workspace {
  if (!safeId(id)) throw new Error('ID inválido');
  const saved = { id, label: safeName(label) || 'Meu design', config: normalizeDesign(config), updatedAt: now };
  return { ...ws, designs: [saved, ...ws.designs.filter(x => x.id !== id)].slice(0, 30) };
}
export function addCart(ws: Workspace, config: DesignConfig, now: string, id: string): Workspace {
  if (!safeId(id)) throw new Error('ID inválido');
  return { ...ws, cart: [{ id, config: normalizeDesign(config), addedAt: now }, ...ws.cart].slice(0, 30) };
}
export function createQuote(ws: Workspace, now: string, id: string): Workspace {
  if (!safeId(id) || ws.cart.length === 0) throw new Error('O carrinho está vazio');
  const lines = ws.cart.map(entry => quoteLine(entry.config));
  const snapshot: DemoQuote = { id, createdAt: now, status: 'DEMONSTRATIVO', catalogVersion: lines[0].catalogVersion,
    lines, totalCents: lines.reduce((sum, line) => sum + line.totalCents, 0) };
  return { ...ws, cart: [], quotes: [snapshot, ...ws.quotes].slice(0, 30) };
}
export function restoreLocalDesign(raw: string | null): DesignConfig {
  if (!raw || raw.length > 2048) return { ...INITIAL_DESIGN };
  try { return normalizeDesign(JSON.parse(raw) as unknown); }
  catch { return { ...INITIAL_DESIGN }; }
}
