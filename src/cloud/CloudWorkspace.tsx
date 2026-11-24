import { lazy, Suspense, useEffect, useRef, useState } from 'react';
const ModelManager = lazy(() => import('./ModelManager'));
import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail,
  signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth';
import { type DesignConfig, brl, quoteLine } from '../catalog';
import { type CartItem } from '../records';
import { deletePrivateQuote, isPrivateQuoteEnabled, listPrivateQuotes, requestPrivateQuote, type PrivateQuote } from './quotes';
import { createId } from '../records';
import { cloudServices } from './firebase';
import { deleteRemoteDesign, DesignConflict, listRemoteDesigns, upsertRemoteDesign, type RemoteDesign } from './designs';

export default function CloudWorkspace({ design, onLoad, cart }: {
  design: DesignConfig;
  onLoad: (config: DesignConfig) => void;
  cart: CartItem[];
}) {
  const services = cloudServices();
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(Boolean(services));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('Meu design');
  const [items, setItems] = useState<RemoteDesign[]>([]);
  const [selected, setSelected] = useState<RemoteDesign | null>(null);
  const [pending, setPending] = useState(false);
  const [remoteQuotes, setRemoteQuotes] = useState<PrivateQuote[]>([]);
  const pendingQuoteId = useRef<string | null>(null);
  useEffect(() => { pendingQuoteId.current = null; }, [cart]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!services) return;
    return onAuthStateChanged(services.auth, next => {
      setUser(next); setSessionLoading(false);
      setItems([]); setSelected(null); setStatus('');
    }, () => { setSessionLoading(false); setStatus('Não foi possível confirmar a sessão.'); });
  }, [services]);

  const refresh = async (uid: string) => {
    if (!services) return;
    setItems(await listRemoteDesigns(services.db, uid));
  };
  useEffect(() => {
    if (!user) return;
    let active = true;
    void listRemoteDesigns(services!.db, user.uid)
      .then(next => { if (active) setItems(next); })
      .catch(() => { if (active) setStatus('Não foi possível carregar seus designs. Verifique rede e permissões.'); });
    return () => { active = false; };
  }, [services, user]);

  if (!services) return <section className="content-card" aria-label="Conta e sincronização em nuvem">
    <div className="section-head"><h2>Conta e sincronização</h2><span className="viewer-tag">NÃO CONFIGURADA</span></div>
    <p className="helper">O aplicativo ainda não possui um projeto Firebase autorizado. O estúdio local continua disponível sem login. Não existe sincronização remota neste ambiente.</p>
    <p className="disclaimer">Para habilitar, configure um Firebase Spark isolado com regras testadas e os identificadores públicos em arquivo de ambiente local. Nenhuma chave privada deve ser colocada no navegador.</p>
  </section>;

  async function submit(action: 'login' | 'signup' | 'reset') {
    if (!services) return;
    setPending(true); setStatus('');
    try {
      const trimmed = email.trim();
      if (!trimmed || trimmed.length > 254) throw new Error('E-mail inválido.');
      if (action === 'reset') {
        await sendPasswordResetEmail(services.auth, trimmed);
        setStatus('Se a conta existir, o provedor enviará instruções de recuperação.');
      } else if (action === 'signup') {
        if (password.length < 8 || password.length > 128) throw new Error('Use uma senha de 8 a 128 caracteres.');
        await createUserWithEmailAndPassword(services.auth, trimmed, password);
        setPassword(''); setStatus('Conta criada. Sessão autenticada.');
      } else {
        await signInWithEmailAndPassword(services.auth, trimmed, password);
        setPassword(''); setStatus('Sessão iniciada.');
      }
    } catch {
      setStatus(action === 'reset' ? 'Não foi possível solicitar recuperação agora.' :
        'A operação falhou. Confira os dados, permissões e conectividade.');
    } finally { setPending(false); }
  }

  async function requestDemoQuote() {
    if (!services || !user || pending || cart.length < 1 || cart.length > 12) return;
    setPending(true); setStatus('');
    try {
      const id = pendingQuoteId.current ?? createId();
      pendingQuoteId.current = id;
      const result = await requestPrivateQuote(user, cart.map(x => x.config), id);
      setRemoteQuotes(await listPrivateQuotes(user));
      setStatus(result.replay ? 'Solicitação já registrada (repetição segura).' : 'Solicitação demonstrativa registrada. Nenhum fornecedor foi contatado.');
    } catch { setStatus('Falha ao registrar a solicitação. Você pode tentar novamente com a mesma chave.'); }
    finally { setPending(false); }
  }
  async function refreshQuotes() {
    if (!user || pending) return;
    setPending(true); setStatus('');
    try { setRemoteQuotes(await listPrivateQuotes(user)); }
    catch { setStatus('Não foi possível consultar solicitações.'); }
    finally { setPending(false); }
  }
  async function deleteQuote(item: PrivateQuote) {
    if (!services || !user || pending) return;
    if (!window.confirm('Excluir esta solicitação demonstrativa da sua conta? Esta ação não pode ser desfeita.')) return;
    setPending(true); setStatus('');
    try {
      await deletePrivateQuote(user, item.id);
      setRemoteQuotes(await listPrivateQuotes(user));
      setStatus('Solicitação removida da sua conta.');
    } catch { setStatus('Não foi possível excluir a solicitação. Nenhuma exclusão foi confirmada.'); }
    finally { setPending(false); }
  }
  async function save() {
    if (!services || !user || pending) return;
    setPending(true); setStatus('');
    try {
      await upsertRemoteDesign({
        db: services.db, uid: user.uid, id: selected?.id ?? createId(),
        title, config: design, expectedRevision: selected?.revision,
      });
      setSelected(null);
      await refresh(user.uid);
      setStatus('Design gravado no Firestore da sua conta.');
    } catch (error) {
      setStatus(error instanceof DesignConflict ? error.message : 'Falha ao salvar. Confirme a conexão e suas permissões.');
    } finally { setPending(false); }
  }

  async function remove(entry: RemoteDesign) {
    if (!services || !user || pending) return;
    setPending(true); setStatus('');
    try {
      await deleteRemoteDesign(services.db, user.uid, entry.id);
      if (selected?.id === entry.id) setSelected(null);
      await refresh(user.uid);
      setStatus('Design excluído da sua conta.');
    } catch { setStatus('Não foi possível excluir o design.'); }
    finally { setPending(false); }
  }

  return <section className="content-card" aria-label="Conta e sincronização em nuvem">
    <div className="section-head"><div><p className="viewer-kicker">FIREBASE AUTH + FIRESTORE</p><h2>Meus designs na nuvem</h2></div>
      <span className="viewer-tag">{sessionLoading ? 'VERIFICANDO' : user ? 'AUTENTICADO' : 'SEM SESSÃO'}</span></div>
    <p className="helper">Salvar na nuvem exige autenticação real. Cada design pertence à conta autenticada e possui revisão para detectar conflitos de edição.</p>
    {sessionLoading ? <p role="status">Verificando autenticação...</p> : user ? <>
      <div className="cloud-session"><strong>Conta conectada: {user.email ?? 'Usuário autenticado'}</strong>
        <button className="secondary" type="button" disabled={pending} onClick={() => void signOut(services.auth)}>Sair</button></div>
      <label className="form-label" htmlFor="cloud-title">Nome do design</label>
      <input id="cloud-title" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} />
      <p className="helper">Design atual: {brl(quoteLine(design).totalCents)} (valor sintético).</p>
      <button type="button" disabled={pending} onClick={() => void save()}>
        {selected ? 'Salvar edição na nuvem' : 'Salvar configuração atual na nuvem'}
      </button>
      <div className="record-grid">
        {items.map(item => <article key={item.id} className="record-card record-body">
          <h3>{item.title}</h3><p>Revisão {item.revision} · Atualizado {item.updatedAt.slice(0, 10)}</p>
          <div className="record-actions">
            <button type="button" disabled={pending} onClick={() => {
              onLoad(item.config); setTitle(item.title); setSelected(item);
              setStatus('Design carregado no estúdio. Retorne a esta seção para salvar a edição.');
            }}>Abrir no estúdio</button>
            <button type="button" className="secondary" disabled={pending} onClick={() => void remove(item)}>Excluir da nuvem</button>
          </div>
        </article>)}
      </div>
      {items.length === 0 && <div className="empty-state">Nenhum design disponível nesta conta.</div>}
      <details className="blueprint models-panel">
        <summary>Gestão de modelos por papel e tenant</summary>
        <div className="blueprint-content">
          <Suspense fallback={<p role="status">Carregando gestão de modelos...</p>}>
            <ModelManager user={user} db={services.db} />
          </Suspense>
        </div>
      </details>
      <div className="cloud-quotes">
        <h3>Solicitações autenticadas de orçamento</h3>
        {isPrivateQuoteEnabled() ? <>
          <p className="helper">Registro demonstrativo com preço recalculado pelo Worker. Nenhum e-mail, pagamento ou pedido é enviado.</p>
          <button type="button" onClick={() => void requestDemoQuote()} disabled={pending || cart.length < 1 || cart.length > 12}>Solicitar orçamento autenticado ({cart.length} itens)</button>
          <button type="button" className="secondary" onClick={() => void refreshQuotes()} disabled={pending}>Atualizar solicitações</button>
          {remoteQuotes.map(q => <article className="quote-card" key={q.id}>
            <strong>Solicitação {q.id.slice(0, 8)} · {brl(q.totalCents)}</strong>
            <p className="helper">Status: {q.status} · {q.createdAt.slice(0, 10)}</p>
            <button type="button" className="secondary" disabled={pending}
              onClick={() => void deleteQuote(q)} aria-label={'Excluir solicitação ' + q.id.slice(0, 8)}>Excluir solicitação</button>
          </article>)}
        </> : <p className="helper">O endpoint de solicitações autenticadas está desativado até configurar um Worker isolado com credenciais e rate limiting.</p>}
      </div>
    </> : <form className="cloud-form" onSubmit={e => { e.preventDefault(); void submit('login'); }}>
      <label className="form-label" htmlFor="auth-email">E-mail</label>
      <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
      <label className="form-label" htmlFor="auth-password">Senha</label>
      <input id="auth-password" type="password" autoComplete="current-password" minLength={8} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} />
      <div className="record-actions">
        <button type="submit" disabled={pending}>Entrar</button>
        <button type="button" className="secondary" disabled={pending} onClick={() => void submit('signup')}>Criar conta</button>
        <button type="button" className="secondary" disabled={pending} onClick={() => void submit('reset')}>Recuperar acesso</button>
      </div>
    </form>}
    {status && <p role="status" className="feedback">{status}</p>}
    <p className="disclaimer">Sem cobranças, pedidos reais ou envio de orçamentos. Quando configurado, os designs são mantidos no Firebase do projeto escolhido, sujeitos às regras de privacidade e retenção.</p>
  </section>;
}
