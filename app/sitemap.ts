import type { MetadataRoute } from 'next'
import { metrics, tools, categories } from '@/lib/catalog'
import { LOCALES, alternates, localePath } from '@/lib/i18n'
import { SITE_URL } from '@/lib/site'

// Uma entrada por idioma, cada uma apontando as outras via hreflang.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, string?][] = [
    ['/'],
    ['/tools'],
    ['/explore'],
    ['/privacy'],
    ...categories.map((c): [string] => [`/c/${c.id}`]),
    ...tools.map((t): [string, string?] => [`/t/${t.slug}`, metrics[t.slug]?.updatedAt]),
  ]
  return pages.flatMap(([path, lastModified]) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      ...(lastModified && { lastModified }),
      alternates: { languages: Object.fromEntries(Object.entries(alternates(locale, path).languages).map(([l, p]) => [l, `${SITE_URL}${p}`])) },
    })),
  )
}
