import type { Metadata } from 'next'
import ExploreApp from '@/components/explore/ExploreApp'
import { alternates } from '@/lib/i18n'
import { getI18n } from '@/lib/i18n-server'
import { pixelFont } from '@/lib/pixel-font'

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n()
  return { title: t.explore.title, alternates: alternates(locale, '/explore') }
}

// Sem WebGL: a vila é HTML comum, pré-renderizado no servidor (os filtros da URL entram na hidratação).
export default function ExplorePage() {
  return (
    <div className={pixelFont.variable}>
      <ExploreApp />
    </div>
  )
}
