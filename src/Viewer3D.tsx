import { Canvas } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import { getProduct, type ProductId } from './catalog';
import { clamp, COLORS, type StudioConfig } from './studio';

type Rot = { x: number; y: number };
type Pan = { x: number; y: number };
type Drag = { x: number; y: number; pan: boolean };
type DisplayConfig = Pick<StudioConfig, 'colorId' | 'finishId'>;
type Props = { config: DisplayConfig; productId: ProductId; sizeScale: number };
const DEFAULT_ROT = { x: 0.14, y: -0.35 };

function supportsWebGL(): boolean {
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

/** All geometry is original and programmatic. No third-party GLB, textures or fonts. */
function DemoModel({ config, productId, rot, pan, zoom, sizeScale }: Props & { rot: Rot; pan: Pan; zoom: number }) {
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
    </>}
    {productId === 'orbita' && <>
      <mesh position={[0, -1.35, 0]}><cylinderGeometry args={[.88, .88, .15, 48]} /><meshStandardMaterial color="#262f45" metalness={.65} roughness={.38} /></mesh>
      <mesh position={[0, -.62, 0]}><cylinderGeometry args={[.10, .12, 1.46, 28]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, .40, 0]}><sphereGeometry args={[.83, 48, 32]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, .40, 0]}><torusGeometry args={[.86, .056, 16, 64]} /><meshStandardMaterial color="#cdd5e2" metalness={.7} roughness={.25} /></mesh>
      <mesh position={[0, 1.23, 0]}><cylinderGeometry args={[.30, .39, .16, 32]} /><meshStandardMaterial color="#262f45" metalness={.6} roughness={.4} /></mesh>
    </>}
    {productId === 'nexo' && <>
      <mesh position={[0, -.34, 0]}><cylinderGeometry args={[.77, .58, 1.93, 48, 1, true]} /><meshStandardMaterial {...material} side={2} /></mesh>
      <mesh position={[0, -.34, 0]}><cylinderGeometry args={[.70, .51, 1.90, 48]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, .67, 0]}><torusGeometry args={[.765, .075, 16, 48]} /><meshStandardMaterial {...material} /></mesh>
      <mesh position={[0, -1.31, 0]}><cylinderGeometry args={[.54, .54, .12, 48]} /><meshStandardMaterial color="#303a51" roughness={.7} /></mesh>
    </>}
  </group>;
}

function ThreeScene({ config, productId, sizeScale, rot, pan, zoom, lite }: Props & { rot: Rot; pan: Pan; zoom: number; lite: boolean }) {
  return <Canvas frameloop="demand" camera={{ position: [0, 0, 5.6], fov: 44, near: .1, far: 100 }}
    dpr={[1, lite ? 1 : 1.75]} gl={{ antialias: !lite, alpha: true, powerPreference: lite ? 'low-power' : 'high-performance' }}>
    <ambientLight intensity={1.6} />
    <directionalLight position={[3, 5, 4]} intensity={3} />
    {!lite && <pointLight position={[-4, -2, 3]} color="#9A76FF" intensity={30} distance={12} />}
    <DemoModel config={config} productId={productId} sizeScale={sizeScale} rot={rot} pan={pan} zoom={zoom} />
  </Canvas>;
}
class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function Preview2D({ productId, colorId }: { productId: ProductId; colorId: DisplayConfig['colorId'] }) {
  const fill = COLORS.find(c => c.id === colorId)?.hex ?? COLORS[0].hex;
  return <svg className="product-svg" viewBox="0 0 280 330" role="img" aria-label={'Ilustração 2D: ' + getProduct(productId).name}>
    <ellipse cx="140" cy="301" rx="78" ry="11" fill="#080e1d" opacity=".45" />
    {productId === 'aura' && <>
      <path d="M105 55h70v20c0 9 14 15 20 28v164c0 24-22 28-55 28s-55-4-55-28V103c6-13 20-19 20-28Z" fill={fill} stroke="#e8e5ff" strokeOpacity=".5" strokeWidth="2" />
      <rect x="108" y="35" width="64" height="30" rx="7" fill="#c8cfde" />
      <rect x="103" y="32" width="74" height="10" rx="4" fill="#252c3f" />
      <path d="M92 115v143" stroke="#fff" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round" />
    </>}
    {productId === 'orbita' && <>
      <rect x="126" y="171" width="28" height="113" rx="8" fill={fill} />
      <ellipse cx="140" cy="285" rx="65" ry="12" fill="#343e59" />
      <circle cx="140" cy="117" r="82" fill={fill} stroke="#dce2f0" strokeWidth="7" />
      <path d="M99 75Q145 35 186 96" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="12" strokeLinecap="round" />
    </>}
    {productId === 'nexo' && <>
      <path d="M72 81Q84 222 90 282Q140 309 190 282Q196 222 208 81Z" fill={fill} stroke="#e9e5ff" strokeOpacity=".65" strokeWidth="3" />
      <ellipse cx="140" cy="81" rx="68" ry="17" fill="#2e3650" stroke={fill} strokeWidth="10" />
      <path d="M89 124L102 267" stroke="#fff" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round" />
    </>}
  </svg>;
}
function Fallback2D({ config, productId }: Props) {
  return <div className="fallback"><Preview2D productId={productId} colorId={config.colorId} /><span>Prévia 2D funcional · ilustração original</span></div>;
}

export default function Viewer3D({ config, productId, sizeScale }: Props) {
  const [rot, setRot] = useState<Rot>(DEFAULT_ROT);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [lite, setLite] = useState(false);
  const [twoD, setTwoD] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const drag = useRef<Drag | null>(null);
  useEffect(() => { setWebgl(supportsWebGL()); }, []);
  const fallback = twoD || webgl === false;
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
      <span className="viewer-tag">{fallback ? 'MODO 2D' : webgl === null ? 'PREPARANDO...' : 'WEBGL INTERATIVO'}</span></div>
    <div className={'scene ' + (fallback ? 'scene-2d' : '')} role="group" tabIndex={0}
      aria-label="Visualizador. Setas giram o produto; Shift e setas movem; mais e menos aproximam; zero restaura."
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onKeyDown={onKeyDown} onWheel={onWheel}>
      {fallback ? <Fallback2D config={config} productId={productId} sizeScale={sizeScale} /> :
        webgl === null ? <p className="scene-loading">Preparando visualizador...</p> :
        <ViewerBoundary fallback={<Fallback2D config={config} productId={productId} sizeScale={sizeScale} />}>
          <ThreeScene config={config} productId={productId} sizeScale={sizeScale} rot={rot} pan={pan} zoom={zoom} lite={lite} />
        </ViewerBoundary>}
      <div className="scene-caption">{getProduct(productId).name.toUpperCase()} · GEOMETRIA ORIGINAL</div>
    </div>
    <div className="scene-controls">
      <button type="button" className="secondary" onClick={() => setRot(r => ({ ...r, y: r.y - .3 }))} disabled={fallback} aria-label="Girar para a esquerda">←</button>
      <button type="button" className="secondary" onClick={() => setRot(r => ({ ...r, y: r.y + .3 }))} disabled={fallback} aria-label="Girar para a direita">→</button>
      <button type="button" className="secondary" onClick={() => setZoom(z => clamp(z + .12, .65, 1.6))} disabled={fallback} aria-label="Aproximar">+</button>
      <button type="button" className="secondary" onClick={() => setZoom(z => clamp(z - .12, .65, 1.6))} disabled={fallback} aria-label="Afastar">−</button>
      <button type="button" className="secondary" onClick={resetCamera} disabled={fallback}>Restaurar vista</button>
    </div>
    <div className="viewer-modes">
      <label><input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} /> Qualidade reduzida</label>
      <label><input type="checkbox" checked={twoD} onChange={e => setTwoD(e.target.checked)} /> Prévia 2D</label>
    </div>
    <p className="hint">{fallback ? 'Prévia 2D disponível quando WebGL falha ou por escolha do usuário.' : 'Arraste para girar. Shift + arrastar para mover. Role para zoom. Teclado: setas, Shift+setas, +, -, 0.'}</p>
  </section>;
}
