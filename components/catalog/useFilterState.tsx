"use client";

import { Suspense, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { publicPath } from "@/lib/i18n";
import { parseState, serializeState, type CatalogState, type FacetKey } from "@/lib/search";

const CHANGE = "filterchange";
const subscribe = (cb: () => void) => {
  addEventListener("popstate", cb);
  addEventListener(CHANGE, cb);
  return () => {
    removeEventListener("popstate", cb);
    removeEventListener(CHANGE, cb);
  };
};

/**
 * Estado de busca/filtros na URL (`?q=&cat=&price=…`), compartilhado pelo catálogo e pelo modo Explorar.
 * Lê `location.search` direto (não `useSearchParams`): assim a página é pré-renderizada com a lista padrão e o cliente
 * hidrata no mesmo HTML, sem um Suspense trocando os cards. Na hidratação vale "" (igual ao servidor); logo depois, a URL real.
 * Quem usa o hook precisa renderizar <FilterUrlSync /> para ouvir navegações do Next na mesma página.
 */
export function useFilterState() {
  const search = useSyncExternalStore(subscribe, () => location.search, () => "");
  const pathname = publicPath(usePathname());
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const state = useMemo(() => parseState(params), [params]);

  // Lê a URL na hora de gravar, assim digitação rápida nunca usa um estado velho.
  function update(fn: (s: CatalogState) => CatalogState, mode: "push" | "replace" = "push") {
    const qs = serializeState(fn(parseState(new URLSearchParams(location.search))));
    history[mode === "push" ? "pushState" : "replaceState"](null, "", qs ? `${pathname}?${qs}` : pathname);
    dispatchEvent(new Event(CHANGE));
  }
  const toggle = (key: FacetKey, value: string) =>
    update((s) => ({ ...s, sel: { ...s.sel, [key]: s.sel[key].includes(value) ? s.sel[key].filter((v) => v !== value) : [...s.sel[key], value] } }));
  const clearAll = () => update((s) => ({ ...parseState(new URLSearchParams()), sort: s.sort, view: s.view }));

  return { params, pathname, state, update, toggle, clearAll };
}

// Navegação do Next para a mesma página com outra query (ex.: Ctrl+K → "ver todos os resultados") não dispara popstate.
function Watch() {
  const params = useSearchParams();
  useEffect(() => void dispatchEvent(new Event(CHANGE)), [params]);
  return null;
}
export const FilterUrlSync = () => (
  <Suspense fallback={null}>
    <Watch />
  </Suspense>
);
