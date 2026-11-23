import { Canvas } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import { clamp, COLORS, type StudioConfig } from './studio';

type Rot = { x: number; y: number };
type Pan = { x: number; y: number };
type Drag = { x: number; y: number; pan: boolean };

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch { return false; }
}

function DemoBottle({ config, rot, pan, zoom }: { config: StudioConfig; rot: Rot; pan: Pan; zoom: number }) {
  const paint = COLORS.find(c => c.id === config.colorId)?.hex ?? COLORS[0].hex;
  const metallic = config.finishId === 'metalico';
  return <group rotation={[rot.x, rot.y, 0]} position={[pan.x, pan.y, 0]} scale={zoom}>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.66, 0.68, 2.15, 48]} />
      <meshStandardMaterial color={paint} metalness={metallic ? 0.78 : 0.09} roughness={metallic ? 0.24 : 0.83} />
    </mesh>
    <mesh position={[0, 1.12, 0]}>
      <cylinderGeometry args={[0.46, 0.62, 0.34, 48]} />
      <meshStandardMaterial color={paint} metalness={metallic ? 0.78 : 0.09} roughness={metallic ? 0.24 : 0.83} />
    </mesh>
    <mesh position={[0, 1.40, 0]}>
      <cylinderGeometry args={[0.43, 0.43, 0.28, 48]} />
      <meshStandardMaterial color="#d3d7e5" metalness={0.8} roughness={0.28} />
    </mesh>
    <mesh position={[0, 1.54, 0]}>
      <cylinderGeometry args={[0.44, 0.44, 0.07, 48]} />
      <meshStandardMaterial color="#242e43" metalness={0.36} roughness={0.5} />
    </mesh>
    <mesh position={[0, -0.77, 0]}>
      <cylinderGeometry args={[0.685, 0.685, 0.11, 48]} />
      <meshStandardMaterial color="#242e43" metalness={0.35} roughness={0.65} />
    </mesh>
    <mesh position={[0, 0.58, 0.66]}>
      <boxGeometry args={[0.55, 0.13, 0.025]} />
      <meshStandardMaterial color="#f0f0fa" metalness={0.25} roughness={0.45} />
    </mesh>
  </group>;
}

function ThreeScene({ config, rot, pan, zoom, lite }: { config: StudioConfig; rot: Rot; pan: Pan; zoom: number; lite: boolean }) {
  return <Canvas
    frameloop="demand"
    camera={{ position: [0, 0, 5.6], fov: 44, near: 0.1, far: 100 }}
    dpr={[1, lite ? 1 : 1.75]}
    gl={{ antialias: !lite, alpha: true, powerPreference: lite ? 'low-power' : 'high-performance' }}
  >
    <ambientLight intensity={1.6} />
    <directionalLight position={[3, 5, 4]} intensity={3} />
    {!lite && <pointLight position={[-4, -2, 3]} color="#9A76FF" intensity={30} distance={12} />}
    <DemoBottle config={config} rot={rot} pan={pan} zoom={zoom} />
  </Canvas>;
}

class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Fallback2D({ config }: { config: StudioConfig }) {
  const color = COLORS.find(c => c.id === config.colorId)?.hex ?? COLORS[0].hex;
  return <div className="fallback" role="img" aria-label={'Prévia 2D ilustrativa de uma garrafa na cor ' + config.colorId}>
    <svg viewBox="0 0 280 330" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="140" cy="302" rx="82" ry="12" fill="#0a0d19" opacity=".6" />
      <path d="M105 55h70v20c0 9 14 15 20 28v164c0 24-22 28-55 28s-55-4-55-28V103c6-13 20-19 20-28Z" fill={color} stroke="#e8e5ff" strokeOpacity=".5" strokeWidth="2" />
      <rect x="108" y="35" width="64" height="30" rx="7" fill="#c8cfde" />
      <rect x="103" y="32" width="74" height="10" rx="4" fill="#252c3f" />
      <path d="M92 115v143" stroke="white" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round" />
      <rect x="112" y="150" width="56" height="10" rx="4" fill="#f1f1ff" />
      <path d="M90 275h100" stroke="#1a2335" strokeWidth="11" />
    </svg>
    <span>Prévia 2D · geometria ilustrativa</span>
  </div>;
}

export default function Viewer3D({ config }: { config: StudioConfig }) {
  const [rot, setRot] = useState<Rot>({ x: 0.14, y: -0.35 });
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [lite, setLite] = useState(false);
  const [twoD, setTwoD] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const drag = useRef<Drag | null>(null);

  useEffect(() => { setWebgl(supportsWebGL()); }, []);
  const fallback = twoD || webgl === false;
  const resetCamera = () => { setRot({ x: 0.14, y: -0.35 }); setPan({ x: 0, y: 0 }); setZoom(1); };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, pan: e.shiftKey };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const previous = drag.current;
    if (!previous) return;
    const dx = e.clientX - previous.x;
    const dy = e.clientY - previous.y;
    drag.current = { ...previous, x: e.clientX, y: e.clientY };
    if (previous.pan) {
      setPan(p => ({ x: clamp(p.x + dx / 220, -1.2, 1.2), y: clamp(p.y - dy / 220, -1, 1) }));
    } else {
      setRot(p => ({ x: clamp(p.x + dy / 150, -1.15, 1.15), y: p.y + dx / 150 }));
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrows.includes(e.key)) {
      e.preventDefault();
      const dx = e.key === 'ArrowLeft' ? -0.14 : e.key === 'ArrowRight' ? 0.14 : 0;
      const dy = e.key === 'ArrowUp' ? -0.14 : e.key === 'ArrowDown' ? 0.14 : 0;
      if (e.shiftKey) setPan(p => ({ x: clamp(p.x + dx, -1.2, 1.2), y: clamp(p.y - dy, -1, 1) }));
      else setRot(p => ({ x: clamp(p.x + dy, -1.15, 1.15), y: p.y + dx }));
    }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z => clamp(z + 0.1, 0.65, 1.6)); }
    if (e.key === '-') { e.preventDefault(); setZoom(z => clamp(z - 0.1, 0.65, 1.6)); }
    if (e.key === '0') { e.preventDefault(); resetCamera(); }
  };
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (fallback) return;
    e.preventDefault();
    setZoom(z => clamp(z + (e.deltaY < 0 ? 0.08 : -0.08), 0.65, 1.6));
  };

  return <section className="viewer" aria-label="Personalização visual da garrafa Aura">
    <div className="viewer-head">
      <span className="viewer-kicker">01 / VISUALIZADOR</span>
      <span className="viewer-tag">{fallback ? 'MODO 2D' : webgl === null ? 'PREPARANDO...' : 'WEBGL INTERATIVO'}</span>
    </div>
    <div className={'scene ' + (fallback ? 'scene-2d' : '')}
      role="group" tabIndex={0} aria-label="Visualizador. Setas giram a garrafa; Shift e setas movem; mais e menos aproximam; zero restaura."
      onPointerDown={fallback ? undefined : onPointerDown}
      onPointerMove={fallback ? undefined : onPointerMove}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      onKeyDown={fallback ? undefined : onKeyDown}
      onWheel={onWheel}>
      {fallback ? <Fallback2D config={config} /> :
        webgl === null ? <p className="scene-loading">Preparando visualizador...</p> :
        <ViewerBoundary fallback={<Fallback2D config={config} />}>
          <ThreeScene config={config} rot={rot} pan={pan} zoom={zoom} lite={lite} />
        </ViewerBoundary>}
      <div className="scene-caption">GARRAFA AURA · MODELO PROCEDURAL ORIGINAL</div>
    </div>
    <div className="scene-controls">
      <button type="button" className="secondary" onClick={() => setRot(r => ({ ...r, y: r.y - 0.3 }))} disabled={fallback} aria-label="Girar para a esquerda">←</button>
      <button type="button" className="secondary" onClick={() => setRot(r => ({ ...r, y: r.y + 0.3 }))} disabled={fallback} aria-label="Girar para a direita">→</button>
      <button type="button" className="secondary" onClick={() => setZoom(z => clamp(z + 0.12, 0.65, 1.6))} disabled={fallback} aria-label="Aproximar">+</button>
      <button type="button" className="secondary" onClick={() => setZoom(z => clamp(z - 0.12, 0.65, 1.6))} disabled={fallback} aria-label="Afastar">−</button>
      <button type="button" className="secondary" onClick={resetCamera} disabled={fallback}>Restaurar vista</button>
    </div>
    <div className="viewer-modes">
      <label><input type="checkbox" checked={lite} onChange={e => setLite(e.target.checked)} /> Qualidade reduzida</label>
      <label><input type="checkbox" checked={twoD} onChange={e => setTwoD(e.target.checked)} /> Prévia 2D</label>
    </div>
    <p className="hint">{fallback ? 'Prévia 2D funcional quando WebGL não está disponível ou foi desativado.' : 'Arraste para girar. Shift + arrastar para mover. Role para zoom. Teclado: setas, Shift+setas, +, -, 0.'}</p>
  </section>;
}
