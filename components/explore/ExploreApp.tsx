'use client'

import { AnimatePresence } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@/components/Link'
import { useFull } from '@/components/useFull'
import { Facets } from '@/components/catalog/Facets'
import { ADVANCED, MAIN, facetGroups } from '@/components/catalog/groups'
import { FilterUrlSync, useFilterState } from '@/components/catalog/useFilterState'
import { Dialog } from '@/components/ui/Dialog'
import { activeFilterCount, runQuery, serializeState } from '@/lib/search'
import { EquipBar } from './EquipBar'
import { Shop } from './Shop'
import { Village } from './Village'

type Sel = { cat: string | null; tool: string | null }

export default function ExploreApp() {
  const i = useFull()
  const { t, locale, tools, toolBySlug } = i
  const { state, update, toggle, clearAll } = useFilterState()
  const [sel, setSel] = useState<Sel>({ cat: null, tool: null })
  const [filters, setFilters] = useState(false)

  const { results, counts } = useMemo(() => runQuery(state, locale), [state, locale])
  const perCat = useMemo(() => {
    const m = new Map<string, number>()
    for (const x of results) m.set(x.category, (m.get(x.category) ?? 0) + 1)
    return m
  }, [results])
  const filterCount = activeFilterCount(state)
  const filtered = filterCount > 0 || state.q.trim() !== ''

  const home = () => setSel({ cat: null, tool: null })
  const pickCat = (id: string) => setSel({ cat: id, tool: null })
  const pickTool = (slug: string) => setSel({ cat: toolBySlug.get(slug)!.category, tool: slug })
  const back = () => (sel.tool ? pickCat(sel.cat!) : home())

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && !filters && back()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  // Ao fechar uma camada, o foco volta para quem a abriu (slot do item ou prédio).
  const prev = useRef(sel)
  useEffect(() => {
    const p = prev.current
    prev.current = sel
    if (p.tool && !sel.tool && p.cat === sel.cat) document.getElementById(`slot-${p.tool}`)?.focus()
    else if (p.cat && !sel.cat) document.getElementById(`bld-${p.cat}`)?.focus()
  }, [sel])

  const catalogQs = serializeState({ ...state, sort: 'relevance', view: 'grid' })

  return (
    <main id="content" className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <FilterUrlSync />
      <header className="relative z-20 shrink-0 border-b border-line bg-surface px-3 py-2 sm:px-6">
        <h1 className="sr-only">{t.explore.title}</h1>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4">
          <Link href="/" className="inline-flex h-11 items-center text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            ← {t.explore.back}
          </Link>
          <p role="status" className="text-xs text-fg-subtle lg:order-last lg:basis-full lg:pb-1">
            {results.length === 0 ? t.explore.noMatch : t.explore.count(results.length, tools.length)}
            <span className="max-sm:hidden"> · {t.explore.hint}</span>
          </p>
          <div className="flex w-full gap-2 py-2 lg:ml-auto lg:w-auto lg:max-w-md lg:flex-1">
            <input
              type="search"
              value={state.q}
              onChange={(e) => update((s) => ({ ...s, q: e.target.value }), 'replace')}
              onKeyDown={(e) => e.key === 'Enter' && results[0] && pickTool(results[0].slug)}
              placeholder={t.explore.searchPlaceholder}
              aria-label={t.explore.searchLabel}
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-4 text-sm placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => setFilters(true)}
              className="h-11 shrink-0 rounded-xl border border-line bg-bg px-4 text-sm transition-colors duration-150 hover:border-line-strong"
            >
              {filterCount ? t.catalog.filtersActive(filterCount) : t.catalog.filters}
            </button>
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div inert={!!sel.cat} className="village absolute inset-0 overflow-auto">
          <Village counts={perCat} onCat={pickCat} />
        </div>
        {sel.cat && <div aria-hidden className="absolute inset-0 z-10 bg-bg/60" onClick={home} />}
        <AnimatePresence>
          {sel.cat && (
            <Shop
              key={sel.cat}
              cat={sel.cat}
              items={results.filter((x) => x.category === sel.cat)}
              tool={sel.tool}
              onPick={pickTool}
              onClose={home}
              onCloseTool={() => pickCat(sel.cat!)}
              onClear={clearAll}
            />
          )}
        </AnimatePresence>
      </div>

      <EquipBar onOpen={(cat, slug) => setSel({ cat, tool: slug ?? null })} />

      <Dialog open={filters} onClose={() => setFilters(false)} label={t.catalog.filters}>
        <div className="flex max-h-[76dvh] flex-col">
          <div className="flex-1 overflow-y-auto px-5 pt-5">
            <Facets main={facetGroups(i, MAIN, state, counts)} advanced={facetGroups(i, ADVANCED, state, counts)} onToggle={toggle} />
          </div>
          <div className="flex gap-3 border-t border-line bg-surface p-4">
            {filtered && (
              <button type="button" onClick={clearAll} className="h-12 rounded-lg border border-line px-4 text-sm">
                {t.catalog.clearFilters}
              </button>
            )}
            <button
              type="button"
              onClick={() => setFilters(false)}
              className="h-12 flex-1 rounded-lg bg-accent font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90"
            >
              {t.catalog.showResults(results.length)}
            </button>
          </div>
          {filtered && (
            <Link href={`/tools?${catalogQs}`} className="border-t border-line px-4 py-3 text-center text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
              {t.explore.seeInCatalog(results.length)}
            </Link>
          )}
        </div>
      </Dialog>
    </main>
  )
}
