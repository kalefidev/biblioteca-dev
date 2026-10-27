import type { Metadata } from 'next'
import { Suspense } from 'react'
import ExploreLoader from '@/components/explore/ExploreLoader'
import { alternates } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n-server'

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n()
  return { title: t.explore.title, alternates: alternates(locale, '/explore') }
}

// useSearchParams (filtros na URL) precisa de Suspense.
export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreLoader />
    </Suspense>
  )
}
