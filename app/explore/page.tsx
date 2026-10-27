import type { Metadata } from 'next'
import { pt } from '@/messages/pt-BR'
import ExploreLoader from '@/components/explore/ExploreLoader'

export const metadata: Metadata = { title: pt.explore.title }

export default function ExplorePage() {
  return <ExploreLoader />
}
