import { categories } from "@/lib/catalog";
import { facetOptions, runQuery, type CatalogState, type FacetKey } from "@/lib/search";
import { pt } from "@/messages/pt-BR";
import type { FacetGroup } from "./Facets";

export const MAIN: FacetKey[] = ["cat", "kind", "price"];
export const ADVANCED: FacetKey[] = ["plat", "lang", "lic", "tag"];

export function valueLabel(key: FacetKey, value: string) {
  switch (key) {
    case "cat": return categories.find((c) => c.id === value)?.label ?? value;
    case "kind": return pt.kind[value as keyof typeof pt.kind] ?? value;
    case "price": return pt.pricing[value as keyof typeof pt.pricing] ?? value;
    case "plat": return pt.platform[value as keyof typeof pt.platform] ?? value;
    case "lang": return pt.language[value] ?? value;
    default: return value;
  }
}

/** Grupos de checkbox para `Facets` (catálogo e modo Explorar usam os mesmos). */
export function facetGroups(
  keys: FacetKey[], state: CatalogState, counts: ReturnType<typeof runQuery>["counts"], lockedCategory?: string,
): FacetGroup[] {
  return keys
    .filter((k) => !(k === "cat" && lockedCategory))
    .map((k) => {
      const selected = state.sel[k];
      const values = [...facetOptions[k], ...selected.filter((v) => !facetOptions[k].includes(v))];
      return {
        key: k,
        label: pt.catalog.facet[k],
        options: values.map((v) => ({ value: v, label: valueLabel(k, v), count: counts[k].get(v) ?? 0, checked: selected.includes(v) })),
      };
    });
}
