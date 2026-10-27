// Catálogo com o texto no idioma pedido: os JSON-base (pt-BR) + a sobreposição de data/i18n/en.json.
// Pesado (todos os dados): importe só onde precisa. `guidance` fica em lib/guidance-i18n.ts por ser ainda mais pesado.
import { categories, overlayEn, relatedTo, toolBySlug as baseBySlug, tools } from './catalog.ts'
import { i18n, type Locale } from './i18n.ts'

function localize(locale: Locale) {
  if (locale === 'pt-BR') return { categories, tools }
  return {
    categories: categories.map((c) => ({ ...c, label: overlayEn.categories[c.id] })),
    tools: tools.map((t) => ({ ...t, ...overlayEn.tools[t.slug], subcategory: overlayEn.subcategories[t.subcategory] })),
  }
}

const cache = new Map<Locale, ReturnType<typeof build>>()
function build(locale: Locale) {
  const c = localize(locale)
  return {
    ...i18n(locale),
    ...c,
    toolBySlug: locale === 'pt-BR' ? baseBySlug : new Map(c.tools.map((t) => [t.slug, t])),
    related: (t: (typeof tools)[number], limit?: number) => relatedTo(t, limit, c.tools),
  }
}

/** i18n + catálogo traduzido (memoizado). */
export function full(locale: Locale) {
  if (!cache.has(locale)) cache.set(locale, build(locale))
  return cache.get(locale)!
}
export type Full = ReturnType<typeof full>
