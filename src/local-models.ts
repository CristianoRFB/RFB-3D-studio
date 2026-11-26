import { inspectGLB, MAX_GLB_BYTES } from './glb';

export const MAX_LOCAL_MODELS = 6;
export const MAX_LIBRARY_BYTES = 24 * 1024 * 1024;
export type LocalModel = { id: string; name: string; bytes: ArrayBuffer; meshCount: number; savedAt: number };
const DB = 'rfb-studio-local-models-v1';
const STORE = 'models';

export function validateLocalModel(record: LocalModel): LocalModel {
  if (!record || typeof record.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(record.id) ||
      typeof record.name !== 'string' || !record.name.trim() || record.name.length > 70 ||
      !Number.isFinite(record.savedAt) || !(record.bytes instanceof ArrayBuffer) ||
      record.bytes.byteLength > MAX_GLB_BYTES) throw new Error('Registro GLB local inválido');
  const { meshCount } = inspectGLB(record.bytes);
  return { ...record, meshCount };
}
export function ensureCapacity(existing: Pick<LocalModel,'id'|'bytes'>[], record: LocalModel): void {
  const remaining = existing.filter(x => x.id !== record.id);
  if (remaining.length >= MAX_LOCAL_MODELS ||
      remaining.reduce((n,x) => n + x.bytes.byteLength, 0) + record.bytes.byteLength > MAX_LIBRARY_BYTES)
    throw new Error('Biblioteca cheia: até 6 arquivos e 24 MB. Exclua um modelo antes de salvar.');
}
function open(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open(DB,1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE,{keyPath:'id'});
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Armazenamento local indisponível.'));
    request.onblocked = () => reject(new Error('Biblioteca bloqueada por outra aba.'));
  });
}
async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, setResult: (value:T)=>void, fail:(error:Error)=>void)=>void): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve,reject) => {
      const tx = db.transaction(STORE,mode);
      let result: T;
      let failure: Error | undefined;
      const fail = (error: Error) => { failure = error; try { tx.abort(); } catch { reject(error); } };
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure ?? new Error('Não foi possível concluir o armazenamento local.'));
      tx.onerror = () => { /* onabort handles request failure. */ };
      try { operation(tx.objectStore(STORE),value=>{result=value;},fail); }
      catch (error) { fail(error instanceof Error ? error : new Error('Falha na biblioteca local.')); }
    });
  } finally { db.close(); }
}
export async function listLocalModels(): Promise<LocalModel[]> {
  return transaction('readonly',(store,done,fail)=>{
    const request = store.getAll();
    request.onsuccess = () => {
      try { done((request.result as LocalModel[]).map(validateLocalModel).sort((a,b)=>b.savedAt-a.savedAt)); }
      catch (error) { fail(error instanceof Error ? error : new Error('Biblioteca inválida.')); }
    };
  });
}
export async function saveLocalModel(record: LocalModel): Promise<void> {
  const valid = validateLocalModel(record);
  return transaction('readwrite',(store,done,fail)=>{
    const request = store.getAll();
    request.onsuccess = () => {
      try {
        ensureCapacity(request.result as LocalModel[],valid);
        const write = store.put(valid);
        write.onsuccess = () => done(undefined);
      } catch(error) { fail(error instanceof Error ? error : new Error('Falha ao salvar GLB.')); }
    };
  });
}
export function removeLocalModel(id: string): Promise<void> {
  return transaction('readwrite',(store,done)=>{const request=store.delete(id); request.onsuccess=()=>done(undefined);});
}
export function clearLocalModels(): Promise<void> {
  return transaction('readwrite',(store,done)=>{const request=store.clear(); request.onsuccess=()=>done(undefined);});
}
