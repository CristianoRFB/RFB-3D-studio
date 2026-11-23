import { useEffect, useState, type CSSProperties } from 'react';
import product from './product.json';
import Viewer3D from './Viewer3D';
import { clampStep, nextStep, prevStep } from './flow';
import { COLORS, DEFAULT_CONFIG, FINISHES, STUDIO_STORAGE_KEY, encodeStudioConfig, readStudioConfig, type StudioConfig } from './studio';

const stepKey = 'rfb:' + product.slug + ':starter-step';
const lastStep = product.steps.length - 1;

function initialConfig(): StudioConfig {
  try { return readStudioConfig(window.localStorage.getItem(STUDIO_STORAGE_KEY)); }
  catch { return { ...DEFAULT_CONFIG }; }
}

export default function App() {
  const [config, setConfig] = useState<StudioConfig>(initialConfig);
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null);
  const [step, setStep] = useState(() => {
    try { return clampStep(Number(window.localStorage.getItem(stepKey) ?? 0), lastStep); }
    catch { return 0; }
  });

  useEffect(() => {
    try { window.localStorage.setItem(STUDIO_STORAGE_KEY, encodeStudioConfig(config)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  }, [config]);
  useEffect(() => {
    try { window.localStorage.setItem(stepKey, String(step)); }
    catch { /* A etapa opcional não deve bloquear o visualizador. */ }
  }, [step]);

  const theme = { '--accent': product.accent } as CSSProperties;
  return <div className="shell" style={theme}>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="topbar">
      <a className="brand" href="#conteudo" aria-label={product.name + ' início'}>RFB<span>Studio</span><span className="brand-dot">.</span></a>
      <span className="status">RFB METHOD / G2 · DEMONSTRAÇÃO LOCAL</span>
    </header>
    <main id="conteudo">
      <section className="intro">
        <p className="eyebrow">PERSONALIZAÇÃO EM 3D · LABORATÓRIO</p>
        <h1>Seu produto.<br /><span className="gradient">Sua identidade.</span></h1>
        <p className="slogan">{product.slogan}</p>
        <p className="lead">Uma primeira experiência para visualizar materiais e cores em um objeto tridimensional de demonstração.</p>
      </section>
      <div className="studio-grid">
        <Viewer3D config={config} />
        <aside className="customizer" aria-label="Opções de personalização">
          <div className="panel-head">
            <span className="viewer-kicker">02 / PERSONALIZAR</span>
            <span className="panel-counter">DEMO 01</span>
          </div>
          <h2>Garrafa Aura</h2>
          <p className="helper">Geometria autoral de teste. Não representa produto comercial ou estoque real.</p>
          <div className="group">
            <h3>Escolha a cor</h3>
            <div className="swatches" role="group" aria-label="Cores da garrafa">
              {COLORS.map(color => <button key={color.id} type="button" className={'swatch ' + (config.colorId === color.id ? 'selected' : '')}
                style={{ '--swatch': color.hex } as CSSProperties}
                aria-label={'Cor ' + color.label} aria-pressed={config.colorId === color.id}
                onClick={() => setConfig(current => ({ ...current, colorId: color.id }))}>
                <span />
              </button>)}
            </div>
            <p className="selected-copy">{COLORS.find(c => c.id === config.colorId)?.label}</p>
          </div>
          <div className="group">
            <h3>Acabamento</h3>
            <div className="finish-options" role="group" aria-label="Acabamentos">
              {FINISHES.map(finish => <button key={finish.id} type="button"
                className={'finish ' + (config.finishId === finish.id ? 'chosen' : '')}
                aria-pressed={config.finishId === finish.id}
                onClick={() => setConfig(current => ({ ...current, finishId: finish.id }))}>{finish.label}</button>)}
            </div>
          </div>
          <div className="configuration">
            <span>CONFIGURAÇÃO ATUAL</span>
            <strong>{COLORS.find(c => c.id === config.colorId)?.label} / {FINISHES.find(f => f.id === config.finishId)?.label}</strong>
            <p role="status">{storageAvailable === null ? 'Verificando armazenamento local...' : storageAvailable ? 'Ajustes guardados somente neste navegador.' : 'Armazenamento indisponível: alterações apenas nesta sessão.'}</p>
          </div>
          <button type="button" className="reset-config" onClick={() => setConfig({ ...DEFAULT_CONFIG })}>Restaurar configuração</button>
          <p className="disclaimer">Não há conta, backend, orçamento, pedido ou cobrança. Nenhuma configuração é enviada a um servidor.</p>
        </aside>
      </div>
      <details className="blueprint">
        <summary>Consultar o roteiro original do Starter Pack</summary>
        <div className="blueprint-content">
          <div className="summary"><span>Blueprint preservado</span><strong>Etapa {step + 1} de {product.steps.length}</strong></div>
          <div className="progress" role="progressbar" aria-label="Progresso do roteiro" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={product.steps.length}>
            <span style={{ width: (step + 1) / product.steps.length * 100 + '%' }} />
          </div>
          <h2>{product.steps[step]}</h2>
          <p>As etapas abaixo são planejamento; não executam operações comerciais.</p>
          <div className="controls">
            <button type="button" className="secondary" onClick={() => setStep(prevStep(step))} disabled={step === 0}>Voltar</button>
            <button type="button" onClick={() => setStep(nextStep(step, lastStep))} disabled={step === lastStep}>Próxima etapa</button>
            <button type="button" className="secondary" onClick={() => setStep(0)}>Reiniciar</button>
          </div>
          <h3>10 módulos do catálogo original (não implementados integralmente)</h3>
          <ul className="module-list">{product.modules.map(m => <li key={m}>{m}</li>)}</ul>
        </div>
      </details>
    </main>
    <footer className="footer">RFB Method · Fase G2 experimental · Dados sintéticos · Sem deploy verificado</footer>
  </div>;
}
