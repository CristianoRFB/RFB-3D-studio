import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
const CloudWorkspace = lazy(() => import('./cloud/CloudWorkspace'));
import { PRESETS } from './presets';
import { decodeBackup, encodeBackup } from './backup';
import { quoteSummaryText } from './quote-summary';
import { inspectGLB } from './glb';
import product from './product.json';
import { Preview2D } from './Preview2D';
const Viewer3D = lazy(() => import('./Viewer3D'));
import { clampStep, nextStep, prevStep } from './flow';
import { COLORS, DEFAULT_CONFIG, FINISHES } from './studio';
import { CATALOG_VERSION, INITIAL_DESIGN, PRODUCTS, brl, chooseProduct, getProduct, normalizeDesign, quoteLine, type DesignConfig } from './catalog';
import { EMPTY_WORKSPACE, STORE_KEY, addCart, createId, createQuote, encodeWorkspace, readWorkspace, restoreLocalDesign, saveDesign, type Workspace } from './records';

const STEP_KEY = 'rfb:' + product.slug + ':starter-step';
const DESIGN_KEY = 'rfbstudio:design:v2';
const LAST_STEP = product.steps.length - 1;
type Tab = 'studio' | 'catalogo' | 'presets' | 'designs' | 'carrinho' | 'orcamentos' | 'painel' | 'nuvem' | 'privacidade';
const TABS: { id: Tab; label: string }[] = [
  { id: 'studio', label: 'Estúdio' }, { id: 'catalogo', label: 'Catálogo' }, { id: 'presets', label: 'Presets' }, { id: 'designs', label: 'Meus designs' },
  { id: 'carrinho', label: 'Carrinho' }, { id: 'orcamentos', label: 'Orçamentos' }, { id: 'painel', label: 'Painel demo' }, { id: 'nuvem', label: 'Minha conta' }, { id: 'privacidade', label: 'Privacidade' },
];

function initialDesign(): DesignConfig {
  try {
    const encoded = new URLSearchParams(window.location.search).get('design');
    if (encoded && encoded.length <= 2048) return restoreLocalDesign(decodeURIComponent(atob(encoded)));
  } catch { /* Link inválido: usar configuração local. */ }
  try { return restoreLocalDesign(window.localStorage.getItem(DESIGN_KEY)); }
  catch { return { ...INITIAL_DESIGN }; }
}
function initialWorkspace(): Workspace {
  try { return readWorkspace(window.localStorage.getItem(STORE_KEY)); }
  catch { return EMPTY_WORKSPACE(); }
}
function downloadText(filename: string, body: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function previewSVG(config: DesignConfig): string {
  const fill = COLORS.find(c => c.id === config.colorId)?.hex ?? COLORS[0].hex;
  const image = config.productId === 'aura'
    ? '<path d="M105 65h70v18c0 11 20 21 20 40v141c0 24-19 32-55 32s-55-8-55-32V123c0-19 20-29 20-40Z" fill="' + fill + '" stroke="#ece8ff" stroke-width="2"/><rect x="108" y="39" width="64" height="32" rx="5" fill="#cad0db"/>'
    : config.productId === 'orbita'
      ? '<rect x="126" y="170" width="28" height="114" fill="' + fill + '"/><ellipse cx="140" cy="286" rx="66" ry="13" fill="#353c55"/><circle cx="140" cy="113" r="80" fill="' + fill + '" stroke="#e5e9f1" stroke-width="6"/>'
      : '<path d="M72 83Q83 217 90 283Q140 313 190 283Q197 217 208 83Z" fill="' + fill + '" stroke="#e9e5ff" stroke-width="3"/><ellipse cx="140" cy="83" rx="68" ry="17" fill="#303950" stroke="' + fill + '" stroke-width="10"/>';
  const accessory = config.addonId === 'alca' && config.productId === 'aura'
    ? '<ellipse cx="194" cy="112" rx="34" ry="47" fill="none" stroke="#cbd7e7" stroke-width="13"/>'
    : config.addonId === 'base' && config.productId === 'orbita'
      ? '<ellipse cx="140" cy="290" rx="82" ry="20" fill="none" stroke="#aa9fc6" stroke-width="10"/>'
      : config.addonId === 'suporte' && config.productId === 'nexo'
        ? '<rect x="65" y="280" width="150" height="18" rx="8" fill="#afb8d1"/>'
        : config.addonId === 'gravacao'
          ? '<rect x="107" y="194" width="66" height="16" rx="4" fill="#fff4dc"/>'
          : '';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 330" width="560" height="660"><rect width="280" height="330" fill="#182039"/>' + image + accessory + '</svg>';
}
function today() { return new Date().toISOString(); }

export default function App() {
  const [tab, setTab] = useState<Tab>('studio');
  const [cloudVisited, setCloudVisited] = useState(false);
  const [design, setDesign] = useState<DesignConfig>(initialDesign);
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [designName, setDesignName] = useState('Meu design');
  const [search, setSearch] = useState('');
  const [importUrl, setImportUrl] = useState<string | null>(null);
  const [importName, setImportName] = useState('');
  const [alert, setAlert] = useState('');
  const [storageStatus, setStorageStatus] = useState<'verificando' | 'salvo' | 'indisponivel'>('verificando');
  const [confirmLocalDelete, setConfirmLocalDelete] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [step, setStep] = useState(() => {
    try { return clampStep(Number(window.localStorage.getItem(STEP_KEY) ?? 0), LAST_STEP); }
    catch { return 0; }
  });
  const currentProduct = getProduct(design.productId);
  const size = currentProduct.sizes.find(s => s.id === design.sizeId) ?? currentProduct.sizes[1];
  const currentLine = quoteLine(design);
  const cartLines = useMemo(() => workspace.cart.map(item => ({ id: item.id, ...quoteLine(item.config) })), [workspace.cart]);
  const cartTotal = cartLines.reduce((sum, entry) => sum + entry.totalCents, 0);
  const quoteTotal = workspace.quotes.reduce((sum, quote) => sum + quote.totalCents, 0);
  const theme = { '--accent': product.accent } as CSSProperties;

  useEffect(() => () => { if (importUrl) URL.revokeObjectURL(importUrl); }, [importUrl]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(DESIGN_KEY, JSON.stringify(normalizeDesign(design)));
      window.localStorage.setItem(STORE_KEY, encodeWorkspace(workspace));
      setStorageStatus('salvo');
    } catch { setStorageStatus('indisponivel'); }
  }, [design, workspace]);
  useEffect(() => {
    try { window.localStorage.setItem(STEP_KEY, String(step)); }
    catch { /* O blueprint é acessório. */ }
  }, [step]);

  const change = (update: Partial<DesignConfig>) => {
    setDesign(current => normalizeDesign({ ...current, ...update }));
    setSelectedDesign(null);
    setAlert('');
  };
  const choose = (id: DesignConfig['productId']) => {
    setDesign(current => chooseProduct(current, id));
    setSelectedDesign(null); setImportUrl(null); setImportName(''); setAlert('Produto carregado. Ajuste o design no estúdio.'); setTab('studio');
  };
  const saveCurrent = () => {
    if (importUrl) { setAlert('Remova o arquivo GLB local antes de salvar um produto de catálogo.'); return; }
    try {
      const id = selectedDesign ?? createId();
      setWorkspace(ws => saveDesign(ws, design, designName, today(), id));
      setSelectedDesign(id); setAlert('Design salvo apenas neste navegador.');
    } catch { setAlert('Não foi possível salvar o design neste ambiente.'); }
  };
  const addCurrentToCart = () => {
    if (importUrl) { setAlert('Modelos GLB externos não possuem preços aprovados. Remova o arquivo para continuar.'); return; }
    try {
      const id = createId();
      setWorkspace(ws => addCart(ws, design, today(), id));
      setAlert('Configuração adicionada ao carrinho demonstrativo.');
    } catch { setAlert('Não foi possível adicionar a configuração.'); }
  };
  const makeQuote = () => {
    if (workspace.cart.length === 0) { setAlert('Inclua pelo menos um item antes de gerar o orçamento.'); return; }
    try {
      const id = createId();
      setWorkspace(ws => createQuote(ws, today(), id));
      setTab('orcamentos'); setAlert('Orçamento criado localmente. Nenhuma mensagem ou pedido foi enviado.');
    } catch { setAlert('Não foi possível criar o orçamento.'); }
  };
  const loadSaved = (id: string) => {
    setImportUrl(null); setImportName('');
    const saved = workspace.designs.find(x => x.id === id);
    if (!saved) return;
    setDesign(normalizeDesign(saved.config)); setDesignName(saved.label); setSelectedDesign(id);
    setTab('studio'); setAlert('Design carregado para edição.');
  };
  const share = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('design', btoa(encodeURIComponent(JSON.stringify(normalizeDesign(design)))));
      window.history.replaceState(null, '', url.pathname + url.search);
      setAlert('Link da configuração disponível na barra de endereço. Não contém dados pessoais.');
    } catch { setAlert('Não foi possível criar o link neste navegador.'); }
  };
  const exportBackup = () => downloadText(
    'rfb-studio-backup-local.json', encodeBackup(design, workspace, today()), 'application/json'
  );
  const importBackup = async (file: File) => {
    try {
      if (file.size > 200000) throw new Error('Arquivo muito grande');
      const backup = decodeBackup(await file.text());
      setDesign(backup.design); setWorkspace(backup.workspace); setSelectedDesign(null);
      setImportUrl(null); setImportName(''); setConfirmLocalDelete(false);
      setAlert('Backup local restaurado neste navegador.');
    } catch { setAlert('Backup inválido ou incompatível. Nenhum registro foi alterado.'); }
  };
  const deleteLocal = () => {
    if (!confirmLocalDelete) return;
    setWorkspace(EMPTY_WORKSPACE()); setDesign({ ...INITIAL_DESIGN }); setSelectedDesign(null);
    setImportUrl(null); setImportName(''); setStep(0); setConfirmLocalDelete(false);
    try {
      window.localStorage.removeItem('rfbstudio:demo:v1');
      window.localStorage.removeItem('rfbstudio:workspace:v1');
    } catch { /* Ainda ocorre sobrescrita do armazenamento principal pela mudança de estado. */ }
    setAlert('Registros locais excluídos. Designs armazenados no Firebase NÃO foram afetados.');
  };
  const exportDesign = () => downloadText('rfb-studio-design.json', JSON.stringify({ catalogVersion: CATALOG_VERSION, config: design }, null, 2), 'application/json');
  const export2D = () => downloadText('rfb-studio-previa-2d.svg', previewSVG(design), 'image/svg+xml');
  return <div className="shell" style={theme}>
    <a href="#conteudo" className="skip">Pular para o conteúdo</a>
    <header className="topbar">
      <a className="brand" href="#conteudo" onClick={() => setTab('studio')} aria-label="RFB Studio início">RFB<span>Studio</span><span className="brand-dot">.</span></a>
      <span className="status">RFB METHOD / LABORATÓRIO G2–G3</span>
    </header>
    <nav className="main-nav" aria-label="Seções do estúdio">
      {TABS.map(item => <button key={item.id} type="button" className={'nav-tab ' + (tab === item.id ? 'active' : '')}
        aria-current={tab === item.id ? 'page' : undefined} onClick={() => { setTab(item.id); if (item.id === 'nuvem') setCloudVisited(true); setAlert(''); }}>
        {item.label}
        {item.id === 'carrinho' && workspace.cart.length > 0 && <span className="nav-count">{workspace.cart.length}</span>}
      </button>)}
    </nav>
    <main id="conteudo">
      <section className="intro">
        <p className="eyebrow">CONFIGURE · VISUALIZE · EXPLORE</p>
        <h1>Seu produto.<br/><span className="gradient">Sua identidade.</span></h1>
        <p className="slogan">Escolha, visualize e transforme.</p>
        <p className="lead">Três modelos procedurais, opções de acabamento e preços ilustrativos. Uma demonstração interativa sem operações comerciais.</p>
      </section>
      <div className="demo-banner" role="note">
        <strong>Ambiente de demonstração</strong>
        <span>Catálogo e orçamentos são demonstrativos, sem venda ou envio real. Designs podem ser sincronizados com Firebase somente após configurar o projeto e usar a opção Minha conta. {storageStatus === 'indisponivel' ? 'O armazenamento está indisponível.' : ''}</span>
      </div>
      {!online && <p role="status" className="feedback">Sem conexão: o estúdio local continua disponível, mas autenticação e sincronização na nuvem podem falhar.</p>}
      {alert && <p className="feedback" role="status">{alert}</p>}
      {tab === 'studio' && <div className="studio-grid">
        <Suspense fallback={<section className="viewer" role="status" aria-label="Carregando prévia 3D"><p className="scene-loading">Carregando visualizador 3D...</p></section>}>
          <Viewer3D config={design} productId={design.productId} addonId={design.addonId} sizeScale={size.scale} importUrl={importUrl} />
        </Suspense>
        <aside className="customizer" aria-label="Personalização do produto">
          <div className="panel-head"><span className="viewer-kicker">02 / PERSONALIZAR</span><span className="panel-counter">CATÁLOGO DEMO</span></div>
          <h2>{currentProduct.name}</h2>
          <p className="helper">{currentProduct.description}</p>
          <div className="group glb-import">
            <h3>Prévia de modelo GLB próprio</h3>
            <p className="helper">Importe um arquivo GLB autoral de até 8 MB; apenas prévia em memória. Não é salvo, enviado ao servidor ou incluído no preço.</p>
            <label className="form-label" htmlFor="model-upload">Arquivo GLB local</label>
            <input id="model-upload" type="file" accept=".glb,model/gltf-binary" onChange={async e => {
              const file = e.currentTarget.files?.[0];
              if (!file) return;
              try {
                const bytes = await file.arrayBuffer();
                const result = inspectGLB(bytes);
                const url = URL.createObjectURL(new Blob([bytes], { type: 'model/gltf-binary' }));
                setImportUrl(url); setImportName(file.name.slice(0, 70));
                setAlert('GLB carregado localmente: ' + result.meshCount + ' malha(s). Vendas desabilitadas nesta prévia.');
              } catch (error) { setAlert(error instanceof Error ? error.message : 'Não foi possível importar o modelo.'); }
              e.target.value = '';
            }} />
            {importUrl && <div className="import-status"><strong>Modelo externo: {importName}</strong>
              <button type="button" className="secondary" onClick={() => { setImportUrl(null); setImportName(''); setAlert('Prévia GLB removida.'); }}>Remover GLB local</button>
            </div>}
          </div>
          <div className="group">
            <h3>Produto</h3>
            <div className="select-list" role="group" aria-label="Produtos disponíveis">
              {PRODUCTS.map(p => <button key={p.id} type="button" className={'finish ' + (design.productId === p.id ? 'chosen' : '')}
                aria-pressed={design.productId === p.id} onClick={() => choose(p.id)}>{p.name}</button>)}
            </div>
          </div>
          <div className="group">
            <h3>Cor</h3>
            <div className="swatches" role="group" aria-label="Cores do produto">
              {COLORS.map(color => <button key={color.id} type="button" className={'swatch ' + (design.colorId === color.id ? 'selected' : '')}
                style={{ '--swatch': color.hex } as CSSProperties} aria-label={'Cor ' + color.label} aria-pressed={design.colorId === color.id}
                onClick={() => change({ colorId: color.id })}><span /></button>)}
            </div>
            <p className="selected-copy">{COLORS.find(c => c.id === design.colorId)?.label}</p>
          </div>
          <div className="group">
            <h3>Acabamento</h3>
            <div className="finish-options" role="group" aria-label="Tipos de acabamento">
              {FINISHES.filter(finish => currentProduct.finishes.some(id => id === finish.id)).map(finish =>
                <button key={finish.id} type="button" className={'finish ' + (design.finishId === finish.id ? 'chosen' : '')}
                  aria-pressed={design.finishId === finish.id} onClick={() => change({ finishId: finish.id })}>{finish.label}</button>)}
            </div>
          </div>
          <div className="group">
            <label className="form-label" htmlFor="size">Tamanho</label>
            <select id="size" value={design.sizeId} onChange={e => change({ sizeId: e.target.value as DesignConfig['sizeId'] })}>
              {currentProduct.sizes.map(s => <option key={s.id} value={s.id}>{s.label} ({s.cents ? '+' + brl(s.cents) : 'incluído'})</option>)}
            </select>
            <label className="form-label" htmlFor="addon">Acessório / personalização</label>
            <select id="addon" value={design.addonId} onChange={e => change({ addonId: e.target.value as DesignConfig['addonId'] })}>
              {currentProduct.addons.map(a => <option key={a.id} value={a.id}>{a.label} ({a.cents ? '+' + brl(a.cents) : 'incluído'})</option>)}
            </select>
            <label className="form-label" htmlFor="quantity">Quantidade (1 a 10)</label>
            <input id="quantity" type="number" min={1} max={10} step={1} value={design.quantity}
              onChange={e => change({ quantity: Number(e.target.value) })} />
          </div>
          <div className="configuration" aria-live="polite">
            <span>VALOR ILUSTRATIVO · {CATALOG_VERSION}</span>
            <strong className="price">{brl(currentLine.totalCents)}</strong>
            <p>{design.quantity} × {brl(currentLine.unitCents)} · {size.label} · {currentLine.addonLabel}</p>
          </div>
          <div className="save-panel">
            <label className="form-label" htmlFor="design-name">Nome do design (sem dados pessoais)</label>
            <input id="design-name" type="text" value={designName} maxLength={60} onChange={e => setDesignName(e.target.value)} />
            <button type="button" className="primary-full" onClick={saveCurrent} disabled={!!importUrl}>Salvar design local</button>
            <button type="button" className="primary-full secondary" onClick={addCurrentToCart} disabled={!!importUrl}>Adicionar ao carrinho demo</button>
          </div>
          <div className="utility-buttons">
            <button type="button" className="secondary" onClick={exportDesign} disabled={!!importUrl}>Exportar configuração JSON</button>
            <button type="button" className="secondary" onClick={export2D} disabled={!!importUrl}>Baixar prévia 2D SVG</button>
            <button type="button" className="secondary" onClick={share} disabled={!!importUrl}>Gerar link de configuração</button>
            <button type="button" className="secondary" onClick={() => { setDesign({ ...INITIAL_DESIGN }); setSelectedDesign(null); setAlert('Configuração restaurada.'); }}>Restaurar padrão</button>
          </div>
          <p className="disclaimer">Valores sem impostos, frete ou compromisso comercial. O preço é calculado no cliente e NÃO é válido como cobrança ou orçamento contratado.</p>
        </aside>
      </div>}
      {tab === 'catalogo' && <section className="content-card" aria-label="Catálogo de modelos">
        <div className="section-head"><div><p className="viewer-kicker">BIBLIOTECA ORIGINAL</p><h2>Escolha um ponto de partida</h2></div><span className="viewer-tag">3 MODELOS DEMO</span></div>
        <label className="form-label" htmlFor="catalog-search">Buscar no catálogo</label>
        <input id="catalog-search" placeholder="Nome ou categoria" value={search} maxLength={40} onChange={e => setSearch(e.target.value)} />
        <div className="catalog-grid">
          {PRODUCTS.filter(p => (p.name + ' ' + p.category).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map(p =>
            <article key={p.id} className="product-card">
              <div className="product-art"><Preview2D productId={p.id} colorId={DEFAULT_CONFIG.colorId} /></div>
              <div className="product-copy"><p className="viewer-kicker">{p.category}</p><h3>{p.name}</h3><p>{p.description}</p>
                <strong>A partir de {brl(p.baseCents)}</strong>
                <button type="button" onClick={() => choose(p.id)}>Personalizar modelo</button></div>
            </article>)}
        </div>
        {PRODUCTS.filter(p => (p.name + ' ' + p.category).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).length === 0 &&
          <div className="empty-state">Nenhum produto encontrado. Tente outra busca.</div>}
      </section>}
      {tab === 'presets' && <section className="content-card" aria-label="Presets de personalização">
        <div className="section-head"><div><p className="viewer-kicker">COLEÇÃO AUTORAL</p><h2>Comece com um preset</h2></div><span className="viewer-tag">{PRESETS.length} PRESETS</span></div>
        <p className="helper">Combinações demonstrativas prontas para personalizar. Todos os modelos e cores são sintéticos e locais.</p>
        <div className="catalog-grid">
          {PRESETS.map(preset => <article key={preset.id} className="product-card">
            <div className="product-art"><Preview2D productId={preset.config.productId} colorId={preset.config.colorId}/></div>
            <div className="product-copy"><p className="viewer-kicker">{getProduct(preset.config.productId).name}</p>
              <h3>{preset.title}</h3><p>{preset.description}</p><strong>{brl(quoteLine(preset.config).totalCents)}</strong>
              <button type="button" onClick={() => {
                setDesign(normalizeDesign(preset.config)); setSelectedDesign(null); setDesignName(preset.title);
                setTab('studio'); setAlert('Preset carregado. Ajuste as opções e salve seu próprio design.');
              }}>Usar este preset</button>
            </div>
          </article>)}
        </div>
      </section>}
      {tab === 'designs' && <section className="content-card" aria-label="Designs salvos">
        <div className="section-head"><div><p className="viewer-kicker">GALERIA LOCAL</p><h2>Meus designs</h2></div><button type="button" onClick={() => setTab('studio')}>Novo design</button></div>
        <p className="helper">Somente neste navegador; não há backup em nuvem ou sincronização entre dispositivos.</p>
        <div className="record-grid">
          {workspace.designs.map(saved => <article key={saved.id} className="record-card">
            <div className="record-preview"><Preview2D productId={saved.config.productId} colorId={saved.config.colorId} /></div>
            <div className="record-body"><h3>{saved.label}</h3><p>{getProduct(saved.config.productId).name} · {brl(quoteLine(saved.config).totalCents)}</p>
              <div className="record-actions"><button type="button" onClick={() => loadSaved(saved.id)}>Abrir e editar</button>
                <button type="button" className="secondary" onClick={() => setWorkspace(ws => ({ ...ws, designs: ws.designs.filter(x => x.id !== saved.id) }))}>Excluir</button></div>
            </div></article>)}
        </div>
        {workspace.designs.length === 0 && <div className="empty-state">Nenhum design salvo. Personalize um produto no estúdio e selecione “Salvar design local”.</div>}
      </section>}
      {tab === 'carrinho' && <section className="content-card" aria-label="Carrinho demonstrativo">
        <div className="section-head"><div><p className="viewer-kicker">REVISÃO DE CONFIGURAÇÕES</p><h2>Carrinho demo</h2></div><strong className="price">{brl(cartTotal)}</strong></div>
        {cartLines.map(entry => <article className="cart-row" key={entry.id}>
          <div><strong>{entry.productName}</strong><p>{entry.config.quantity} × {brl(entry.unitCents)} · {entry.sizeLabel} · {entry.addonLabel}</p></div>
          <div className="cart-actions"><strong>{brl(entry.totalCents)}</strong>
            <button type="button" className="secondary" onClick={() => setWorkspace(ws => ({ ...ws, cart: ws.cart.filter(x => x.id !== entry.id) }))}>Remover</button></div>
        </article>)}
        {workspace.cart.length === 0 && <div className="empty-state">Carrinho vazio. Adicione uma configuração no estúdio.</div>}
        <div className="cart-footer"><p>Total demonstrativo: <strong>{brl(cartTotal)}</strong></p>
          <button type="button" onClick={makeQuote} disabled={workspace.cart.length === 0}>Gerar orçamento demonstrativo</button>
        </div>
        <p className="disclaimer">Este botão apenas registra uma simulação local. Não inicia compra, pagamento, reserva ou contato.</p>
      </section>}
      {tab === 'orcamentos' && <section className="content-card" aria-label="Histórico de orçamentos locais">
        <div className="section-head"><div><p className="viewer-kicker">HISTÓRICO LOCAL</p><h2>Orçamentos demonstrativos</h2></div><span className="viewer-tag">{workspace.quotes.length} SIMULAÇÕES</span></div>
        {workspace.quotes.map(quote => <article key={quote.id} className="quote-card">
          <div className="quote-head"><div><strong>Simulação {quote.id.slice(0, 8)}</strong><p>{quote.createdAt.slice(0, 10)} · Tabela {quote.catalogVersion}</p></div>
            <strong className="price">{brl(quote.totalCents)}</strong></div>
          {quote.lines.map((line, index) => <p className="quote-line" key={index}>{line.productName} · {line.config.quantity} × {brl(line.unitCents)} = {brl(line.totalCents)}</p>)}
          <div className="record-actions">
            <button type="button" className="secondary" onClick={() => downloadText('rfb-orcamento-demo-' + quote.id.slice(0, 8) + '.json', JSON.stringify(quote, null, 2), 'application/json')}>Baixar JSON da simulação</button>
            <button type="button" className="secondary" onClick={() => downloadText('rfb-orcamento-demo-' + quote.id.slice(0, 8) + '.txt', quoteSummaryText(quote), 'text/plain;charset=utf-8')}>Preparar resumo TXT para envio manual</button>
            <button type="button" className="secondary" onClick={() => setWorkspace(ws => ({ ...ws, quotes: ws.quotes.filter(q => q.id !== quote.id) }))}>Excluir simulação</button>
          </div>
        </article>)}
        {workspace.quotes.length === 0 && <div className="empty-state">Sem orçamentos. Adicione produtos ao carrinho e gere uma simulação.</div>}
        <p className="disclaimer">Simulações não são enviadas a vendedores e não têm validade jurídica ou comercial.</p>
      </section>}
      {tab === 'painel' && <section className="content-card" aria-label="Painel estatístico demonstrativo">
        <div className="section-head"><div><p className="viewer-kicker">SOMENTE DADOS DESTA SESSÃO</p><h2>Painel de atividade demo</h2></div><span className="viewer-tag">SEM LOGIN OU PERMISSÕES</span></div>
        <p className="helper">Este painel não é administrativo e não dá acesso a dados de outros usuários. Os números refletem exclusivamente dados sintéticos salvos neste navegador.</p>
        <div className="metrics">
          <div><span>Designs salvos</span><strong>{workspace.designs.length}</strong></div>
          <div><span>Itens no carrinho</span><strong>{workspace.cart.length}</strong></div>
          <div><span>Simulações locais</span><strong>{workspace.quotes.length}</strong></div>
          <div><span>Volume de simulações</span><strong>{brl(quoteTotal)}</strong></div>
        </div>
        <div className="empty-state">Para implementar um painel de vendas real será necessária autenticação, autorização por vendedor/tenant, backend de preço e Firestore Rules testadas. Nada disso é simulado como produção.</div>
      </section>}
      {tab === 'privacidade' && <section className="content-card" aria-label="Privacidade e dados locais">
        <div className="section-head"><div><p className="viewer-kicker">CONTROLE DO USUÁRIO</p><h2>Privacidade e dados</h2></div><span className="viewer-tag">SOMENTE NESTE NAVEGADOR</span></div>
        <p className="helper">Designs locais, carrinho e simulações ficam armazenados no navegador sem conta. Você pode fazer um backup JSON, restaurá-lo ou apagar esses registros. A operação não envia dados para serviços externos.</p>
        <div className="metrics">
          <div><span>Designs locais</span><strong>{workspace.designs.length}</strong></div>
          <div><span>Itens locais</span><strong>{workspace.cart.length}</strong></div>
          <div><span>Simulações locais</span><strong>{workspace.quotes.length}</strong></div>
          <div><span>Sincronização</span><strong>{online ? 'Disponível se configurada' : 'Offline'}</strong></div>
        </div>
        <div className="privacy-actions">
          <button type="button" onClick={exportBackup}>Exportar backup local JSON</button>
          <label className="form-label" htmlFor="backup-file">Restaurar backup JSON</label>
          <input id="backup-file" type="file" accept=".json,application/json" onChange={e => {
            const file = e.currentTarget.files?.[0];
            if (file) void importBackup(file);
            e.currentTarget.value = '';
          }}/>
        </div>
        <div className="privacy-delete">
          <h3>Excluir os registros locais</h3>
          <p className="helper">Essa ação redefine designs, carrinho, simulações e configuração atual. É irreversível neste navegador sem um backup exportado.</p>
          <label><input type="checkbox" checked={confirmLocalDelete} onChange={e => setConfirmLocalDelete(e.target.checked)}/> Confirmo que desejo apagar meus registros locais.</label>
          <button type="button" className="secondary" disabled={!confirmLocalDelete} onClick={deleteLocal}>Excluir todos os dados locais</button>
        </div>
        <p className="disclaimer">Dados sincronizados com uma conta Firebase NÃO são apagados por esta operação. Na seção Minha conta, cada design remoto pode ser excluído separadamente. Exclusão completa de uma conta Firebase depende de um fluxo de servidor homologado.</p>
      </section>}
      {cloudVisited && <div hidden={tab !== 'nuvem'}>
        <Suspense fallback={<section className="content-card" role="status">Preparando autenticação...</section>}>
          <CloudWorkspace design={design} cart={workspace.cart} onLoad={config => {
            setDesign(normalizeDesign(config)); setImportUrl(null); setImportName('');
            setSelectedDesign(null); setTab('studio');
            setAlert('Design da nuvem carregado. Edite e retorne à seção Minha conta para salvar as alterações.');
          }}/>
        </Suspense>
      </div>}
      <details className="blueprint">
        <summary>Consultar o roteiro original do Starter Pack</summary>
        <div className="blueprint-content">
          <div className="summary"><span>Blueprint preservado</span><strong>Etapa {step + 1} de {product.steps.length}</strong></div>
          <div className="progress" role="progressbar" aria-label="Progresso do roteiro" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={product.steps.length}>
            <span style={{ width: (step + 1) / product.steps.length * 100 + '%' }} /></div>
          <h2>{product.steps[step]}</h2>
          <p>As etapas são planejamento; não executam operações comerciais.</p>
          <div className="controls">
            <button type="button" className="secondary" onClick={() => setStep(prevStep(step))} disabled={step===0}>Voltar</button>
            <button type="button" onClick={() => setStep(nextStep(step,LAST_STEP))} disabled={step===LAST_STEP}>Próxima etapa</button>
            <button type="button" className="secondary" onClick={() => setStep(0)}>Reiniciar</button>
          </div>
          <h3>10 módulos do catálogo original</h3><ul className="module-list">{product.modules.map(m => <li key={m}>{m}</li>)}</ul>
        </div>
      </details>
    </main>
    <footer className="footer">RFB Method · Catálogo {CATALOG_VERSION} · Dados sintéticos · Nenhum deploy comprovado</footer>
  </div>;
}
