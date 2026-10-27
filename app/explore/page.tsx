import type { Metadata } from 'next'
import ExploreLoader from '@/components/explore/ExploreLoader'

export const metadata: Metadata = { title: 'Explorar' }

export default function ExplorePage() {
  return <ExploreLoader />
}
