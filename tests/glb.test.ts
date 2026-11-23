import { describe, expect, it } from 'vitest';
import { inspectGLB, MAX_GLB_BYTES } from '../src/glb';
import { createTriangleGLB } from '../src/fixture-glb';

describe('validação de GLB local', () => {
  it('aceita geometria glTF 2.0 original com posições e índices', () => {
    const triangle = createTriangleGLB();
    expect(inspectGLB(triangle.buffer as ArrayBuffer).meshCount).toBe(1);
  });
  it('rejeita arquivos vazios, excessivos e alterações do cabeçalho', () => {
    expect(() => inspectGLB(new ArrayBuffer(0))).toThrow();
    expect(() => inspectGLB(new ArrayBuffer(MAX_GLB_BYTES + 1))).toThrow();
    const broken = createTriangleGLB(); broken[4] = 1;
    expect(() => inspectGLB(broken.buffer as ArrayBuffer)).toThrow();
  });
  it('rejeita JSON ou chunk binário modificados', () => {
    const broken = createTriangleGLB();
    new DataView(broken.buffer).setUint32(16, 0x12345678, true);
    expect(() => inspectGLB(broken.buffer as ArrayBuffer)).toThrow();
  });
});
