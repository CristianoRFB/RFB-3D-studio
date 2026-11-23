import { describe, expect, it } from 'vitest';
import { inspectGLB, MAX_GLB_BYTES } from '../src/glb';
function minimalGLB(json: object) {
  const content = new TextEncoder().encode(JSON.stringify(json));
  const size = Math.ceil(content.length / 4) * 4;
  const bytes = new Uint8Array(20 + size);
  bytes.fill(32, 20);
  bytes.set(content, 20);
  const data = new DataView(bytes.buffer);
  data.setUint32(0, 0x46546c67, true); data.setUint32(4, 2, true); data.setUint32(8, bytes.length, true);
  data.setUint32(12, size, true); data.setUint32(16, 0x4e4f534a, true);
  return bytes.buffer;
}
describe('validação de GLB local', () => {
  const valid = { asset: { version: '2.0' }, meshes: [{ primitives: [] }] };
  it('aceita somente glTF 2.0 com geometria', () => {
    expect(inspectGLB(minimalGLB(valid)).meshCount).toBe(1);
    expect(() => inspectGLB(new ArrayBuffer(0))).toThrow();
    expect(() => inspectGLB(new ArrayBuffer(MAX_GLB_BYTES + 1))).toThrow();
    expect(() => inspectGLB(minimalGLB({ asset: { version: '1.0' }, meshes: [] }))).toThrow();
  });
  it('bloqueia referências externas e extensões obrigatórias', () => {
    expect(() => inspectGLB(minimalGLB({ ...valid, images: [{ uri: 'https://evil.test/tracker' }] }))).toThrow(/externas/);
    expect(() => inspectGLB(minimalGLB({ ...valid, extensionsRequired: ['KHR_draco_mesh_compression'] }))).toThrow(/Extensões/);
  });
});
