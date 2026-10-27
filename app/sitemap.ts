import type { MetadataRoute } from 'next'
import { categories, metrics, tools } from '@/lib/catalog'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, lastModified?: string) => ({ url: `${SITE_URL}${path}`, ...(lastModified && { lastModified }) })
  return [
    at(''),
    at('/tools'),
    at('/explore'),
    at('/privacidade'),
    ...categories.map((c) => at(`/c/${c.id}`)),
    ...tools.map((t) => at(`/t/${t.slug}`, metrics[t.slug]?.updatedAt)),
  ]
}
