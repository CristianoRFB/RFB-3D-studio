/**
 * RFB Studio G2 demonstration data. No user accounts, orders or server pricing.
 * Only whitelisted settings are read from localStorage.
 */
export const STUDIO_STORAGE_KEY = 'rfbstudio:demo:v1';
export const COLORS = [
  { id: 'lilas', label: 'Lilás', hex: '#9A76FF' },
  { id: 'azul', label: 'Azul', hex: '#58BCE5' },
  { id: 'coral', label: 'Coral', hex: '#F5857A' },
  { id: 'grafite', label: 'Grafite', hex: '#59657A' },
] as const;
export const FINISHES = [
  { id: 'fosco', label: 'Fosco' },
  { id: 'metalico', label: 'Metálico' },
] as const;

export type ColorId = (typeof COLORS)[number]['id'];
export type FinishId = (typeof FINISHES)[number]['id'];
export type StudioConfig = { version: 1; colorId: ColorId; finishId: FinishId };
export const DEFAULT_CONFIG: StudioConfig = { version: 1, colorId: 'lilas', finishId: 'fosco' };

export function parseStudioConfig(input: unknown): StudioConfig {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ...DEFAULT_CONFIG };
  const candidate = input as Record<string, unknown>;
  if (candidate.version !== 1) return { ...DEFAULT_CONFIG };
  const colorId = COLORS.find(c => c.id === candidate.colorId)?.id ?? DEFAULT_CONFIG.colorId;
  const finishId = FINISHES.find(f => f.id === candidate.finishId)?.id ?? DEFAULT_CONFIG.finishId;
  return { version: 1, colorId, finishId };
}

export function readStudioConfig(raw: string | null): StudioConfig {
  if (!raw || raw.length > 2048) return { ...DEFAULT_CONFIG };
  try { return parseStudioConfig(JSON.parse(raw) as unknown); }
  catch { return { ...DEFAULT_CONFIG }; }
}

export function encodeStudioConfig(input: StudioConfig): string {
  return JSON.stringify(parseStudioConfig(input));
}

export function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}
