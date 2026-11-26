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

/** Rebuild the original GLB with altered JSON metadata but identical binary geometry. */
function mutateGLB(change: (root: Record<string, any>) => void): ArrayBuffer {
  const original = createTriangleGLB();
  const view = new DataView(original.buffer);
  const jsonLength = view.getUint32(12, true);
  const root = JSON.parse(new TextDecoder().decode(original.slice(20, 20 + jsonLength))) as Record<string, any>;
  change(root);
  const encoded = new TextEncoder().encode(JSON.stringify(root));
  const padded = (encoded.length + 3) & ~3;
  const binaryStart = 20 + jsonLength;
  const binary = original.slice(binaryStart);
  const bytes = new Uint8Array(20 + padded + binary.byteLength);
  const result = new DataView(bytes.buffer);
  result.setUint32(0, 0x46546c67, true); result.setUint32(4, 2, true);
  result.setUint32(8, bytes.byteLength, true);
  result.setUint32(12, padded, true); result.setUint32(16, 0x4e4f534a, true);
  bytes.fill(32, 20, 20 + padded); bytes.set(encoded, 20);
  bytes.set(binary, 20 + padded);
  return bytes.buffer;
}
describe('proteções da prévia GLB contra complexidade e referências inseguras', () => {
  it('recusa vértices declarados acima do limite e bufferView inconsistente', () => {
    expect(() => inspectGLB(mutateGLB(g => {g.accessors[0].count = 9999999}))).toThrow(/vértices|complexa/);
    expect(() => inspectGLB(mutateGLB(g => {g.accessors[0].bufferView = 900}))).toThrow(/buffer/);
  });
  it('recusa explosões de malhas, primitivas, materiais e imagens', () => {
    expect(() => inspectGLB(mutateGLB(g => {g.meshes[0].primitives = Array.from({length:130},()=>g.meshes[0].primitives[0])}))).toThrow();
    expect(() => inspectGLB(mutateGLB(g => {g.materials = Array.from({length:34},()=>({}))}))).toThrow();
    expect(() => inspectGLB(mutateGLB(g => {g.images = Array.from({length:20},()=>({}))}))).toThrow();
  });
  it('recusa nó autocíclico, filhos repetidos ou fora do grafo', () => {
    expect(() => inspectGLB(mutateGLB(g => {g.nodes[0].children = [0]}))).toThrow(/Ciclo/);
    expect(() => inspectGLB(mutateGLB(g => {g.nodes[0].children = [1]}))).toThrow(/Hierarquia/);
    expect(() => inspectGLB(mutateGLB(g => {g.nodes.push({mesh:0});g.nodes[0].children=[1,1]}))).toThrow(/Hierarquia/);
  });
  it('recusa links externos e data-URIs com MIME perigoso', () => {
    expect(() => inspectGLB(mutateGLB(g => {g.buffers[0].uri = 'https://evil.invalid/a.bin'}))).toThrow(/Referências/);
    expect(() => inspectGLB(mutateGLB(g => {g.images = [{uri:'data:text/html;base64,PGgxPg=='}]}))).toThrow(/URI/);
  });
});

describe('limites binários e de instâncias da biblioteca GLB', () => {
  it('rejeita bufferViews fora do arquivo e accessors fora do intervalo', () => {
    expect(() => inspectGLB(mutateGLB(g => {g.bufferViews[0].byteLength=9999}))).toThrow(/buffer/);
    expect(() => inspectGLB(mutateGLB(g => {g.accessors[0].count=100}))).toThrow(/buffer/);
    expect(() => inspectGLB(mutateGLB(g => {g.accessors[1].sparse={count:1}}))).toThrow(/Accessor/);
  });
  it('não permite conteúdo animado ou texturas não homologadas', () => {
    expect(() => inspectGLB(mutateGLB(g => {g.images=[{bufferView:0,mimeType:'image/png'}]}))).toThrow(/geometria estática/);
    expect(() => inspectGLB(mutateGLB(g => {g.extensionsUsed=['KHR_texture_transform']}))).toThrow(/geometria estática/);
  });
});
