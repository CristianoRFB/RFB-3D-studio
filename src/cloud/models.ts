import { type User } from 'firebase/auth';
import {
  collection, deleteDoc, doc, getDocs, limit, orderBy, query, runTransaction,
  serverTimestamp, type Firestore,
} from 'firebase/firestore';
import { PRODUCTS, type ProductId } from '../catalog';

export type StaffRole = 'cliente' | 'designer' | 'vendedor' | 'admin';
export type StaffIdentity = { role: StaffRole; tenantId: string | null };
export type ModelRecord = {
  id: ProductId; title: string; ownerUid: string;
  revision: number; status: 'draft'|'published'; modelKey: ProductId;
};
const validTenant = (id: string) => /^[a-zA-Z0-9_-]{3,60}$/.test(id);
export async function readStaffIdentity(user: User): Promise<StaffIdentity> {
  const { claims } = await user.getIdTokenResult();
  const role = claims.role;
  const tenantId = claims.tenantId;
  if (!['designer','vendedor','admin'].includes(String(role)) ||
    typeof tenantId !== 'string' || !validTenant(tenantId)) return { role: 'cliente', tenantId: null };
  return { role: role as StaffRole, tenantId };
}
function modelDoc(db: Firestore, tenantId: string, key: ProductId) {
  if (!validTenant(tenantId) || !PRODUCTS.some(p=>p.id===key)) throw new Error('Modelo inválido');
  return doc(db,'tenants',tenantId,'models',key);
}
export async function listModels(db: Firestore, tenantId: string): Promise<ModelRecord[]> {
  if (!validTenant(tenantId)) throw new Error('Tenant inválido');
  const snapshot = await getDocs(query(collection(db,'tenants',tenantId,'models'),orderBy('updatedAt','desc'),limit(30)));
  return snapshot.docs.flatMap(record => {
    const data = record.data();
    if (!PRODUCTS.some(p=>p.id===record.id)) return [];
    return [{
      id: record.id as ProductId, modelKey: record.id as ProductId,
      title: typeof data.title === 'string' ? data.title.slice(0,60) : 'Modelo',
      ownerUid: typeof data.ownerUid === 'string' ? data.ownerUid : '',
      revision: Number.isInteger(data.revision) ? data.revision as number : 1,
      status: data.status === 'published' ? 'published' as const : 'draft' as const,
    }];
  });
}
export async function saveModel(args: {
  db: Firestore; tenantId: string; uid: string; modelKey: ProductId;
  title: string; status: 'draft'|'published'; expectedRevision?: number;
}): Promise<void> {
  const { db, tenantId, uid, modelKey, status, expectedRevision } = args;
  if (!validTenant(tenantId) || !uid || !['draft','published'].includes(status)) throw new Error('Permissão inválida');
  const title = args.title.trim().slice(0,60);
  if (!title) throw new Error('Título obrigatório');
  await runTransaction(db,async transaction=>{
    const target=modelDoc(db,tenantId,modelKey);
    const snapshot=await transaction.get(target);
    if (snapshot.exists()) {
      const revision=snapshot.data().revision;
      if (expectedRevision!==revision || !Number.isInteger(revision)) throw new Error('CONFLICT');
      transaction.update(target,{title,status,revision:revision+1,updatedAt:serverTimestamp()});
    } else {
      if (expectedRevision!==undefined) throw new Error('CONFLICT');
      transaction.set(target,{
        schemaVersion:1,tenantId,ownerUid:uid,modelKey,title,license:'ORIGINAL',
        status,revision:1,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),
      });
    }
  });
}
export async function removeModel(db: Firestore, tenantId: string, key: ProductId) {
  await deleteDoc(modelDoc(db,tenantId,key));
}
