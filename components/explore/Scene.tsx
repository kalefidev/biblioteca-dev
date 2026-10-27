'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ElementRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, CameraControls, Stars, useCursor } from '@react-three/drei'
import { Color, Object3D, Vector3, type InstancedMesh } from 'three'
import { clusters, clusterById, nodes, CLUSTER_R, SPREAD_R, type V3 } from '@/lib/data'

export type Sel = { cat: string | null; tool: string | null }
type Item = { key: string; pos: V3; node: ReactNode; fade?: boolean }

const BG = '#131312' // = --bg do tema escuro (o wrapper do /explore força data-theme="dark")
const R = 0.34
const TAN_HALF_FOV = Math.tan((50 / 2) * (Math.PI / 180))

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const norm = (v: V3): V3 => {
  const l = Math.hypot(...v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** Distância da visão geral: em tela estreita (celular) afasta até a esfera inteira caber na largura. */
const overviewDist = (aspect: number) => Math.max(54, ((SPREAD_R + CLUSTER_R + 2) / Math.sin(Math.atan(TAN_HALF_FOV * aspect))) * 1.08)

const dummy = new Object3D()
const bgColor = new Color(BG)
const baseColors = nodes.map((n) => new Color(clusterById[n.cat].color))
const tmp = new Color()

/** As 64 esferas em um único draw call. Escala e brilho animam por instância; só renderiza (frameloop="demand") enquanto algo muda. */
function Nodes({ sel, lit, hover, setHover, onPick }: {
  sel: Sel; lit: Set<string>; hover: string | null
  setHover: (slug: string | null) => void; onPick: (slug: string) => void
}) {
  const mesh = useRef<InstancedMesh>(null)
  const invalidate = useThree((s) => s.invalidate)
  const cur = useRef(nodes.map(() => ({ s: R, d: 0 })))
  const latest = useRef({ sel, lit, hover })
  useCursor(!!hover)

  // k = fração do caminho até o alvo neste quadro (1 = pula direto). Devolve true enquanto ainda há movimento.
  const step = (k: number) => {
    const m = mesh.current
    if (!m) return false
    const { sel, lit, hover } = latest.current
    let moving = false
    nodes.forEach((n, i) => {
      const c = cur.current[i]
      const dim = !lit.has(n.slug) || (!!sel.cat && sel.cat !== n.cat)
      const ts = (sel.tool === n.slug || hover === n.slug ? 1.5 : dim ? 0.55 : 1) * R
      const td = dim ? 1 : 0
      c.s += (ts - c.s) * k
      c.d += (td - c.d) * k
      if (Math.abs(ts - c.s) > 1e-3 || Math.abs(td - c.d) > 1e-3) moving = true
      dummy.position.set(...n.pos)
      dummy.scale.setScalar(c.s)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, tmp.copy(baseColors[i]).lerp(bgColor, c.d * 0.85)) // apagar = misturar com o fundo
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    return moving
  }

  useLayoutEffect(() => void step(1), [])
  useEffect(() => {
    latest.current = { sel, lit, hover }
    invalidate()
  }, [sel, lit, hover, invalidate])
  useFrame((_, dt) => step(Math.min(1, dt * 8)) && invalidate())

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, nodes.length]}
      frustumCulled={false}
      onClick={(e) => {
        e.stopPropagation()
        const n = nodes[e.instanceId!]
        if (lit.has(n.slug)) onPick(n.slug)
      }}
      onPointerMove={(e) => {
        e.stopPropagation()
        const n = nodes[e.instanceId!]
        setHover(lit.has(n.slug) ? n.slug : null)
      }}
      onPointerOut={() => setHover(null)}
    >
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial roughness={0.4} metalness={0.05} />
    </instancedMesh>
  )
}

function Rig({ sel, dist }: { sel: Sel; dist: number }) {
  const ctrl = useRef<ElementRef<typeof CameraControls>>(null)

  useEffect(() => {
    const c = ctrl.current
    if (!c) return
    const tool = sel.tool ? nodes.find((n) => n.slug === sel.tool) : null
    if (tool) {
      const out = norm(sub(tool.pos, clusterById[tool.cat].pos))
      const p = tool.pos
      c.setLookAt(p[0] + out[0] * 8, p[1] + out[1] * 8 + 1.5, p[2] + out[2] * 8, ...p, true)
    } else if (sel.cat) {
      const p = clusterById[sel.cat].pos
      const out = norm(p)
      // fora do eixo radial, para os nós não ficarem empilhados na linha de visão
      c.setLookAt(p[0] + out[0] * 12 - out[2] * 4, p[1] + out[1] * 12 + 4, p[2] + out[2] * 12 + out[0] * 4, ...p, true)
    } else {
      c.setLookAt(0, dist * 0.11, dist, 0, 0, 0, true)
    }
  }, [sel, dist])

  return <CameraControls ref={ctrl} makeDefault regress minDistance={2.5} maxDistance={dist * 1.6} smoothTime={0.6} />
}

// Posiciona os rótulos DOM sobre os pontos 3D (um <Html> por rótulo quebra no React 19).
function Project({ items, els }: { items: Item[]; els: RefObject<Map<string, HTMLElement>> }) {
  const v = useRef(new Vector3()).current
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => invalidate()) // rótulos novos precisam de um quadro, mesmo com a câmera parada
  useFrame(({ camera, size }) => {
    const cam = camera.position
    const camLen = cam.length() || 1
    for (const { key, pos, fade } of items) {
      const el = els.current.get(key)
      if (!el) continue
      v.set(...pos).project(camera)
      const on = v.z < 1
      el.style.display = on ? '' : 'none'
      if (!on) continue
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * size.width}px, ${(-v.y * 0.5 + 0.5) * size.height}px) translate(-50%, -50%)`
      if (fade) {
        // clusters do outro lado da esfera somem: é o que causava a sobreposição de rótulos na visão geral
        const facing = (pos[0] * cam.x + pos[1] * cam.y + pos[2] * cam.z) / ((Math.hypot(...pos) || 1) * camLen)
        const o = Math.min(1, Math.max(0, (facing + 0.05) / 0.4))
        el.style.opacity = String(o)
        el.style.visibility = o < 0.15 ? 'hidden' : 'visible'
      }
    }
  })
  return null
}

export default function Scene({ sel, lit, filtered, onTool, onCat }: {
  sel: Sel; lit: Set<string>; filtered: boolean; onTool: (slug: string) => void; onCat: (id: string) => void
}) {
  const els = useRef(new Map<string, HTMLElement>())
  const [hover, setHover] = useState<string | null>(null)
  const [aspect, setAspect] = useState(() => innerWidth / innerHeight)
  useEffect(() => {
    const on = () => setAspect(innerWidth / innerHeight)
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  const dist = Math.round(overviewDist(aspect))

  const items: Item[] = []
  for (const c of clusters) {
    if (!sel.tool && !sel.cat) {
      items.push({
        key: c.id,
        pos: [c.pos[0], c.pos[1] + CLUSTER_R + 0.8, c.pos[2]],
        fade: true,
        node: (
          <button
            className="pointer-events-auto relative rounded-full border bg-bg/70 px-3.5 py-1.5 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] text-sm font-medium whitespace-nowrap transition-colors duration-150 hover:bg-(--c) hover:text-bg"
            style={{ ['--c' as string]: c.color, color: c.color, borderColor: c.color }}
            onClick={() => onCat(c.id)}
          >
            {c.label}
          </button>
        ),
      })
    }
    for (const t of c.tools) {
      const on = sel.tool === t.slug
      const show = on || hover === t.slug || (lit.has(t.slug) && (sel.cat === c.id || (filtered && lit.size <= 12)))
      if (show) {
        items.push({
          key: t.slug,
          pos: [t.pos[0], t.pos[1] + 0.7, t.pos[2]],
          node: (
            <span className={`rounded-md border bg-bg/80 px-2 py-0.5 text-xs whitespace-nowrap ${on ? 'border-fg' : 'border-line'}`}>{t.name}</span>
          ),
        })
      }
    }
  }

  return (
    <>
      <Canvas camera={{ position: [0, dist * 0.11, dist], fov: 50 }} dpr={[1, 2]} frameloop="demand" performance={{ min: 0.6 }}>
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, dist, dist + 56]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[-14, 18, 20]} intensity={2.4} />
        <directionalLight position={[16, -8, -18]} intensity={0.8} />
        <Stars radius={100} depth={40} count={2500} factor={3} fade speed={0} />
        <AdaptiveDpr />
        <Rig sel={sel} dist={dist} />
        <Project items={items} els={els} />
        <Nodes sel={sel} lit={lit} hover={hover} setHover={setHover} onPick={onTool} />
      </Canvas>
      <div className="pointer-events-none fixed inset-0 z-[4] overflow-hidden">
        {items.map(({ key, node }) => (
          <div
            key={key}
            className="absolute top-0 left-0 will-change-transform"
            style={{ display: 'none' }}
            ref={(el) => void (el ? els.current.set(key, el) : els.current.delete(key))}
          >
            {node}
          </div>
        ))}
      </div>
    </>
  )
}
