"use client";

import type { CSSProperties } from "react";
import { useFull } from "@/components/useFull";

/** Vila pixel: um prédio (loja) por área, com a contagem de itens que casam com a busca/filtros. Estilos em globals.css (.village). */
export function Village({ counts, onCat }: { counts: Map<string, number>; onCat: (id: string) => void }) {
  const { t, categories } = useFull();
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div aria-hidden className="village-trees" />
      <div className="relative mx-auto w-max">
        <ul aria-label={t.explore.villageLabel} className="village-grid">
          {categories.map((c, i) => {
            const n = counts.get(c.id) ?? 0;
            return (
              <li key={c.id}>
                <button
                  id={`bld-${c.id}`}
                  type="button"
                  onClick={() => onCat(c.id)}
                  data-empty={n === 0 || undefined}
                  className="lot"
                  style={{ "--b": `url(/pixel/b-${c.id}.png)`, "--i": i } as CSSProperties}
                >
                  <span aria-hidden className="bld" />
                  <span aria-hidden className="smoke" />
                  {/* O texto da placa é o nome do botão (rótulo visível = nome acessível). */}
                  <span className="sign px-frame">
                    <span className="block font-pixel text-[calc(6px*var(--s))] font-semibold">{c.label}</span>
                    <span className="block font-mono text-[calc(5px*var(--s))] tabular-nums opacity-85">{t.explore.items(n)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <span aria-hidden className="npc" />
        <span aria-hidden className="npc" />
      </div>
      <div aria-hidden className="village-trees" />
    </div>
  );
}
