'use client'

import dynamic from 'next/dynamic'

// WebGL só existe no navegador; ssr:false precisa estar num componente cliente.
const ExploreApp = dynamic(() => import('./ExploreApp'), { ssr: false })

export default function ExploreLoader() {
  return <ExploreApp />
}
