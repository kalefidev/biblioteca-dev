"use client";

import type { CSSProperties } from "react";
import { Link } from "@/components/Link";
import { useFull } from "@/components/useFull";
import { usePicks } from "@/lib/picks";
import { monogram, slotBg } from "./Shop";

/** Equipamento = a Minha stack: 1 slot por área (gradiente de meta). Clicar abre a loja da área. */
export function EquipBar({ onOpen }: { onOpen: (cat: string, slug?: string) => void }) {
  const { t, categories, toolBySlug } = useFull();
  const { list } = usePicks("stack");
  const slots = categories.map((c) => ({ c, items: list.flatMap((s) => toolBySlug.get(s) ?? []).filter((x) => x.category === c.id) }));
  const filled = slots.filter((s) => s.items.length).length;
  const total = categories.length;

  return (
    <nav aria-label={t.explore.equipLabel} className="relative z-20 shrink-0 border-t border-line bg-surface px-3 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3">
        <ul className="flex gap-2">
          {slots.map(({ c, items }) => {
            const label = items.length ? t.explore.slotFilled(c.label, items[0].name, items.length - 1) : t.explore.slotEmpty(c.label);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onOpen(c.id, items[0]?.slug)}
                  aria-label={label}
                  title={label}
                  className={`px-frame relative grid size-9 place-items-center font-pixel text-sm sm:size-11 ${items.length ? "text-fg" : "bg-surface-2"}`}
                  style={{ "--p": "3px", "--frame": items.length ? "var(--line-strong)" : "var(--line)", background: items.length ? slotBg(c.color) : undefined } as CSSProperties}
                >
                  {items.length ? monogram(items[0].name) : <i aria-hidden className="size-2" style={{ background: c.color }} />}
                  {items.length > 1 && (
                    <span aria-hidden className="absolute -right-2 -bottom-2 bg-fg px-0.5 font-mono text-[10px] leading-tight text-bg">+{items.length - 1}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex min-w-48 flex-1 items-center gap-3">
          <span className="text-sm font-medium whitespace-nowrap tabular-nums">{t.stack.progress(filled, total)}</span>
          <div
            role="progressbar"
            aria-label={t.stack.progressLabel}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={filled}
            aria-valuetext={t.stack.progress(filled, total)}
            className="h-2 flex-1 bg-surface-2"
          >
            <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${(filled / total) * 100}%` }} />
          </div>
          <Link href="/stack" className="inline-flex h-11 shrink-0 items-center text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            {t.explore.seeStack} →
          </Link>
        </div>
      </div>
    </nav>
  );
}
