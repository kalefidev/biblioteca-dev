"use client";

import { m } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/components/Link";
import { useFull } from "@/components/useFull";
import { ToolCard } from "@/components/site/ToolCard";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FACET_KEYS, SORTS, activeFilterCount, queryTerms, runQuery, type Sort, type View } from "@/lib/search";
import { cardMeta } from "@/lib/catalog";
import { dur, ease } from "@/lib/motion";
import { Facets } from "./Facets";
import { ADVANCED, MAIN, facetGroups, valueLabel } from "./groups";
import { useFilterState } from "./useFilterState";

const PAGE = 24;

const iconProps = { "aria-hidden": true, viewBox: "0 0 16 16", className: "size-4", fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as const;

/** Catálogo com busca, facetas, ordenação e visualização. O estado vive na URL (`?q=&cat=&price=…`). */
export function Catalog({ lockedCategory }: { lockedCategory?: string }) {
  const i = useFull();
  const { t, locale } = i;
  const { params, pathname, state, update, toggle, clearAll } = useFilterState();
  const { results, counts } = useMemo(() => runQuery(state, locale, lockedCategory), [state, locale, lockedCategory]);
  const terms = useMemo(() => queryTerms(state.q), [state.q]);
  const filterCount = activeFilterCount(state);
  const hasCriteria = filterCount > 0 || state.q.trim() !== "";

  // Campo de busca: texto local (resposta imediata) + URL como fonte da verdade.
  const [text, setText] = useState(state.q);
  const written = useRef(state.q);
  useEffect(() => {
    if (state.q !== written.current) {
      written.current = state.q;
      setText(state.q); // mudança externa: voltar do navegador, "limpar filtros"
    }
  }, [state.q]);
  function onSearch(v: string) {
    setText(v);
    written.current = v;
    update((s) => ({ ...s, q: v }), "replace");
  }

  // "Carregar mais": volta ao início quando a consulta muda.
  const key = `${pathname}?${params}`;
  const [more, setMore] = useState({ key, n: PAGE });
  const shown = more.key === key ? more.n : PAGE;
  const visible = results.slice(0, shown);

  // Os cards da primeira pintura substituem os do HTML do servidor: entram parados (animar daria um "piscar" e
  // atrasaria o LCP, que só conta quando o card fica visível). Depois disso, quem entra anima.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Gaveta de filtros (mobile). Fecha se a tela crescer, senão ficaria um modal invisível.
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const close = () => mq.matches && setSheet(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const facets = (
    <Facets
      main={facetGroups(i, MAIN, state, counts, lockedCategory)}
      advanced={facetGroups(i, ADVANCED, state, counts, lockedCategory)}
      onToggle={toggle}
    />
  );

  const chips = FACET_KEYS.flatMap((k) => state.sel[k].map((v) => ({ k, v, label: valueLabel(i, k, v) })));

  return (
    <div className="gap-10 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside aria-label={t.catalog.filters} className="hidden lg:block">
        <a href="#resultados" className="sr-only focus:not-sr-only focus:mb-3 focus:inline-flex focus:h-11 focus:items-center focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-4 focus:text-sm">
          {t.catalog.skipFilters}
        </a>
        <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">{facets}</div>
      </aside>

      <div className="min-w-0">
        <div className="relative">
          <svg {...iconProps} className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-subtle">
            <circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3.5 3.5" />
          </svg>
          <input
            type="search"
            value={text}
            onChange={(e) => onSearch(e.target.value)}
            aria-label={t.catalog.searchLabel}
            placeholder={t.catalog.searchPlaceholder}
            autoComplete="off"
            className="h-14 w-full rounded-xl border border-line bg-surface pr-12 pl-12 text-base transition-colors duration-150 placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {text && (
            <button
              type="button"
              aria-label={t.catalog.clearSearch}
              onClick={() => onSearch("")}
              className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              <svg {...iconProps}><path d="m4 4 8 8M12 4l-8 8" /></svg>
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p role="status" className="mr-auto text-sm text-fg-muted">{t.catalog.results(results.length)}</p>

          <button
            type="button"
            onClick={() => setSheet(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm transition-colors duration-150 hover:border-line-strong lg:hidden"
          >
            <svg {...iconProps}><path d="M2 4h12M4 8h8M6.5 12h3" /></svg>
            {filterCount ? t.catalog.filtersActive(filterCount) : t.catalog.filters}
          </button>

          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="max-sm:sr-only">{t.catalog.sortLabel}</span>
            <select
              value={state.sort}
              onChange={(e) => update((s) => ({ ...s, sort: e.target.value as Sort }), "replace")}
              className="h-11 rounded-lg border border-line bg-surface px-3 text-sm text-fg transition-colors duration-150 hover:border-line-strong"
            >
              {SORTS.map((s) => <option key={s} value={s}>{t.catalog.sort[s]}</option>)}
            </select>
          </label>

          <div role="group" aria-label={t.catalog.viewLabel} className="flex rounded-lg border border-line bg-surface p-0.5">
            {(["grid", "list"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={state.view === v}
                aria-label={v === "grid" ? t.catalog.viewGrid : t.catalog.viewList}
                onClick={() => update((s) => ({ ...s, view: v }), "replace")}
                className="grid size-11 place-items-center rounded-md text-fg-muted transition-colors duration-150 hover:text-fg aria-pressed:bg-surface-2 aria-pressed:text-fg"
              >
                <svg {...iconProps}>
                  {v === "grid" ? <path d="M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z" /> : <path d="M2 4h12M2 8h12M2 12h12" />}
                </svg>
              </button>
            ))}
          </div>
        </div>

        {chips.length > 0 && (
          <ul aria-label={t.catalog.activeFilters} className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <li key={`${c.k}:${c.v}`}>
                <button
                  type="button"
                  aria-label={t.catalog.removeFilter(c.label)}
                  onClick={() => toggle(c.k, c.v)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent-soft pr-2 pl-3 text-sm text-accent transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_16%,var(--bg))]"
                >
                  {c.label}
                  <svg {...iconProps} className="size-3.5"><path d="m4 4 8 8M12 4l-8 8" /></svg>
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="h-8 rounded-md px-2 text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
                {t.catalog.clearFilters}
              </button>
            </li>
          </ul>
        )}

        <div id="resultados" tabIndex={-1} className="mt-6 focus:outline-none">
          {results.length === 0 ? (
            <EmptyState
              title={t.states.emptyTitle}
              hint={t.states.emptyHint}
              action={
                <div className="flex flex-col items-center gap-4">
                  {hasCriteria && (
                    <button type="button" onClick={clearAll} className="h-11 rounded-lg bg-accent px-5 font-medium text-accent-fg transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))]">
                      {t.states.emptyAction}
                    </button>
                  )}
                  <p className="text-sm text-fg-muted">
                    {t.suggest.emptyHint}{" "}
                    <Link href="/suggest" className="inline-flex min-h-11 items-center font-medium text-accent underline-offset-4 hover:underline">{t.suggest.title}</Link>
                  </p>
                </div>
              }
            />
          ) : (
            <>
              <h2 className="sr-only">{t.catalog.resultsHeading}</h2>
              <ul className={state.view === "list" ? "flex flex-col gap-2" : "grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4"}>
                {visible.map((tool, idx) => (
                  // Só quem entra anima (quem já estava na tela fica parado); atraso curto e limitado.
                  <m.li
                    key={tool.slug}
                    initial={mounted ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur.base, ease, delay: Math.min(idx % PAGE, 8) * 0.025 }}
                    className="flex *:flex-1"
                  >
                    <ToolCard tool={tool} {...cardMeta(tool)} layout={state.view === "list" ? "list" : "card"} highlight={terms} />
                  </m.li>
                ))}
              </ul>
              {results.length > shown && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setMore({ key, n: shown + PAGE })}
                    className="h-12 rounded-lg border border-line bg-surface px-6 text-sm font-medium transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
                  >
                    {t.catalog.loadMore(results.length - shown)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={sheet} onClose={() => setSheet(false)} label={t.catalog.filters} variant="sheet">
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex-1 overflow-y-auto px-5 pt-5">{facets}</div>
          <div className="flex gap-3 border-t border-line bg-surface p-4">
            {hasCriteria && (
              <button type="button" onClick={clearAll} className="h-12 rounded-lg border border-line px-4 text-sm">
                {t.catalog.clearFilters}
              </button>
            )}
            <button
              type="button"
              onClick={() => setSheet(false)}
              className="h-12 flex-1 rounded-lg bg-accent font-medium text-accent-fg transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))]"
            >
              {t.catalog.showResults(results.length)}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
