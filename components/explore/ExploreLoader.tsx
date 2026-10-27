'use client'

import dynamic from 'next/dynamic'
import { pt } from '@/messages/pt-BR'

// WebGL só existe no navegador; ssr:false precisa estar num componente cliente.
const ExploreApp = dynamic(() => import('./ExploreApp'), {
  ssr: false,
  loading: () => (
    <div role="status" data-theme="dark" className="fixed inset-0 grid place-items-center bg-bg text-sm text-fg-muted">
      {pt.states.loading}…
    </div>
  ),
})

export default function ExploreLoader() {
  return <ExploreApp />
}
