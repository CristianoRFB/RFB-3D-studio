import {
  collection, deleteDoc, doc, getDocs, limit, orderBy, query, runTransaction,
  serverTimestamp, type Firestore, type Timestamp,
} from 'firebase/firestore';
import { normalizeDesign, type DesignConfig } from '../catalog';

export type RemoteDesign = {
  id: string; title: string; config: DesignConfig; revision: number; updatedAt: string;
};
export class DesignConflict extends Error {
  constructor() { super('Este design foi alterado em outra sessão. Recarregue antes de salvar.'); }
}
const safeTitle = (value: string): string => value.trim().slice(0, 60);
const designRef = (db: Firestore, uid: string, id: string) =>
  doc(db, 'users', uid, 'designs', id);
const validKey = (value: string): boolean => /^[a-zA-Z0-9_-]{3,80}$/.test(value);
const safeUid = (uid: string): boolean => /^[a-zA-Z0-9_-]{2,128}$/.test(uid);

/** Transactions use the authenticated Firebase app and Firestore rules enforce ownership/revisions. */
export async function upsertRemoteDesign(args: {
  db: Firestore; uid: string; id: string; title: string;
  config: DesignConfig; expectedRevision?: number;
}): Promise<void> {
  const { db, uid, id, expectedRevision } = args;
  if (!safeUid(uid) || !validKey(id)) throw new Error('Identificador inválido.');
  const title = safeTitle(args.title);
  if (!title) throw new Error('Informe um nome para o design.');
  const config = normalizeDesign(args.config);
  await runTransaction(db, async transaction => {
    const target = designRef(db, uid, id);
    const snapshot = await transaction.get(target);
    if (snapshot.exists()) {
      const currentRevision = snapshot.data().revision;
      if (!Number.isInteger(currentRevision) || currentRevision !== expectedRevision) throw new DesignConflict();
      transaction.update(target, {
        title, config, revision: currentRevision + 1, updatedAt: serverTimestamp(),
      });
    } else {
      if (expectedRevision !== undefined) throw new DesignConflict();
      transaction.set(target, {
        ownerUid: uid, schemaVersion: 2, title, config, revision: 1,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
    }
  });
}

export async function listRemoteDesigns(db: Firestore, uid: string): Promise<RemoteDesign[]> {
  if (!safeUid(uid)) throw new Error('Identificador inválido.');
  const result = await getDocs(query(collection(db, 'users', uid, 'designs'), orderBy('updatedAt', 'desc'), limit(30)));
  return result.docs.map(record => {
    const value = record.data();
    const ts = value.updatedAt as Timestamp | undefined;
    return {
      id: record.id, title: typeof value.title === 'string' ? value.title.slice(0, 60) : 'Design',
      config: normalizeDesign(value.config),
      revision: Number.isInteger(value.revision) ? value.revision as number : 1,
      updatedAt: ts && typeof ts.toDate === 'function' ? ts.toDate().toISOString() : '',
    };
  });
}

export async function deleteRemoteDesign(db: Firestore, uid: string, id: string): Promise<void> {
  if (!safeUid(uid) || !validKey(id)) throw new Error('Identificador inválido.');
  await deleteDoc(designRef(db, uid, id));
}
