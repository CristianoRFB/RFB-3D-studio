/** An original triangle geometry GLB 2.0 buffer; no external resources or third-party assets. */
export function createTriangleGLB(): Uint8Array {
  const geometry = {
    asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [{ byteLength: 44 }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 6, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 0], min: [-1, -1, 0] },
      { bufferView: 1, componentType: 5123, count: 3, type: 'SCALAR', max: [2], min: [0] },
    ],
  };
  const raw = new TextEncoder().encode(JSON.stringify(geometry));
  const length = (raw.length + 3) & ~3;
  const bytes = new Uint8Array(12 + 8 + length + 8 + 44);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, bytes.length, true);
  view.setUint32(12, length, true); view.setUint32(16, 0x4e4f534a, true);
  bytes.fill(32, 20, 20 + length); bytes.set(raw, 20);
  const offset = 20 + length;
  view.setUint32(offset, 44, true); view.setUint32(offset + 4, 0x004e4942, true);
  const vertices = [-1, -1, 0, 1, -1, 0, 0, 1, 0];
  vertices.forEach((n, i) => view.setFloat32(offset + 8 + i * 4, n, true));
  [0, 1, 2].forEach((n, i) => view.setUint16(offset + 8 + 36 + i * 2, n, true));
  return bytes;
}
