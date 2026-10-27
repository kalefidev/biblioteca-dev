'use client'

import { useEffect, useRef, useState, type ElementRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, Stars, useCursor } from '@react-three/drei'
import { Vector3, type Mesh, type MeshStandardMaterial } from 'three'
import { categories, catById, matches, CLUSTER_R, type Tool, type V3 } from '@/lib/data'

export type Sel = { cat: string | null; tool: Tool | null }
type Item = { key: string; pos: V3; node: ReactNode }

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const norm = (v: V3): V3 => {
  const l = Math.hypot(...v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

function Node({ tool, color, active, dim, onPick, onHover }: {
  tool: Tool; color: string; active: boolean; dim: boolean
  onPick: (t: Tool) => void; onHover: (name: string | null) => void
}) {
  const mesh = useRef<Mesh>(null)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const set = (h: boolean) => (setHover(h), onHover(h ? tool.name : null))

  // suaviza escala/opacidade sem passar por setState a cada frame
  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    const target = (active ? 1.5 : hover ? 1.5 : dim ? 0.55 : 1) * 0.34
    m.scale.setScalar(m.scale.x + (target - m.scale.x) * Math.min(1, dt * 8))
    const mat = m.material as MeshStandardMaterial
    mat.opacity += ((dim ? 0.18 : 1) - mat.opacity) * Math.min(1, dt * 8)
  })

  return (
    <mesh
      ref={mesh}
      position={tool.pos}
      onClick={(e) => (e.stopPropagation(), onPick(tool))}
      onPointerOver={(e) => (e.stopPropagation(), set(true))}
      onPointerOut={() => set(false)}
    >
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active || hover ? 0.9 : 0.55} roughness={0.35} transparent />
    </mesh>
  )
}

function Rig({ sel }: { sel: Sel }) {
  const ctrl = useRef<ElementRef<typeof CameraControls>>(null)

  useEffect(() => {
    const c = ctrl.current
    if (!c) return
    if (sel.tool) {
      const out = norm(sub(sel.tool.pos, catById[sel.tool.cat].pos))
      const p = sel.tool.pos
      c.setLookAt(p[0] + out[0] * 8, p[1] + out[1] * 8 + 1.5, p[2] + out[2] * 8, ...p, true)
    } else if (sel.cat) {
      const p = catById[sel.cat].pos
      const out = norm(p)
      // fora do eixo radial, para os nós não ficarem empilhados na linha de visão
      c.setLookAt(p[0] + out[0] * 12 - out[2] * 4, p[1] + out[1] * 12 + 4, p[2] + out[2] * 12 + out[0] * 4, ...p, true)
    } else {
      c.setLookAt(0, 6, 54, 0, 0, 0, true)
    }
  }, [sel])

  return <CameraControls ref={ctrl} makeDefault minDistance={2.5} maxDistance={80} smoothTime={0.6} />
}

// Posiciona os rótulos DOM sobre os pontos 3D (um <Html> por rótulo quebra no React 19).
function Project({ items, els }: { items: Item[]; els: RefObject<Map<string, HTMLElement>> }) {
  const v = useRef(new Vector3()).current
  useFrame(({ camera, size }) => {
    for (const { key, pos } of items) {
      const el = els.current.get(key)
      if (!el) continue
      v.set(...pos).project(camera)
      const on = v.z < 1
      el.style.display = on ? '' : 'none'
      if (on) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * size.width}px, ${(-v.y * 0.5 + 0.5) * size.height}px) translate(-50%, -50%)`
    }
  })
  return null
}

export default function Scene({ sel, query, onTool, onCat }: {
  sel: Sel; query: string; onTool: (t: Tool) => void; onCat: (id: string) => void
}) {
  const els = useRef(new Map<string, HTMLElement>())
  const [hover, setHover] = useState<string | null>(null)

  const items: Item[] = []
  for (const c of categories) {
    const focused = sel.cat === c.id
    if (!sel.tool && !sel.cat) {
      items.push({
        key: c.id,
        pos: [c.pos[0], c.pos[1] + CLUSTER_R + 0.8, c.pos[2]],
        node: <button className="cluster" style={{ ['--c' as string]: c.color }} onClick={() => onCat(c.id)}>{c.label}</button>,
      })
    }
    for (const t of c.tools) {
      const on = sel.tool?.name === t.name
      if (matches(t, query) && (focused || on || hover === t.name || !!query)) {
        items.push({ key: t.name, pos: [t.pos[0], t.pos[1] + 0.7, t.pos[2]], node: <span className={`tag${on ? ' on' : ''}`}>{t.name}</span> })
      }
    }
  }

  return (
    <>
      <Canvas camera={{ position: [0, 6, 54], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#0b0d12']} />
        <fog attach="fog" args={['#0b0d12', 55, 110]} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={40} count={2500} factor={3} fade speed={0.4} />
        <Rig sel={sel} />
        <Project items={items} els={els} />
        {categories.map((c) =>
          c.tools.map((t) => (
            <Node
              key={t.name}
              tool={t}
              color={c.color}
              active={sel.tool?.name === t.name}
              dim={!matches(t, query) || (!!sel.cat && sel.cat !== c.id)}
              onPick={onTool}
              onHover={setHover}
            />
          )),
        )}
      </Canvas>
      <div className="labels">
        {items.map(({ key, node }) => (
          <div
            key={key}
            className="lbl"
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
