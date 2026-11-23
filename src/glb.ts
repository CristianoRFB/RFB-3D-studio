/** Client-only GLB safety gate; files are never uploaded or saved in localStorage. */
export const MAX_GLB_BYTES = 8 * 1024 * 1024;
export function inspectGLB(buffer: ArrayBuffer): { meshCount: number } {
  if (buffer.byteLength < 24 || buffer.byteLength > MAX_GLB_BYTES) throw new Error('GLB deve ter até 8 MB');
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== buffer.byteLength) {
    throw new Error('Arquivo não é GLB versão 2 válido');
  }
  const jsonLength = view.getUint32(12, true);
  const chunkType = view.getUint32(16, true);
  if (chunkType !== 0x4e4f534a || jsonLength < 2 || jsonLength > buffer.byteLength - 20) throw new Error('JSON GLB inválido');
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength))) as unknown;
  } catch { throw new Error('Metadados GLB inválidos'); }
  if (!data || typeof data !== 'object') throw new Error('Estrutura GLB ausente');
  const root = data as Record<string, unknown>;
  const asset = root.asset as Record<string, unknown> | undefined;
  if (asset?.version !== '2.0' || !Array.isArray(root.meshes) || root.meshes.length < 1 || root.meshes.length > 128) {
    throw new Error('GLB precisa conter geometria glTF 2.0');
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
  return { meshCount: root.meshes.length };
}
