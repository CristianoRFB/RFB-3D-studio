/** Client-only GLB safety gate. Imported models are never uploaded or persisted. */
export const MAX_GLB_BYTES = 8 * 1024 * 1024;
export function inspectGLB(buffer: ArrayBuffer): { meshCount: number } {
  if (buffer.byteLength < 28 || buffer.byteLength > MAX_GLB_BYTES) throw new Error('GLB deve ter até 8 MB');
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== buffer.byteLength) {
    throw new Error('Arquivo não é GLB versão 2 válido');
  }
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a || jsonLength < 2 || jsonLength % 4 !== 0 || jsonLength > buffer.byteLength - 20) {
    throw new Error('Chunk JSON GLB inválido');
  }
  let data: unknown;
  try { data = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength))) as unknown; }
  catch { throw new Error('Metadados GLB inválidos'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Estrutura GLB ausente');
  const root = data as Record<string, unknown>;
  const asset = root.asset as Record<string, unknown> | undefined;
  if (asset?.version !== '2.0' || !Array.isArray(root.meshes) || root.meshes.length < 1 || root.meshes.length > 128) {
    throw new Error('GLB precisa conter geometria glTF 2.0');
  }
  if (!Array.isArray(root.accessors) || !Array.isArray(root.bufferViews) || !Array.isArray(root.buffers) || root.buffers.length < 1) {
    throw new Error('GLB precisa conter accessors, bufferViews e buffers');
  }
  for (const mesh of root.meshes) {
    if (!mesh || typeof mesh !== 'object' || !Array.isArray(mesh.primitives) || mesh.primitives.length < 1) {
      throw new Error('Malha GLB sem primitivas');
    }
    for (const primitive of mesh.primitives) {
      const positionIndex = primitive?.attributes?.POSITION;
      if (!Number.isInteger(positionIndex) || positionIndex < 0 || positionIndex >= root.accessors.length) {
        throw new Error('Malha GLB sem posições válidas');
      }
    }
  }
  if (Array.isArray(root.nodes) && root.nodes.length > 256) throw new Error('Modelo grande demais');
  if (Array.isArray(root.extensionsRequired) && root.extensionsRequired.length > 0) throw new Error('Extensões GLB externas não são suportadas nesta demo');
  for (const group of [root.buffers, root.images]) {
    if (!Array.isArray(group)) continue;
    for (const entry of group) {
      if (!entry || typeof entry !== 'object') continue;
      const uri = (entry as Record<string, unknown>).uri;
      if (typeof uri === 'string' && !uri.startsWith('data:')) throw new Error('Referências externas em GLB são proibidas');
    }
  }
  const jsonEnd = 20 + jsonLength;
  if (jsonEnd + 8 > buffer.byteLength) throw new Error('Chunk binário GLB ausente');
  const binLength = view.getUint32(jsonEnd, true);
  if (view.getUint32(jsonEnd + 4, true) !== 0x004e4942 || binLength < 12 || jsonEnd + 8 + binLength !== buffer.byteLength) {
    throw new Error('Chunk binário GLB inválido');
  }
  return { meshCount: root.meshes.length };
}
