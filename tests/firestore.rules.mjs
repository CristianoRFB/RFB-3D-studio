import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, query, limit, serverTimestamp,
} from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-rfb-studio-tests',
  firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
});
let checks = 0;
const succeed = async p => { await assertSucceeds(p); checks++; };
const fail = async p => { await assertFails(p); checks++; };
const validConfig = { version: 2, productId: 'aura', colorId: 'lilas', finishId: 'fosco', sizeId: 'm', addonId: 'nenhum', quantity: 1 };
const validDesign = (ownerUid, config = validConfig) => ({
  ownerUid, schemaVersion: 2, title: 'Teste', config, revision: 1,
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
});
try {
  await env.clearFirestore();
  const a = env.authenticatedContext('alice');
  const b = env.authenticatedContext('bob');
  const anonymous = env.unauthenticatedContext();
  const owner = doc(a.firestore(), 'users', 'alice', 'designs', 'design_test_001');
  const notOwner = doc(b.firestore(), 'users', 'alice', 'designs', 'design_test_001');
  await succeed(setDoc(owner, validDesign('alice')));
  await succeed(getDoc(owner));
  await fail(getDoc(notOwner));
  await fail(getDoc(doc(anonymous.firestore(), 'users', 'alice', 'designs', 'design_test_001')));
  await succeed(getDocs(query(collection(a.firestore(), 'users', 'alice', 'designs'), limit(30))));
  await fail(getDocs(query(collection(b.firestore(), 'users', 'alice', 'designs'), limit(30))));
  await fail(getDocs(query(collection(a.firestore(), 'users', 'alice', 'designs'), limit(100))));
  await fail(setDoc(doc(b.firestore(), 'users', 'alice', 'designs', 'injected_1'), validDesign('alice')));
  await fail(setDoc(doc(a.firestore(), 'users', 'alice', 'designs', 'forged_owner'), validDesign('bob')));
  await fail(setDoc(doc(a.firestore(), 'users', 'alice', 'designs', 'forged_role'), { ...validDesign('alice'), role: 'admin' }));
  await fail(setDoc(doc(a.firestore(), 'users', 'alice', 'designs', 'invalid_finish'), validDesign('alice', { ...validConfig, productId: 'nexo', finishId: 'metalico' })));
  await fail(setDoc(doc(a.firestore(), 'users', 'alice', 'designs', 'invalid_qty'), validDesign('alice', { ...validConfig, quantity: -9 })));
  await fail(setDoc(doc(a.firestore(), 'users', 'alice', 'designs', 'invalid_addon'), validDesign('alice', { ...validConfig, addonId: 'base' })));
  await succeed(updateDoc(owner, { title: 'Atualizado', revision: 2, updatedAt: serverTimestamp() }));
  await fail(updateDoc(owner, { title: 'Sem revisão', updatedAt: serverTimestamp() }));
  await fail(updateDoc(owner, { ownerUid: 'bob', revision: 3, updatedAt: serverTimestamp() }));
  await fail(updateDoc(owner, { revision: 999, updatedAt: serverTimestamp() }));
  await fail(updateDoc(owner, { createdAt: serverTimestamp(), revision: 3, updatedAt: serverTimestamp() }));
  await fail(setDoc(doc(a.firestore(), 'users', 'alice', 'quotes', 'quote_1'), { totalCents: 10 }));
  await fail(setDoc(doc(a.firestore(), 'products', 'aura'), { price: 1 }));
  await fail(deleteDoc(notOwner));
  await succeed(deleteDoc(owner));
  await succeed(setDoc(doc(b.firestore(), 'users', 'bob', 'designs', 'own_bob_1'), validDesign('bob')));
  const count = (await getDocs(query(collection(b.firestore(), 'users', 'bob', 'designs'), limit(30)))).size;
  assert.equal(count, 1);
  checks++;
  process.stdout.write('Firestore Rules PASS: ' + checks + ' authorization/schema checks on isolated emulator.\n');
} finally {
  await env.cleanup();
}
