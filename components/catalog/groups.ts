import { facetOptions, runQuery, type CatalogState, type FacetKey } from "@/lib/search";
import type { Full } from "@/lib/catalog-i18n";
import type { FacetGroup } from "./Facets";

export const MAIN: FacetKey[] = ["cat", "kind", "price"];
export const ADVANCED: FacetKey[] = ["plat", "lang", "lic", "tag"];

export function valueLabel({ t, categories }: Full, key: FacetKey, value: string) {
  switch (key) {
    case "cat": return categories.find((c) => c.id === value)?.label ?? value;
    case "kind": return t.kind[value as keyof typeof t.kind] ?? value;
    case "price": return t.pricing[value as keyof typeof t.pricing] ?? value;
    case "plat": return t.platform[value as keyof typeof t.platform] ?? value;
    case "lang": return t.language[value] ?? value;
    default: return value;
  }
}

/** Grupos de checkbox para `Facets` (catálogo e modo Explorar usam os mesmos). */
export function facetGroups(
  i: Full, keys: FacetKey[], state: CatalogState, counts: ReturnType<typeof runQuery>["counts"], lockedCategory?: string,
): FacetGroup[] {
  return keys
    .filter((k) => !(k === "cat" && lockedCategory))
    .map((k) => {
      const selected = state.sel[k];
      const values = [...facetOptions[k], ...selected.filter((v) => !facetOptions[k].includes(v))];
      return {
        key: k,
        label: i.t.catalog.facet[k],
        options: values.map((v) => ({ value: v, label: valueLabel(i, k, v), count: counts[k].get(v) ?? 0, checked: selected.includes(v) })),
      };
    });
}
