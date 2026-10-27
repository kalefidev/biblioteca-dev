'use client'

import { AnimatePresence } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from '@/components/Link'
import { useFull } from '@/components/useFull'
import { Facets } from '@/components/catalog/Facets'
import { ADVANCED, MAIN, facetGroups } from '@/components/catalog/groups'
import { useFilterState } from '@/components/catalog/useFilterState'
import { Dialog } from '@/components/ui/Dialog'
import { activeFilterCount, runQuery, serializeState } from '@/lib/search'
import { clusters, nodeBySlug, nodes } from '@/lib/data'
import { detect3D } from '@/lib/gl'
import { Fallback2D } from './Fallback2D'
import Scene, { type Sel } from './Scene'
import { ToolPanel } from './ToolPanel'

export default function ExploreApp() {
  const i = useFull()
  const { t, locale, categories } = i
  const { state, update, toggle, clearAll } = useFilterState()
  const [sel, setSel] = useState<Sel>({ cat: null, tool: null })
  const [filters, setFilters] = useState(false)
  const [mode] = useState(detect3D) // só roda no navegador (este componente é carregado com ssr:false)
  const [choice, setChoice] = useState<'2d' | '3d' | null>(null) // escolha explícita do usuário
  const flat = choice ? choice === '2d' : mode !== 'ok'

  const { results, counts } = useMemo(() => runQuery(state, locale), [state, locale])
  const lit = useMemo(() => new Set(results.map((t) => t.slug)), [results])
  const filterCount = activeFilterCount(state)
  const filtered = filterCount > 0 || state.q.trim() !== ''

  const home = () => setSel({ cat: null, tool: null })
  const pickCat = (id: string) => setSel({ cat: id, tool: null })
  const pickTool = (slug: string) => setSel({ cat: nodeBySlug.get(slug)!.cat, tool: slug })
  const back = () => (sel.tool ? pickCat(sel.cat!) : home())

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && !filters && back()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const catalogQs = serializeState({ ...state, sort: 'relevance', view: 'grid' })

  return (
    <main id="content" className="fixed inset-0 overflow-hidden bg-bg text-fg" data-theme="dark">
      {flat ? (
        <Fallback2D sel={sel} lit={lit} onTool={pickTool} onCat={pickCat} />
      ) : (
        <Scene sel={sel} lit={lit} filtered={filtered} onTool={pickTool} onCat={pickCat} />
      )}

      <header data-hud className="fixed top-4 left-4 z-5 w-[min(22rem,calc(100vw-2rem))]">
        <Link href="/" className="inline-flex h-11 items-center text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
          ← {t.explore.back}
        </Link>
        <p role="status" className="mb-3 text-xs text-fg-subtle">
          {t.explore.count(results.length, nodes.length)}
          {!flat && <span className="max-sm:hidden"> · {t.explore.hint3d}</span>}
        </p>
        <div className="flex gap-2">
          <input
            type="search"
            value={state.q}
            onChange={(e) => update((s) => ({ ...s, q: e.target.value }), 'replace')}
            onKeyDown={(e) => e.key === 'Enter' && results[0] && pickTool(results[0].slug)}
            placeholder={t.explore.searchPlaceholder}
            aria-label={t.explore.searchLabel}
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 text-sm placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={() => setFilters(true)}
            className="h-11 shrink-0 rounded-xl border border-line bg-surface px-4 text-sm transition-colors duration-150 hover:border-line-strong"
          >
            {filterCount ? t.catalog.filtersActive(filterCount) : t.catalog.filters}
          </button>
        </div>
        {results.length === 0 && <p className="mt-3 rounded-lg bg-surface/90 px-3 py-2 text-sm text-fg-muted">{t.explore.noMatch}</p>}
        <p className="mt-3 text-xs text-fg-subtle">
          {flat && mode !== 'ok' && `${t.explore.flat[mode]} `}
          {mode !== 'no-webgl' && (
            <button type="button" onClick={() => setChoice(flat ? '3d' : '2d')} className="inline-flex h-11 items-center underline underline-offset-4 hover:text-fg">
              {flat ? (mode === 'ok' ? t.explore.view3d : t.explore.enable3d) : t.explore.view2d}
            </button>
          )}
        </p>
      </header>

      <nav data-hud
        aria-label={t.explore.categoriesLabel}
        className="fixed bottom-4 left-1/2 z-5 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-2xl border border-line bg-surface/85 p-1.5 backdrop-blur [scrollbar-width:none]"
      >
        <button type="button" aria-pressed={!sel.cat} onClick={home} className={chip}>{t.explore.overview}</button>
        {clusters.map((c) => (
          <button key={c.id} type="button" aria-pressed={sel.cat === c.id} onClick={() => pickCat(c.id)} className={chip}>
            <i aria-hidden className="size-2 rounded-full" style={{ background: c.color }} /> {categories.find((x) => x.id === c.id)!.label}
          </button>
        ))}
      </nav>

      <AnimatePresence>{sel.tool && <ToolPanel key={sel.tool} slug={sel.tool} onClose={back} onPick={pickTool} />}</AnimatePresence>

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

const chip =
  'flex h-11 items-center gap-2 rounded-xl px-3.5 text-sm whitespace-nowrap text-fg-muted transition-colors duration-150 hover:text-fg aria-pressed:bg-surface-2 aria-pressed:text-fg'
