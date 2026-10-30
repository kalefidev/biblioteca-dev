"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { useFull } from "@/components/useFull";
import { dur, ease } from "@/lib/motion";
import { usePicks } from "@/lib/picks";
import { rarity } from "@/lib/rarity";
import type { Tool } from "@/lib/schema";
import { ToolPanel } from "./ToolPanel";

/** Monograma de até 2 letras: iniciais de duas palavras ("VS Code" → VC) ou as 2 primeiras letras ("React" → Re). */
export function monogram(name: string) {
  const words = name.split(/[\s.\-/]+/).filter(Boolean);
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2);
}

export const slotBg = (color: string) => `color-mix(in srgb, ${color} 35%, var(--surface))`;

type Props = {
  cat: string;
  items: Tool[];
  tool: string | null;
  onPick: (slug: string) => void;
  onClose: () => void;
  onCloseTool: () => void;
  onClear: () => void;
};

/** Loja de uma área: grade de itens tipo inventário (moldura = raridade) e o detalhe do item escolhido. */
export function Shop({ cat, items, tool, onPick, onClose, onCloseTool, onClear }: Props) {
  const { t, categories } = useFull();
  const stack = usePicks("stack");
  const category = categories.find((c) => c.id === cat)!;
  const ref = useRef<HTMLElement>(null);
  const openedWithTool = useRef(tool);
  // Foco entra na loja ao abrir (se já abriu com um item, o painel do item pega o foco).
  useEffect(() => {
    if (!openedWithTool.current) ref.current?.focus();
  }, []);

  return (
    <m.section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="shop-title"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: dur.fast, ease } }}
      transition={{ duration: dur.base, ease }}
      className="px-frame absolute inset-2 z-10 flex flex-col bg-surface focus:outline-none sm:inset-6 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:grid-rows-[minmax(0,1fr)]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line py-3 pr-2 pl-4 sm:py-4 sm:pl-5">
          <span aria-hidden className="bld max-sm:hidden" style={{ "--s": 1, "--b": `url(/pixel/b-${cat}.png)` } as CSSProperties} />
          <div className="min-w-0 flex-1">
            <h2 id="shop-title" className="font-pixel text-lg leading-tight font-semibold sm:text-xl">{category.label}</h2>
            <p className="font-mono text-xs text-fg-subtle tabular-nums">{t.explore.items(items.length)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          >
            <span aria-hidden>←</span> {t.explore.leaveShop}
          </button>
        </header>
        {items.length > 0 ? (
          <ul className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-2 gap-y-4 overflow-y-auto p-4 sm:p-5 max-lg:pb-40">
            {items.map((x) => {
              const r = rarity(x.slug);
              const equipped = stack.has(x.slug);
              return (
                <li key={x.slug}>
                  <button
                    id={`slot-${x.slug}`}
                    type="button"
                    aria-pressed={tool === x.slug}
                    onClick={() => onPick(x.slug)}
                    className="group flex w-full flex-col items-center gap-2.5 rounded-lg px-1 pt-3 pb-2 text-center transition-colors duration-150 hover:bg-surface-2 aria-pressed:bg-surface-2"
                  >
                    <span
                      data-rarity={r}
                      className="px-frame relative grid size-14 place-items-center font-pixel text-xl text-fg"
                      style={{ background: slotBg(category.color) }}
                    >
                      {monogram(x.name)}
                      {equipped && (
                        <span aria-hidden className="absolute -top-2.5 -right-2.5 grid size-5 place-items-center bg-accent font-pixel text-xs text-accent-fg">E</span>
                      )}
                    </span>
                    <span className="line-clamp-2 text-xs leading-snug text-fg-muted group-hover:text-fg group-aria-pressed:text-fg">{x.name}</span>
                    <span className="sr-only">
                      , {t.explore.rarity[r]}
                      {equipped && `, ${t.explore.equipped}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-5 text-sm text-fg-muted">
            <p>{t.explore.shopEmpty}</p>
            <button type="button" onClick={onClear} className="mt-3 inline-flex h-11 items-center rounded-lg border border-line px-4 text-fg hover:border-line-strong">
              {t.catalog.clearFilters}
            </button>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {tool ? (
          <ToolPanel key={tool} slug={tool} onClose={onCloseTool} onPick={onPick} />
        ) : (
          <m.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden border-l border-line p-6 text-sm text-fg-subtle lg:block">
            {t.explore.pickItem}
          </m.p>
        )}
      </AnimatePresence>
    </m.section>
  );
}
