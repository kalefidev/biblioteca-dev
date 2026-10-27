"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { publicPath } from "@/lib/i18n";
import { parseState, serializeState, type CatalogState, type FacetKey } from "@/lib/search";

/** Estado de busca/filtros na URL (`?q=&cat=&price=…`), compartilhado pelo catálogo e pelo modo Explorar. */
export function useFilterState() {
  const params = useSearchParams();
  const pathname = publicPath(usePathname());
  const state = useMemo(() => parseState(params), [params]);

  // Lê a URL na hora de gravar, assim digitação rápida nunca usa um estado velho.
  function update(fn: (s: CatalogState) => CatalogState, mode: "push" | "replace" = "push") {
    const qs = serializeState(fn(parseState(new URLSearchParams(window.location.search))));
    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", qs ? `${pathname}?${qs}` : pathname);
  }
  const toggle = (key: FacetKey, value: string) =>
    update((s) => ({ ...s, sel: { ...s.sel, [key]: s.sel[key].includes(value) ? s.sel[key].filter((v) => v !== value) : [...s.sel[key], value] } }));
  const clearAll = () => update((s) => ({ ...parseState(new URLSearchParams()), sort: s.sort, view: s.view }));

  return { params, pathname, state, update, toggle, clearAll };
}
