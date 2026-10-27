"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import type { FacetKey } from "@/lib/search";

export type FacetGroup = {
  key: FacetKey;
  label: string;
  options: { value: string; label: string; count: number; checked: boolean }[];
};

const VISIBLE = 8; // cabe as 8 categorias e os 8 tipos sem "ver todos"

function Group({ group, onToggle }: { group: FacetGroup; onToggle: (key: FacetKey, value: string) => void }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  // Opções marcadas nunca ficam escondidas atrás do "ver todos".
  const shown = expanded ? group.options : group.options.filter((o, i) => i < VISIBLE || o.checked);
  const hidden = group.options.length - shown.length;

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-xs font-medium tracking-wide text-fg-subtle uppercase">{group.label}</legend>
      <ul>
        {shown.map((o) => (
          <li key={o.value}>
            <label className="-mx-2 flex h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm transition-colors duration-150 hover:bg-surface-2 has-disabled:cursor-default has-disabled:opacity-45 has-disabled:hover:bg-transparent lg:h-9">
              <input
                type="checkbox"
                className="size-4 shrink-0 accent-accent"
                checked={o.checked}
                disabled={!o.checked && o.count === 0}
                onChange={() => onToggle(group.key, o.value)}
              />
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              <span className="font-mono text-xs text-fg-subtle tabular-nums">{o.count}</span>
            </label>
          </li>
        ))}
      </ul>
      {(hidden > 0 || expanded) && group.options.length > VISIBLE && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="-mx-2 mt-1 h-11 rounded-md px-2 text-sm text-fg-muted transition-colors duration-150 hover:text-fg lg:h-9"
        >
          {expanded ? t.catalog.showLess : t.catalog.showAll(group.options.length)}
        </button>
      )}
    </fieldset>
  );
}

/** Principais sempre visíveis; avançadas recolhidas (lei de Hick). */
export function Facets({
  main, advanced, onToggle,
}: { main: FacetGroup[]; advanced: FacetGroup[]; onToggle: (key: FacetKey, value: string) => void }) {
  const { t } = useI18n();
  const advancedActive = advanced.some((g) => g.options.some((o) => o.checked));
  return (
    <div className="flex flex-col gap-6">
      {main.map((g) => <Group key={g.key} group={g} onToggle={onToggle} />)}
      <details open={advancedActive || undefined} className="border-t border-line pt-2 [&[open]>summary>svg]:rotate-180">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-md text-sm font-medium [&::-webkit-details-marker]:hidden">
          {t.catalog.moreFilters}
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-fg-subtle transition-transform duration-150" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </summary>
        <div className="mt-2 flex flex-col gap-6">
          {advanced.map((g) => <Group key={g.key} group={g} onToggle={onToggle} />)}
        </div>
      </details>
    </div>
  );
}
