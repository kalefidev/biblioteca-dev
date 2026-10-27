'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Color, Object3D, type Group, type InstancedMesh } from 'three'
import { clusterById, nodes } from '@/lib/data'

const dummy = new Object3D()

/** As ferramentas como nuvem de esferas que gira devagar e segue o mouse. Decorativo (aria-hidden). */
function Cloud({ pointer }: { pointer: { current: { x: number; y: number } } }) {
  const group = useRef<Group>(null)
  const mesh = useRef<InstancedMesh>(null)
  const spin = useRef(0)

  useLayoutEffect(() => {
    const m = mesh.current!
    const c = new Color()
    nodes.forEach((n, i) => {
      dummy.position.set(...n.pos)
      dummy.scale.setScalar(0.5)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, c.set(clusterById[n.cat].color))
    })
  }, [])

  useFrame((_, dt) => {
    const g = group.current!
    const k = Math.min(1, dt * 2.5)
    spin.current += dt * 0.06
    g.rotation.y += (spin.current + pointer.current.x * 0.6 - g.rotation.y) * k
    g.rotation.x += (pointer.current.y * 0.35 - g.rotation.x) * k
  })

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial roughness={0.4} metalness={0.05} />
      </instancedMesh>
    </group>
  )
}

export default function HeroGalaxy() {
  const box = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1
    }
    addEventListener('pointermove', onMove, { passive: true })
    // Fora da tela ou aba em segundo plano: para de renderizar.
    let inView = true
    const sync = () => setVisible(inView && !document.hidden)
    const io = new IntersectionObserver(([e]) => ((inView = e.isIntersecting), sync()))
    io.observe(box.current!)
    document.addEventListener('visibilitychange', sync)
    return () => {
      removeEventListener('pointermove', onMove)
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-3/5transition-opacity duration-1000 [mask-image:radial-gradient(closest-side,black_60%,transparent)] starting:opacity-0"
    >
      <Canvas
        camera={{ position: [0, 4, 58], fov: 40 }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[-14, 18, 20]} intensity={2.4} />
        <directionalLight position={[16, -8, -18]} intensity={0.8} />
        <Cloud pointer={pointer} />
      </Canvas>
    </div>
  )
}
