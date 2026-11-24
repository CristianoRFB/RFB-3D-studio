import { Canvas, useLoader } from '@react-three/fiber';
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import { getProduct, type AddonId, type ProductId } from './catalog';
import { Preview2D } from './Preview2D';
import { clamp, COLORS, type StudioConfig } from './studio';

type Rot = { x: number; y: number };
type Pan = { x: number; y: number };
type Drag = { x: number; y: number; pan: boolean };
type DisplayConfig = Pick<StudioConfig, 'colorId' | 'finishId'>;
type Props = { config: DisplayConfig; productId: ProductId; addonId?: AddonId; sizeScale: number; importUrl?: string | null };
const DEFAULT_ROT = { x: 0.14, y: -0.35 };

function supportsWebGL(): boolean {
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

/** All geometry is original and programmatic. No third-party GLB, textures or fonts. */
function DemoModel({ config, productId, addonId, rot, pan, zoom, sizeScale }: Props & { rot: Rot; pan: Pan; zoom: number }) {
  const paint = COLORS.find(c => c.id === config.colorId)?.hex ?? COLORS[0].hex;
  const metal = config.finishId === 'metalico';
  const material = { color: paint, metalness: metal ? 0.78 : 0.09, roughness: metal ? 0.24 : 0.83 };
  return <group rotation={[rot.x, rot.y, 0]} position={[pan.x, pan.y, 0]} scale={zoom * sizeScale}>
    {productId === 'aura' && <>
      <mesh><cylinderGeometry args={[0.66, 0.68, 2.15, 40]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, 1.12, 0]}><cylinderGeometry args={[0.46, 0.62, 0.34, 40]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, 1.40, 0]}><cylinderGeometry args={[0.43, 0.43, 0.28, 40]} /><meshStandardMaterial color="#d3d7e5" metalness={0.8} roughness={0.28} /></mesh>
      <mesh position={[0, 1.54, 0]}><cylinderGeometry args={[0.44, 0.44, 0.07, 40]} /><meshStandardMaterial color="#242e43" metalness={0.36} roughness={0.5} /></mesh>
      <mesh position={[0, -0.77, 0]}><cylinderGeometry args={[0.685, 0.685, 0.11, 40]} /><meshStandardMaterial color="#242e43" metalness={0.35} roughness={0.65} /></mesh>
      <mesh position={[0, 0.58, 0.66]}><boxGeometry args={[0.55, 0.13, 0.025]} /><meshStandardMaterial color="#f0f0fa" metalness={0.25} roughness={0.45} /></mesh>
      {addonId === 'alca' && <mesh position={[0.70, 1.16, 0]} rotation={[0, 0, -0.28]}>
        <torusGeometry args={[0.41, 0.095, 16, 52]} />
        <meshStandardMaterial color="#d4e3f1" metalness={.45} roughness={.45} />
      </mesh>}
      {addonId === 'gravacao' && <mesh position={[0, 0.02, .685]}>
        <boxGeometry args={[.58, .18, .024]} />
        <meshStandardMaterial color="#fbf4d8" metalness={.18} roughness={.55} />
      </mesh>}
    </>}
    {productId === 'orbita' && <>
      <mesh position={[0, -1.35, 0]}><cylinderGeometry args={[.88, .88, .15, 48]} /><meshStandardMaterial color="#262f45" metalness={.65} roughness={.38} /></mesh>
      <mesh position={[0, -.62, 0]}><cylinderGeometry args={[.10, .12, 1.46, 28]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, .40, 0]}><sphereGeometry args={[.83, 48, 32]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, .40, 0]}><torusGeometry args={[.86, .056, 16, 64]} /><meshStandardMaterial color="#cdd5e2" metalness={.7} roughness={.25} /></mesh>
      <mesh position={[0, 1.23, 0]}><cylinderGeometry args={[.30, .39, .16, 32]} /><meshStandardMaterial color="#262f45" metalness={.6} roughness={.4} /></mesh>
      {addonId === 'base' && <mesh position={[0, -1.43, 0]}>
        <cylinderGeometry args={[1.04, 1.04, .13, 48]} />
        <meshStandardMaterial color="#b5a6da" metalness={.47} roughness={.41} />
      </mesh>}
      {addonId === 'gravacao' && <mesh position={[0, .40, .82]}>
        <boxGeometry args={[.44, .16, .03]} />
        <meshStandardMaterial color="#fff3dc" metalness={.18} roughness={.6} />
      </mesh>}
    </>}
    {productId === 'nexo' && <>
      <mesh position={[0, -.34, 0]}><cylinderGeometry args={[.77, .58, 1.93, 48, 1, true]} /><meshStandardMaterial {...material} side={2} /></mesh>
      <mesh position={[0, -.34, 0]}><cylinderGeometry args={[.70, .51, 1.90, 48]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, .67, 0]}><torusGeometry args={[.765, .075, 16, 48]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, -1.31, 0]}><cylinderGeometry args={[.54, .54, .12, 48]} /><meshStandardMaterial color="#303a51" roughness={.7} /></mesh>
      {addonId === 'suporte' && <group position={[0, -1.34, 0]}>
        <mesh><cylinderGeometry args={[.87, .87, .11, 48]} /><meshStandardMaterial color="#b5bccd" metalness={.64} roughness={.38} /></mesh>
        <mesh position={[0, -.12, 0]}><cylinderGeometry args={[.65, .65, .16, 48]} /><meshStandardMaterial color="#394157" roughness={.5} /></mesh>
      </group>}
      {addonId === 'gravacao' && <mesh position={[0, -.08, .726]}>
        <boxGeometry args={[.57, .18, .028]} />
        <meshStandardMaterial color="#faf3e8" roughness={.64} />
      </mesh>}
    </>}
  </group>;
}

function ImportedModel({ url, config, rot, pan, zoom }: { url: string; config: DisplayConfig; rot: Rot; pan: Pan; zoom: number }) {
  const { scene } = useLoader(GLTFLoader, url);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const box = new Box3().setFromObject(copy);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const max = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 2.5 / max;
    copy.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    copy.scale.setScalar(scale);
    const color = COLORS.find(c => c.id === config.colorId)?.hex ?? COLORS[0].hex;
    copy.traverse(obj => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.material = new MeshStandardMaterial({ color,
        metalness: config.finishId === 'metalico' ? .74 : .08,
        roughness: config.finishId === 'metalico' ? .27 : .8 });
    });
    return copy;
  }, [scene, config.colorId, config.finishId]);
  useEffect(() => () => model.traverse(obj => {
    const mesh = obj as Mesh;
    if (mesh.isMesh && mesh.material instanceof MeshStandardMaterial) mesh.material.dispose();
  }), [model]);
  return <group rotation={[rot.x, rot.y, 0]} position={[pan.x, pan.y, 0]} scale={zoom}>
    <primitive object={model} />
  </group>;
}

function ThreeScene({ config, productId, addonId, sizeScale, importUrl, rot, pan, zoom, lite }: Props & { rot: Rot; pan: Pan; zoom: number; lite: boolean }) {
  return <Canvas frameloop="demand" camera={{ position: [0, 0, 5.6], fov: 44, near: .1, far: 100 }}
    dpr={[1, lite ? 1 : 1.75]} gl={{ antialias: !lite, alpha: true, preserveDrawingBuffer: true, powerPreference: lite ? 'low-power' : 'high-performance' }}>
    <ambientLight intensity={1.6} />
    <directionalLight position={[3, 5, 4]} intensity={3} />
    {!lite && <pointLight position={[-4, -2, 3]} color="#9A76FF" intensity={30} distance={12} />}
    {importUrl ? <Suspense fallback={null}><ImportedModel url={importUrl} config={config} rot={rot} pan={pan} zoom={zoom}/></Suspense>
      : <DemoModel config={config} productId={productId} addonId={addonId} sizeScale={sizeScale} rot={rot} pan={pan} zoom={zoom} />}
  </Canvas>;
}
class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
function Fallback2D({ config, productId, addonId }: Props) {
  return <div className="fallback"><Preview2D productId={productId} colorId={config.colorId} addonId={addonId} /><span>Prévia 2D funcional · ilustração original</span></div>;
}

export default function Viewer3D({ config, productId, addonId, sizeScale, importUrl }: Props) {
  const [rot, setRot] = useState<Rot>(DEFAULT_ROT);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [lite, setLite] = useState(false);
  const [twoD, setTwoD] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [renderFailed, setRenderFailed] = useState(false);
  const drag = useRef<Drag | null>(null);
  const sceneElement = useRef<HTMLDivElement | null>(null);
  const [exportMessage, setExportMessage] = useState('');
  useEffect(() => { setWebgl(supportsWebGL()); }, []);
  useEffect(() => { setRenderFailed(false); }, [importUrl, productId]);
  useEffect(() => {
    if (webgl !== true || twoD) return;
    const canvas = sceneElement.current?.querySelector('canvas');
    if (!canvas) return;
    const onLoss = (event: Event) => { event.preventDefault(); drag.current = null; setWebgl(false); };
    canvas.addEventListener('webglcontextlost', onLoss);
    return () => canvas.removeEventListener('webglcontextlost', onLoss);
  }, [webgl, twoD]);
  const fallback = twoD || webgl === false || renderFailed;
  const retry3D = () => { setTwoD(false); setRenderFailed(false); setWebgl(supportsWebGL()); };
  const savePNG = () => {
    setExportMessage('');
    const canvas = sceneElement.current?.querySelector('canvas');
    if (!canvas || fallback) { setExportMessage('O render 3D não está disponível para exportação.'); return; }
    canvas.toBlob(blob => {
      if (!blob || blob.size === 0) { setExportMessage('Não foi possível capturar o render 3D.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rfb-studio-render-3d.png';
      document.body.append(link);
      link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportMessage('Imagem PNG capturada do visualizador 3D.');
    }, 'image/png');
  };
  const resetCamera = () => { setRot(DEFAULT_ROT); setPan({ x: 0, y: 0 }); setZoom(1); };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || fallback) return;
    drag.current = { x: e.clientX, y: e.clientY, pan: e.shiftKey };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const previous = drag.current;
    if (!previous || fallback) return;
    const dx = e.clientX - previous.x, dy = e.clientY - previous.y;
    drag.current = { ...previous, x: e.clientX, y: e.clientY };
    if (previous.pan) setPan(p => ({ x: clamp(p.x + dx / 220, -1.2, 1.2), y: clamp(p.y - dy / 220, -1, 1) }));
    else setRot(p => ({ x: clamp(p.x + dy / 150, -1.15, 1.15), y: p.y + dx / 150 }));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (fallback) return;
    if (keys.includes(e.key)) {
      e.preventDefault();
      const dx = e.key === 'ArrowLeft' ? -.14 : e.key === 'ArrowRight' ? .14 : 0;
      const dy = e.key === 'ArrowUp' ? -.14 : e.key === 'ArrowDown' ? .14 : 0;
      if (e.shiftKey) setPan(p => ({ x: clamp(p.x + dx, -1.2, 1.2), y: clamp(p.y - dy, -1, 1) }));
      else setRot(p => ({ x: clamp(p.x + dy, -1.15, 1.15), y: p.y + dx }));
    }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z => clamp(z + .1, .65, 1.6)); }
    if (e.key === '-') { e.preventDefault(); setZoom(z => clamp(z - .1, .65, 1.6)); }
    if (e.key === '0') { e.preventDefault(); resetCamera(); }
  };
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (fallback) return; e.preventDefault();
    setZoom(z => clamp(z + (e.deltaY < 0 ? .08 : -.08), .65, 1.6));
  };
  return <section className="viewer" aria-label={'Personalização visual de ' + getProduct(productId).name}>
    <div className="viewer-head"><span className="viewer-kicker">01 / VISUALIZADOR</span>
      <span className="viewer-tag">{renderFailed ? 'FALHA NO MODELO — 2D' : fallback ? 'MODO 2D' : webgl === null ? 'PREPARANDO...' : 'WEBGL INTERATIVO'}</span></div>
    <div ref={sceneElement} className={'scene ' + (fallback ? 'scene-2d' : '')} role="group" tabIndex={0}
      aria-label="Visualizador. Setas giram o produto; Shift e setas movem; mais e menos aproximam; zero restaura."
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onKeyDown={onKeyDown} onWheel={onWheel}>
      {fallback ? <Fallback2D config={config} productId={productId} addonId={addonId} sizeScale={sizeScale} /> :
        webgl === null ? <p className="scene-loading">Preparando visualizador...</p> :
        <ViewerBoundary key={importUrl ?? 'original-'+productId} onFailure={() => setRenderFailed(true)} fallback={<Fallback2D config={config} productId={productId} addonId={addonId} sizeScale={sizeScale} />}>
          <ThreeScene config={config} productId={productId} addonId={addonId} sizeScale={sizeScale} importUrl={importUrl} rot={rot} pan={pan} zoom={zoom} lite={lite} />
        </ViewerBoundary>}
      <div className="scene-caption">{importUrl ? 'ARQUIVO GLB LOCAL · PRÉVIA SEM COTAÇÃO' : getProduct(productId).name.toUpperCase() + ' · GEOMETRIA ORIGINAL'}</div>
    </div>
    <div className="scene-controls">
      <button type="button" className="secondary" onClick={() => setRot(r => ({ ...r, y: r.y - .3 }))} disabled={fallback} aria-label="Girar para a esquerda">←</button>
      <button type="button" className="secondary" onClick={() => setRot(r => ({ ...r, y: r.y + .3 }))} disabled={fallback} aria-label="Girar para a direita">→</button>
      <button type="button" className="secondary" onClick={() => setZoom(z => clamp(z + .12, .65, 1.6))} disabled={fallback} aria-label="Aproximar">+</button>
      <button type="button" className="secondary" onClick={() => setZoom(z => clamp(z - .12, .65, 1.6))} disabled={fallback} aria-label="Afastar">−</button>
      <button type="button" className="secondary" onClick={resetCamera} disabled={fallback}>Restaurar vista</button>
      <button type="button" className="secondary" onClick={savePNG} disabled={fallback}>Exportar render 3D PNG</button>
      {(renderFailed || webgl === false) && <button type="button" onClick={retry3D}>Tentar 3D novamente</button>}
    </div>
    <div className="viewer-modes">
      <label><input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} /> Qualidade reduzida</label>
      <label><input type="checkbox" checked={twoD} onChange={e => setTwoD(e.target.checked)} /> Prévia 2D</label>
    </div>
    {exportMessage && <p role="status" className="hint">{exportMessage}</p>}
    <p className="hint">{fallback ? 'Prévia 2D disponível quando WebGL falha, um modelo não carrega ou por escolha do usuário. Você pode tentar novamente.' : 'Arraste para girar. Shift + arrastar para mover. Role para zoom. Teclado: setas, Shift+setas, +, -, 0.'}</p>
  </section>;
}
