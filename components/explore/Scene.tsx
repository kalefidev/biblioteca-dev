'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ElementRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, CameraControls, Stars, useCursor } from '@react-three/drei'
import { BufferGeometry, Color, Float32BufferAttribute, Object3D, Vector3, type InstancedMesh, type LineBasicMaterial } from 'three'
import { useFull } from '@/components/useFull'
import { clusters, clusterById, nodeBySlug, nodes, CLUSTER_R, SPREAD_R, type V3 } from '@/lib/data'

export type Sel = { cat: string | null; tool: string | null }
// rank: 0 = selecionado/hover (sempre aparece), 1 = área ou alternativa, 2 = demais ferramentas.
// center: rótulos do lado de trás da esfera (vista a partir de `center`) somem.
type Item = { key: string; pos: V3; node: ReactNode; rank: 0 | 1 | 2; center?: V3 }

const BG = '#131312' // = --bg do tema escuro (o wrapper do /explore força data-theme="dark")
const FG = '#ecebe6' // = --fg do tema escuro
const R = 0.34
const TAN_HALF_FOV = Math.tan((50 / 2) * (Math.PI / 180))
const ORIGIN: V3 = [0, 0, 0]

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

/** Todas as esferas em um único draw call. Escala e brilho animam por instância; só renderiza (frameloop="demand") enquanto algo muda. */
function Nodes({ sel, lit, alts, hover, setHover, onPick }: {
  sel: Sel; lit: Set<string>; alts: Set<string>; hover: string | null
  setHover: (slug: string | null) => void; onPick: (slug: string) => void
}) {
  const mesh = useRef<InstancedMesh>(null)
  const invalidate = useThree((s) => s.invalidate)
  const cur = useRef(nodes.map(() => ({ s: R, d: 0 })))
  const latest = useRef({ sel, lit, alts, hover })
  useCursor(!!hover)

  // k = fração do caminho até o alvo neste quadro (1 = pula direto). Devolve true enquanto ainda há movimento.
  const step = (k: number) => {
    const m = mesh.current
    if (!m) return false
    const { sel, lit, alts, hover } = latest.current
    let moving = false
    nodes.forEach((n, i) => {
      const c = cur.current[i]
      const dim = !alts.has(n.slug) && (!lit.has(n.slug) || (!!sel.cat && sel.cat !== n.cat))
      const ts = (sel.tool === n.slug || hover === n.slug ? 1.5 : alts.has(n.slug) ? 1.2 : dim ? 0.55 : 1) * R
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
    latest.current = { sel, lit, alts, hover }
    invalidate()
  }, [sel, lit, alts, hover, invalidate])
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

/** Linhas da ferramenta escolhida até as alternativas dela. Aparecem com fade. */
function Links({ from, to }: { from: V3; to: V3[] }) {
  const mat = useRef<LineBasicMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(to.flatMap((p) => [...from, ...p]), 3))
    return g
  }, [from, to])
  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => {
    if (mat.current) mat.current.opacity = 0
    invalidate()
  }, [geo, invalidate])
  useFrame((_, dt) => {
    const m = mat.current
    if (m && m.opacity < 0.4) {
      m.opacity = Math.min(0.4, m.opacity + dt * 0.8)
      invalidate()
    }
  })
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial ref={mat} color={FG} transparent opacity={0} depthWrite={false} />
    </lineSegments>
  )
}

function Rig({ sel, dist }: { sel: Sel; dist: number }) {
  const ctrl = useRef<ElementRef<typeof CameraControls>>(null)
  const intro = useRef(!matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const c = ctrl.current
    if (!c) return
    // Entrada: começa mais longe e se aproxima (só na primeira vez, e nunca com movimento reduzido).
    if (intro.current) {
      intro.current = false
      c.setLookAt(0, dist * 0.35, dist * 1.55, 0, 0, 0, false)
    }
    const tool = sel.tool ? nodeBySlug.get(sel.tool) : null
    // Celular: o painel da ferramenta ocupa a metade de baixo, então a câmera desce e a ferramenta sobe na tela.
    c.setFocalOffset(0, tool && innerWidth < 640 ? 1.5 : 0, 0, true)
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

/**
 * Posiciona os rótulos DOM sobre os pontos 3D (um <Html> por rótulo quebra no React 19) e evita sobreposição:
 * por prioridade e depois do mais perto para o mais longe, um rótulo só aparece se não cobrir outro já posto.
 */
function Project({ items, els, sizes }: { items: Item[]; els: RefObject<Map<string, HTMLElement>>; sizes: RefObject<Map<string, [number, number]>> }) {
  const v = useRef(new Vector3()).current
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => invalidate()) // rótulos novos precisam de um quadro, mesmo com a câmera parada
  useFrame(({ camera, size }) => {
    const cam = camera.position
    const shown: { it: Item; x: number; y: number; z: number; o: number }[] = []
    for (const it of items) {
      const el = els.current.get(it.key)
      if (!el) continue
      v.set(...it.pos).project(camera)
      let o = v.z < 1 ? 1 : 0
      if (o && it.center && it.rank > 0) {
        // do outro lado da esfera (da área ou da ferramenta) o rótulo some: era o que causava a sobreposição
        const d = norm(sub(it.pos, it.center))
        const c = norm([cam.x - it.center[0], cam.y - it.center[1], cam.z - it.center[2]])
        o = Math.min(1, Math.max(0, (d[0] * c[0] + d[1] * c[1] + d[2] * c[2] + 0.05) / 0.4))
      }
      if (o < 0.15) el.style.visibility = 'hidden'
      else shown.push({ it, x: (v.x * 0.5 + 0.5) * size.width, y: (-v.y * 0.5 + 0.5) * size.height, z: v.z, o })
    }
    shown.sort((a, b) => a.it.rank - b.it.rank || a.z - b.z)
    type Box = [number, number, number, number]
    const hits = (b: Box, list: Box[]) => list.some((p) => b[0] < p[2] && b[2] > p[0] && b[1] < p[3] && b[3] > p[1])
    // Controles por cima da cena (busca, barra de áreas, painel): nenhum rótulo aparece embaixo deles.
    const hud = [...document.querySelectorAll('[data-hud]')].map((h): Box => {
      const r = h.getBoundingClientRect()
      return [r.left, r.top, r.right, r.bottom]
    })
    const placed: Box[] = []
    for (const { it, x, y, o } of shown) {
      const el = els.current.get(it.key)!
      const [w, h] = sizes.current.get(it.key) ?? [0, 0]
      const box: Box = [x - w / 2 - 3, y - h / 2 - 2, x + w / 2 + 3, y + h / 2 + 2]
      if (hits(box, hud) || (it.rank > 0 && hits(box, placed))) {
        el.style.visibility = 'hidden'
        continue
      }
      placed.push(box)
      el.style.visibility = 'visible'
      el.style.opacity = String(o)
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }
  })
  return null
}

export default function Scene({ sel, lit, filtered, onTool, onCat }: {
  sel: Sel; lit: Set<string>; filtered: boolean; onTool: (slug: string) => void; onCat: (id: string) => void
}) {
  const { categories, toolBySlug } = useFull()
  const els = useRef(new Map<string, HTMLElement>())
  const sizes = useRef(new Map<string, [number, number]>())
  const [hover, setHover] = useState<string | null>(null)
  const [aspect, setAspect] = useState(() => innerWidth / innerHeight)
  useEffect(() => {
    const on = () => setAspect(innerWidth / innerHeight)
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  const dist = Math.round(overviewDist(aspect))

  const picked = sel.tool ? nodeBySlug.get(sel.tool) : undefined
  const altList = useMemo(
    () => (sel.tool ? (toolBySlug.get(sel.tool)?.alternatives ?? []).filter((s) => nodeBySlug.has(s)) : []),
    [sel.tool, toolBySlug],
  )
  const alts = useMemo(() => new Set(altList), [altList])
  const altPos = useMemo(() => altList.map((s) => nodeBySlug.get(s)!.pos), [altList])

  const items: Item[] = []
  for (const c of clusters) {
    if (!sel.tool && !sel.cat) {
      items.push({
        key: c.id,
        pos: [c.pos[0], c.pos[1] + CLUSTER_R + 0.8, c.pos[2]],
        rank: 1,
        center: ORIGIN,
        node: (
          <button
            className="pointer-events-auto relative rounded-full border bg-bg/70 px-3.5 py-1.5 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] text-sm font-medium whitespace-nowrap transition-colors duration-150 hover:bg-(--c) hover:text-bg"
            style={{ ['--c' as string]: c.color, color: c.color, borderColor: c.color }}
            onClick={() => onCat(c.id)}
          >
            {categories.find((x) => x.id === c.id)!.label}
          </button>
        ),
      })
    }
    for (const t of c.tools) {
      const on = sel.tool === t.slug
      const alt = alts.has(t.slug)
      const show = on || alt || hover === t.slug || (lit.has(t.slug) && (sel.cat === c.id || (filtered && lit.size <= 12)))
      if (show) {
        items.push({
          key: t.slug,
          pos: [t.pos[0], t.pos[1] + 0.7, t.pos[2]],
          rank: on || hover === t.slug ? 0 : alt ? 1 : 2,
          center: alt ? undefined : c.pos,
          node: (
            <span className={`rounded-md border bg-bg/80 px-2 py-0.5 text-xs whitespace-nowrap ${on ? 'border-fg text-fg' : alt ? 'border-line-strong text-fg' : 'border-line text-fg-muted'}`}>
              {t.name}
            </span>
          ),
        })
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 transition-opacity duration-700 ease-out starting:opacity-0">
        <Canvas camera={{ position: [0, dist * 0.11, dist], fov: 50 }} dpr={[1, 2]} frameloop="demand" performance={{ min: 0.6 }}>
          <color attach="background" args={[BG]} />
          <fog attach="fog" args={[BG, dist, dist + 56]} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[-14, 18, 20]} intensity={2.4} />
          <directionalLight position={[16, -8, -18]} intensity={0.8} />
          <Stars radius={100} depth={40} count={2500} factor={3} fade speed={0} />
          <AdaptiveDpr />
          <Rig sel={sel} dist={dist} />
          <Project items={items} els={els} sizes={sizes} />
          <Nodes sel={sel} lit={lit} alts={alts} hover={hover} setHover={setHover} onPick={onTool} />
          {picked && altPos.length > 0 && <Links from={picked.pos} to={altPos} />}
        </Canvas>
      </div>
      <div className="pointer-events-none fixed inset-0 z-[4] overflow-hidden">
        {items.map(({ key, node }) => (
          <div
            key={key}
            className="absolute top-0 left-0 transition-opacity duration-150 will-change-transform"
            style={{ visibility: 'hidden' }}
            ref={(el) => {
              if (!el) return void els.current.delete(key)
              els.current.set(key, el)
              if (!sizes.current.has(key)) sizes.current.set(key, [el.offsetWidth, el.offsetHeight]) // tamanho fixo: mede uma vez
            }}
          >
            {node}
          </div>
        ))}
      </div>
    </>
  )
}
