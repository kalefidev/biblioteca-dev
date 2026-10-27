"use client";

import { clusters } from "@/lib/data";
import { pt } from "@/messages/pt-BR";
import type { Sel } from "./Scene";

/** Mapa 2D do mesmo catálogo (sem WebGL, movimento reduzido ou dispositivo fraco). Mesmas seleções e filtros do 3D. */
export function Fallback2D({ sel, lit, onTool, onCat }: {
  sel: Sel; lit: Set<string>; onTool: (slug: string) => void; onCat: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 overflow-y-auto px-4 pt-52 pb-28 lg:pr-104">
      <ul aria-label={pt.explore.mapLabel} className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
        {clusters.map((c) => (
          <li
            key={c.id}
            className={`rounded-xl border bg-surface p-4 transition-colors duration-150 ${sel.cat === c.id ? "border-line-strong" : "border-line"}`}
          >
            <button
              type="button"
              onClick={() => onCat(c.id)}
              className="flex h-11 items-center gap-2.5 rounded-lg font-medium tracking-tight"
            >
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </button>
            <ul className="mt-2 flex flex-wrap gap-2">
              {c.tools.map((t) => {
                const on = lit.has(t.slug);
                return (
                  <li key={t.slug}>
                    <button
                      type="button"
                      disabled={!on}
                      aria-pressed={sel.tool === t.slug}
                      onClick={() => onTool(t.slug)}
                      className="h-11 rounded-lg border border-line px-3.5 text-sm transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-transparent aria-pressed:border-fg aria-pressed:bg-surface-2"
                    >
                      {t.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
