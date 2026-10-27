'use client'

import dynamic from 'next/dynamic'
import { useI18n } from '@/components/I18nProvider'

// WebGL só existe no navegador; ssr:false precisa estar num componente cliente.
const ExploreApp = dynamic(() => import('./ExploreApp'), {
  ssr: false,
  loading: () => <Loading />,
})

function Loading() {
  const { t } = useI18n()
  return (
    <div role="status" data-theme="dark" className="fixed inset-0 grid place-items-center bg-bg text-sm text-fg-muted">
      {t.states.loading}…
    </div>
  )
}

export default function ExploreLoader() {
  return <ExploreApp />
}
