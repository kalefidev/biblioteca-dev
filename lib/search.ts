// Busca fuzzy + filtros por faceta + ordenação. Lógica pura (sem React), roda no navegador.
import MiniSearch from 'minisearch'
import { categories, metrics, tools } from './catalog.ts'
import { full } from './catalog-i18n.ts'
import type { Locale } from './i18n.ts'
import { fold, queryTerms } from './text.ts'
import type { Tool } from './schema.ts'

export const FACET_KEYS = ['cat', 'kind', 'price', 'lic', 'plat', 'lang', 'tag'] as const
export type FacetKey = (typeof FACET_KEYS)[number]
export const SORTS = ['relevance', 'popular', 'recent', 'az'] as const
export type Sort = (typeof SORTS)[number]
export type View = 'grid' | 'list'

export type CatalogState = { q: string; sel: Record<FacetKey, string[]>; sort: Sort; view: View }

const getters: Record<FacetKey, (t: Tool) => string[]> = {
  cat: (t) => [t.category],
  kind: (t) => [t.kind],
  price: (t) => [t.pricing],
  lic: (t) => [t.license],
  plat: (t) => t.platforms,
  lang: (t) => t.languages,
  tag: (t) => t.tags,
}

export { fold, queryTerms }

// ---------- URL <-> estado ----------
export function parseState(params: URLSearchParams): CatalogState {
  const sort = params.get('sort') as Sort
  return {
    q: params.get('q') ?? '',
    sel: Object.fromEntries(FACET_KEYS.map((k) => [k, params.getAll(k)])) as CatalogState['sel'],
    sort: SORTS.includes(sort) ? sort : 'relevance',
    view: params.get('view') === 'list' ? 'list' : 'grid',
  }
}

/** Só grava o que difere do padrão, para a URL ficar curta. */
export function serializeState(s: CatalogState) {
  const p = new URLSearchParams()
  if (s.q.trim()) p.set('q', s.q)
  for (const k of FACET_KEYS) for (const v of s.sel[k]) p.append(k, v)
  if (s.sort !== 'relevance') p.set('sort', s.sort)
  if (s.view !== 'grid') p.set('view', s.view)
  return p.toString()
}

export const activeFilterCount = (s: CatalogState) => FACET_KEYS.reduce((n, k) => n + s.sel[k].length, 0)

// ---------- índice de busca ----------
// Um índice por idioma: tagline, descrição e subcategoria mudam com a tradução.
const indexes = new Map<Locale, MiniSearch>()
function getIndex(locale: Locale) {
  let index = indexes.get(locale)
  if (!index) {
    index = new MiniSearch({
      idField: 'slug',
      fields: ['name', 'tags', 'subcategory', 'tagline', 'description'],
      processTerm: fold,
      storeFields: ['name'],
    })
    index.addAll(full(locale).tools.map((t) => ({ ...t, tags: t.tags.join(' ') })))
    indexes.set(locale, index)
  }
  return index
}

/** slug -> relevância. Nome pesa mais que tag, que pesa mais que descrição; nome idêntico à busca vem primeiro, depois nome que começa com ela. */
export function searchScores(q: string, locale: Locale) {
  const exact = fold(q.trim())
  const hits = getIndex(locale).search(q, {
    boost: { name: 5, tags: 3, subcategory: 2 },
    prefix: true,
    fuzzy: (term) => (term.length > 3 ? 0.2 : false),
    combineWith: 'AND',
  })
  return new Map(hits.map((h) => [h.id as string, h.score * (fold(h.name) === exact ? 100 : fold(h.name).startsWith(exact) ? 10 : 1)]))
}

// ---------- consulta ----------
const stars = (t: Tool) => metrics[t.slug]?.stars ?? -1
const byName = (a: Tool, b: Tool) => a.name.localeCompare(b.name)

export function runQuery(state: CatalogState, locale: Locale, lockedCategory?: string) {
  const scores = state.q.trim() ? searchScores(state.q, locale) : null
  const pool = full(locale).tools.filter((t) => (!lockedCategory || t.category === lockedCategory) && (!scores || scores.has(t.slug)))
  // OR dentro da faceta, AND entre facetas; `skip` ignora a própria faceta ao contar suas opções.
  const matches = (t: Tool, skip?: FacetKey) =>
    FACET_KEYS.every((k) => k === skip || !state.sel[k].length || getters[k](t).some((v) => state.sel[k].includes(v)))

  const sorters: Record<Sort, (a: Tool, b: Tool) => number> = {
    relevance: scores
      ? (a, b) => scores.get(b.slug)! - scores.get(a.slug)! || stars(b) - stars(a)
      : (a, b) => Number(b.featured) - Number(a.featured) || stars(b) - stars(a) || byName(a, b),
    popular: (a, b) => stars(b) - stars(a) || byName(a, b),
    recent: (a, b) => (metrics[b.slug]?.lastCommit ?? '').localeCompare(metrics[a.slug]?.lastCommit ?? '') || byName(a, b),
    az: byName,
  }

  const counts = {} as Record<FacetKey, Map<string, number>>
  for (const k of FACET_KEYS) {
    counts[k] = new Map()
    for (const t of pool) if (matches(t, k)) for (const v of getters[k](t)) counts[k].set(v, (counts[k].get(v) ?? 0) + 1)
  }
  return { results: pool.filter((t) => matches(t)).sort(sorters[state.sort]), counts }
}

// ---------- opções de cada faceta (fixas; só as contagens mudam) ----------
function optionsFor(k: FacetKey) {
  if (k === 'cat') return categories.map((c) => c.id)
  const total = new Map<string, number>()
  for (const t of tools) for (const v of getters[k](t)) total.set(v, (total.get(v) ?? 0) + 1)
  return [...total]
    .filter(([, n]) => k !== 'tag' || n >= 2) // 67 tags, quase todas únicas: só as que agrupam algo
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([v]) => v)
}
export const facetOptions = Object.fromEntries(FACET_KEYS.map((k) => [k, optionsFor(k)])) as Record<FacetKey, string[]>
