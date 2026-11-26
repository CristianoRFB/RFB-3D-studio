/** Client-only GLB safety gate. Models can be explicitly saved locally, never uploaded. */
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
  // GLB byte length alone does not limit decoded GPU memory or malformed scene graphs.
  const limits: Record<string,number> = {
    nodes: 256, accessors: 512, bufferViews: 512, buffers: 8,
    images: 12, textures: 12, materials: 32, animations: 16, skins: 8,
  };
  for (const [name, max] of Object.entries(limits)) {
    const group = root[name];
    if (group !== undefined && (!Array.isArray(group) || group.length > max))
      throw new Error('Limite de complexidade GLB excedido: ' + name);
  }
  let primitives = 0;
  let totalVertices = 0;
  for (const mesh of root.meshes) {
    primitives += mesh?.primitives?.length ?? 0;
    if (primitives > 128) throw new Error('GLB contém primitivas demais para a prévia');
    for (const primitive of mesh?.primitives ?? []) {
      const position = root.accessors[primitive?.attributes?.POSITION];
      const vertexCount = position?.count;
      if (!Number.isInteger(vertexCount) || vertexCount <= 0 ||
          vertexCount > 250000 || !Number.isInteger(position?.bufferView) ||
          position.bufferView < 0 || position.bufferView >= root.bufferViews.length)
        throw new Error('Geometria GLB com quantidade de vértices ou buffer inválidos');
      totalVertices += vertexCount;
      if (totalVertices > 350000) throw new Error('Geometria GLB complexa demais para esta demo');
    }
  }
  if (Array.isArray(root.nodes)) {
    const parents = new Array<number>(root.nodes.length).fill(0);
    const links = root.nodes.map(node => Array.isArray(node?.children) ? node.children : []);
    for (const children of links) for (const child of children) {
      if (!Number.isInteger(child) || child < 0 || child >= links.length || ++parents[child] > 1)
        throw new Error('Hierarquia GLB inválida');
    }
    const state = new Array<number>(links.length).fill(0);
    function walk(id: number): void {
      if (state[id] === 1) throw new Error('Ciclo detectado na hierarquia do GLB');
      if (state[id] === 2) return;
      state[id] = 1;
      for (const child of links[id]) walk(child);
      state[id] = 2;
    }
    for (let i = 0; i < links.length; i++) walk(i);
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
      if (typeof uri === 'string') {
        if (!/^data:(?:application\/octet-stream|image\/(?:png|jpeg|webp));base64,/i.test(uri))
          throw new Error('Referências externas ou formatos URI não suportados em GLB');
      }
    }
  }
  const jsonEnd = 20 + jsonLength;
  if (jsonEnd + 8 > buffer.byteLength) throw new Error('Chunk binário GLB ausente');
  const binLength = view.getUint32(jsonEnd, true);
  if (view.getUint32(jsonEnd + 4, true) !== 0x004e4942 || binLength < 12 || jsonEnd + 8 + binLength !== buffer.byteLength) {
    throw new Error('Chunk binário GLB inválido');
  }
  // Static, embedded geometry subset: bound binary ranges before the loader allocates buffers.
  if (root.buffers.length !== 1 || root.buffers[0]?.uri !== undefined ||
      !Number.isInteger(root.buffers[0]?.byteLength) || root.buffers[0].byteLength < 12 ||
      root.buffers[0].byteLength > binLength || binLength - root.buffers[0].byteLength > 3)
    throw new Error('Buffer GLB embutido inválido');
  const integer = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
  for (const bv of root.bufferViews) {
    const offset = bv?.byteOffset ?? 0;
    if (bv?.buffer !== 0 || !integer(offset) || !integer(bv.byteLength) || bv.byteLength < 1 ||
        offset + bv.byteLength > root.buffers[0].byteLength ||
        (bv.byteStride !== undefined && (!integer(bv.byteStride) || bv.byteStride < 4 || bv.byteStride > 252 || bv.byteStride % 4 !== 0)))
      throw new Error('Intervalo de buffer GLB inválido');
  }
  const widths: Record<number,number> = {5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
  const dimensions: Record<string,number> = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
  for (const acc of root.accessors) {
    const bv = root.bufferViews[acc?.bufferView];
    const width = widths[acc?.componentType] ?? 0;
    const dimension = dimensions[acc?.type] ?? 0;
    const offset = acc?.byteOffset ?? 0;
    const element = width * dimension;
    if (!bv || !element || !integer(acc.count) || acc.count < 1 || acc.count > 1000000 ||
        !integer(offset) || offset % width !== 0 || acc.sparse !== undefined)
      throw new Error('Accessor GLB inválido ou não suportado');
    const stride = bv.byteStride ?? element;
    if (stride < element || offset + (acc.count - 1) * stride + element > bv.byteLength)
      throw new Error('Accessor GLB excede o buffer');
  }
  // Bound repeated mesh instances as well as unique geometry. Reject compressed or
  // image-bearing assets for this geometry-only preview until decoded image budgets exist.
  if ((Array.isArray(root.images) && root.images.length) ||
      (Array.isArray(root.textures) && root.textures.length) ||
      (Array.isArray(root.skins) && root.skins.length) ||
      (Array.isArray(root.animations) && root.animations.length) ||
      (Array.isArray(root.extensionsUsed) && root.extensionsUsed.length))
    throw new Error('Prévia GLB aceita geometria estática sem texturas, animações ou extensões');
  let instanceVertices = 0;
  for (const node of Array.isArray(root.nodes) ? root.nodes : []) {
    if (node?.mesh === undefined) continue;
    if (!integer(node.mesh) || node.mesh >= root.meshes.length) throw new Error('Referência de malha inválida');
    for (const primitive of root.meshes[node.mesh].primitives) {
      instanceVertices += root.accessors[primitive.attributes.POSITION].count;
      if (instanceVertices > 350000) throw new Error('Instâncias GLB excedem o limite de vértices');
    }
  }
  return { meshCount: root.meshes.length };
}
