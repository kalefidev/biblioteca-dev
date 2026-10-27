'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { detect3D } from '@/lib/gl'

// O chunk (three + R3F) só é baixado depois do load e com a main thread ociosa: não entra no LCP.
const HeroGalaxy = dynamic(() => import('./HeroGalaxy'), { ssr: false })

/** Prévia 3D atrás do hero. Só em tela larga e dispositivo capaz; nos demais casos o hero 2D já está completo. */
export function HeroGalaxyLoader() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!matchMedia('(min-width: 768px)').matches || detect3D() !== 'ok') return
    let cancel = () => {}
    const schedule = () => {
      const go = () => setOn(true)
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(go, { timeout: 3000 })
        cancel = () => cancelIdleCallback(id)
      } else {
        const id = setTimeout(go, 1500)
        cancel = () => clearTimeout(id)
      }
    }
    if (document.readyState === 'complete') schedule()
    else addEventListener('load', schedule, { once: true })
    return () => {
      removeEventListener('load', schedule)
      cancel()
    }
  }, [])

  return on ? <HeroGalaxy /> : null
}
