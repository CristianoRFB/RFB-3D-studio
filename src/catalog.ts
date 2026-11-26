import { COLORS, FINISHES, type ColorId, type FinishId } from './studio';

/** Public, synthetic catalog. NEVER use client totals as a payment or production quote authority. */
export const CATALOG_VERSION = 'demo-2026-11-22-v1';
export const PRODUCTS = [
  { id: 'aura', name: 'Garrafa Aura', category: 'Acessórios', description: 'Garrafa customizável, modelo procedural autoral.', baseCents: 7900,
    finishes: ['fosco', 'metalico'],
    sizes: [{ id: 'p', label: '500 ml', cents: 0, scale: .88 }, { id: 'm', label: '750 ml', cents: 1200, scale: 1 }, { id: 'g', label: '1 L', cents: 2400, scale: 1.12 }],
    addons: [{ id: 'nenhum', label: 'Sem acessório', cents: 0 }, { id: 'alca', label: 'Alça', cents: 1200 }, { id: 'gravacao', label: 'Personalização', cents: 1800 }] },
  { id: 'orbita', name: 'Luminária Órbita', category: 'Decoração', description: 'Luminária conceitual sem sistema elétrico real.', baseCents: 12900,
    finishes: ['fosco', 'metalico'],
    sizes: [{ id: 'p', label: 'Compacta', cents: 0, scale: .86 }, { id: 'm', label: 'Padrão', cents: 2000, scale: 1 }, { id: 'g', label: 'Grande', cents: 3900, scale: 1.16 }],
    addons: [{ id: 'nenhum', label: 'Sem acessório', cents: 0 }, { id: 'base', label: 'Base estendida', cents: 2400 }, { id: 'gravacao', label: 'Personalização', cents: 1800 }] },
  { id: 'nexo', name: 'Vaso Nexo', category: 'Decoração', description: 'Vaso com acabamento visual e forma procedural.', baseCents: 5900,
    finishes: ['fosco'],
    sizes: [{ id: 'p', label: 'Pequeno', cents: 0, scale: .82 }, { id: 'm', label: 'Médio', cents: 1100, scale: 1 }, { id: 'g', label: 'Grande', cents: 2200, scale: 1.18 }],
    addons: [{ id: 'nenhum', label: 'Sem acessório', cents: 0 }, { id: 'suporte', label: 'Suporte', cents: 1900 }, { id: 'gravacao', label: 'Personalização', cents: 1700 }] },
] as const;

export type ProductId = (typeof PRODUCTS)[number]['id'];
export type SizeId = 'p' | 'm' | 'g';
export type AddonId = 'nenhum' | 'alca' | 'base' | 'suporte' | 'gravacao';
export type DesignConfig = {
  version: 2;
  productId: ProductId;
  colorId: ColorId;
  finishId: FinishId;
  sizeId: SizeId;
  addonId: AddonId;
  quantity: number;
};
export const INITIAL_DESIGN: DesignConfig = {
  version: 2, productId: 'aura', colorId: 'lilas', finishId: 'fosco',
  sizeId: 'm', addonId: 'nenhum', quantity: 1,
};
export function getProduct(id: ProductId) { return PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0]; }
export function asProductId(value: unknown): ProductId {
  return PRODUCTS.find(p => p.id === value)?.id ?? INITIAL_DESIGN.productId;
}
export function chooseProduct(current: DesignConfig, value: ProductId): DesignConfig {
  const product = getProduct(value);
  return { ...current, productId: value, finishId: product.finishes.includes(current.finishId as 'fosco' & 'metalico') ? current.finishId : 'fosco',
    sizeId: 'm', addonId: 'nenhum' };
}
export function normalizeDesign(value: unknown): DesignConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...INITIAL_DESIGN };
  const v = value as Record<string, unknown>;
  if (v.version !== 2) return { ...INITIAL_DESIGN };
  const productId = asProductId(v.productId);
  const product = getProduct(productId);
  const colorId = COLORS.find(c => c.id === v.colorId)?.id ?? 'lilas';
  const finishId = FINISHES.find(f => f.id === v.finishId && product.finishes.some(id => id === f.id))?.id ?? 'fosco';
  const sizeId = product.sizes.find(s => s.id === v.sizeId)?.id ?? 'm';
  const addonId = product.addons.find(a => a.id === v.addonId)?.id ?? 'nenhum';
  const quantity = typeof v.quantity === 'number' && Number.isInteger(v.quantity) && v.quantity >= 1 && v.quantity <= 10 ? v.quantity : 1;
  return { version: 2, productId, colorId, finishId, sizeId, addonId, quantity };
}
export function quoteLine(config: DesignConfig) {
  const safe = normalizeDesign(config);
  const product = getProduct(safe.productId);
  const size = product.sizes.find(s => s.id === safe.sizeId) ?? product.sizes[1];
  const addon = product.addons.find(a => a.id === safe.addonId) ?? product.addons[0];
  const finishCents = safe.finishId === 'metalico' ? 1900 : 0;
  const unitCents = product.baseCents + size.cents + addon.cents + finishCents;
  return { config: safe, productName: product.name, sizeLabel: size.label, addonLabel: addon.label,
    unitCents, totalCents: unitCents * safe.quantity, catalogVersion: CATALOG_VERSION };
}
export type QuoteLine = ReturnType<typeof quoteLine>;
export const brl = (cents: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
