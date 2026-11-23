import { useEffect, useState } from 'react';
import { type User } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { PRODUCTS, type ProductId } from '../catalog';
import { listModels, readStaffIdentity, removeModel, saveModel,
  type ModelRecord, type StaffIdentity } from './models';

export default function ModelManager({ user, db }: { user: User; db: Firestore }) {
  const [identity,setIdentity] = useState<StaffIdentity | null>(null);
  const [models,setModels] = useState<ModelRecord[]>([]);
  const [key,setKey] = useState<ProductId>('aura');
  const [title,setTitle] = useState('Garrafa Aura');
  const [status,setStatus] = useState<'draft'|'published'>('draft');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  useEffect(()=>{
    let alive=true;
    void readStaffIdentity(user).then(next=>{if(alive)setIdentity(next)})
      .catch(()=>{if(alive)setIdentity({role:'cliente',tenantId:null})});
    return ()=>{alive=false};
  },[user]);
  useEffect(()=>{
    if(!identity?.tenantId) return;
    let alive=true;
    void listModels(db,identity.tenantId).then(next=>{if(alive)setModels(next)})
      .catch(()=>{if(alive)setMessage('Não foi possível carregar os modelos deste tenant.')});
    return ()=>{alive=false};
  },[db,identity]);
  async function refresh() {
    if(!identity?.tenantId)return;
    setModels(await listModels(db,identity.tenantId));
  }
  async function save() {
    if(!identity?.tenantId||busy)return;
    setBusy(true);setMessage('');
    try{
      const old=models.find(x=>x.id===key);
      await saveModel({db,tenantId:identity.tenantId,uid:user.uid,modelKey:key,title,status,expectedRevision:old?.revision});
      await refresh();setMessage('Metadados do modelo salvos com controle de revisão.');
    }catch{setMessage('Não foi possível salvar. Permissão negada, rede indisponível ou conflito.');}
    finally{setBusy(false);}
  }
  async function remove(item:ModelRecord) {
    if(!identity?.tenantId||busy)return;
    setBusy(true);setMessage('');
    try{await removeModel(db,identity.tenantId,item.id);await refresh();setMessage('Modelo removido do catálogo do tenant.');}
    catch{setMessage('Não foi possível excluir. Confira seu cargo e a propriedade.');}
    finally{setBusy(false);}
  }
  if(!identity)return <p role="status">Conferindo permissões de modelo...</p>;
  if(!identity.tenantId)return <p className="helper">O painel de modelos exige perfil de Designer, Vendedor ou Administrador atribuído pelo servidor. Nenhuma permissão é derivada de seleção na interface.</p>;
  const canEdit=identity.role==='designer'||identity.role==='admin';
  return <section className="models-manager" aria-label="Gestão de modelos de tenant">
    <h3>Biblioteca do tenant</h3>
    <p className="helper">Perfil confirmado: {identity.role}. Tenant: {identity.tenantId}. Apenas metadados de três geometrias autorais locais; uploads e modelos licenciados externos continuam indisponíveis.</p>
    {canEdit&&<div className="group">
      <label className="form-label" htmlFor="model-key">Modelo procedural</label>
      <select id="model-key" value={key} onChange={e=>{
        const id=e.target.value as ProductId;
        setKey(id);const item=models.find(x=>x.id===id);
        setTitle(item?.title??PRODUCTS.find(p=>p.id===id)?.name??'Modelo');
        setStatus(item?.status??'draft');
      }}>
        {PRODUCTS.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}
      </select>
      <label className="form-label" htmlFor="model-title">Nome</label>
      <input id="model-title" value={title} maxLength={60} onChange={e=>setTitle(e.target.value)}/>
      <label className="form-label" htmlFor="model-status">Estado</label>
      <select id="model-status" value={status} onChange={e=>setStatus(e.target.value as 'draft'|'published')}>
        <option value="draft">Rascunho</option>
        <option value="published">Publicado (metadados)</option>
      </select>
      <button type="button" disabled={busy} onClick={()=>void save()}>Salvar metadados</button>
    </div>}
    <div className="record-grid">{models.map(item=><article className="record-card record-body" key={item.id}>
      <h3>{item.title}</h3><p>{item.modelKey} · {item.status} · revisão {item.revision}</p>
      {canEdit&&<div className="record-actions">
        <button type="button" className="secondary" disabled={busy} onClick={()=>{
          setKey(item.id);setTitle(item.title);setStatus(item.status);
        }}>Editar</button>
        {(identity.role==='admin'||item.ownerUid===user.uid)&&
        <button type="button" className="secondary" disabled={busy} onClick={()=>void remove(item)}>Excluir</button>}
      </div>}
    </article>)}</div>
    {models.length===0&&<div className="empty-state">Nenhum metadado de modelo cadastrado para este tenant.</div>}
    {message&&<p role="status" className="feedback">{message}</p>}
  </section>;
}
