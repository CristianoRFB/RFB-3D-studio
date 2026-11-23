import type { DesignConfig } from './catalog';

/** Curated original presets. These are visual demos, not real products or pricing offers. */
export const PRESETS: ReadonlyArray<{ id: string; title: string; description: string; config: DesignConfig }> = [
  { id: 'aura-lilas', title: 'Aura Lilás', description: 'Garrafa com acabamento fosco e toque minimalista.',
    config: { version: 2, productId: 'aura', colorId: 'lilas', finishId: 'fosco', sizeId: 'm', addonId: 'nenhum', quantity: 1 } },
  { id: 'aura-metal', title: 'Aura Metal', description: 'Acabamento metálico e alça, pensado para a rotina.',
    config: { version: 2, productId: 'aura', colorId: 'grafite', finishId: 'metalico', sizeId: 'g', addonId: 'alca', quantity: 1 } },
  { id: 'orbita-coral', title: 'Órbita Coral', description: 'Luminária original em cor quente e base estendida.',
    config: { version: 2, productId: 'orbita', colorId: 'coral', finishId: 'fosco', sizeId: 'm', addonId: 'base', quantity: 1 } },
  { id: 'orbita-azul', title: 'Órbita Azul', description: 'Modelo conceitual com acabamento metálico.',
    config: { version: 2, productId: 'orbita', colorId: 'azul', finishId: 'metalico', sizeId: 'p', addonId: 'nenhum', quantity: 1 } },
  { id: 'nexo-lilas', title: 'Nexo Lilás', description: 'Vaso alto com suporte removível conceitual.',
    config: { version: 2, productId: 'nexo', colorId: 'lilas', finishId: 'fosco', sizeId: 'g', addonId: 'suporte', quantity: 1 } },
  { id: 'nexo-grafite', title: 'Nexo Grafite', description: 'Vaso minimalista fosco em tamanho pequeno.',
    config: { version: 2, productId: 'nexo', colorId: 'grafite', finishId: 'fosco', sizeId: 'p', addonId: 'nenhum', quantity: 1 } },
];
