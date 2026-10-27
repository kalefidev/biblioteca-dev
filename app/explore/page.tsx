import type { Metadata } from 'next'
import { Suspense } from 'react'
import { pt } from '@/messages/pt-BR'
import ExploreLoader from '@/components/explore/ExploreLoader'

export const metadata: Metadata = { title: pt.explore.title }

// useSearchParams (filtros na URL) precisa de Suspense.
export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreLoader />
    </Suspense>
  )
}
