"use client";

import { m } from "motion/react";
import { useEffect, useRef } from "react";
import { Link } from "@/components/Link";
import { useFull } from "@/components/useFull";
import { Badge } from "@/components/ui/Badge";
import { metrics, toolHref } from "@/lib/catalog";
import { dur, ease } from "@/lib/motion";
import { usePicks } from "@/lib/picks";
import { rarity } from "@/lib/rarity";

/** Detalhe do item na loja: topo da página da ferramenta + raridade + Equipar (= salvar na Minha stack). */
export function ToolPanel({ slug, onClose, onPick }: { slug: string; onClose: () => void; onPick: (slug: string) => void }) {
  const { t, locale, categories, toolBySlug } = useFull();
  const stack = usePicks("stack");
  const ref = useRef<HTMLElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const tool = toolBySlug.get(slug);
  if (!tool) return null;
  const category = categories.find((c) => c.id === tool.category)!;
  const metric = metrics[slug];
  const r = rarity(slug);
  const equipped = stack.has(slug);
  const alternatives = tool.alternatives.flatMap((s) => toolBySlug.get(s) ?? []).slice(0, 5);

  return (
    <m.aside
      ref={ref}
      tabIndex={-1}
      aria-label={tool.name}
      data-rarity={r}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: dur.fast, ease } }}
      transition={{ duration: dur.base, ease }}
      className="px-frame absolute inset-x-3 bottom-3 z-10 max-h-[78%] overflow-y-auto bg-surface p-5 shadow-float focus:outline-none sm:p-6 lg:static lg:m-4 lg:max-h-none lg:self-start lg:shadow-none"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.explore.close}
        className="absolute top-2 right-2 grid size-11 place-items-center rounded-lg text-fg-muted transition-colors duration-150 hover:text-fg"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 4 8 8M12 4l-8 8" /></svg>
      </button>
      <p className="font-mono text-xs tracking-wide text-fg-subtle uppercase">{category.label}</p>
      <h2 className="mt-2 pr-8 font-display text-xl tracking-tight">{tool.name}</h2>
      <p className="mt-2 text-sm text-fg-muted">{tool.tagline}</p>

      <div className="mt-4 border-y border-line py-3">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-pixel text-base font-semibold text-(--rarity-fg)">{t.explore.rarity[r]}</span>
          {metric?.stars != null && (
            <span className="font-mono text-xs text-fg-subtle tabular-nums" title={`${metric.stars.toLocaleString(locale)} ${t.card.stars}`}>
              ★ {compact.format(metric.stars)} {t.card.stars}
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-fg-subtle">{r === "unknown" ? t.explore.rarityNone : t.explore.rarityNote}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>{t.kind[tool.kind]}</Badge>
        <Badge>{t.pricing[tool.pricing]}</Badge>
        {metric?.version && <span className="font-mono text-xs text-fg-subtle">{metric.version}</span>}
      </div>
      {alternatives.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-fg-subtle">{t.tool.alternatives}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {alternatives.map((a) => (
              <li key={a.slug}>
                <button
                  type="button"
                  onClick={() => onPick(a.slug)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-2.5 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg"
                >
                  <i aria-hidden className="size-1.5 rounded-full" style={{ background: categories.find((c) => c.id === a.category)?.color }} />
                  {a.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => stack.toggle(slug)}
          className={`inline-flex h-11 items-center rounded-lg px-4 font-pixel text-base font-semibold transition-colors duration-150 ${
            equipped ? "border border-line-strong text-fg hover:bg-surface-2" : "bg-accent text-accent-fg hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))]"
          }`}
        >
          {equipped ? t.explore.unequip : t.explore.equip}
        </button>
        <Link
          href={toolHref(tool)}
          className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg"
        >
          {t.explore.openPage}
        </Link>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-fg-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
        >
          {t.explore.openSite}
          <span aria-hidden>↗</span>
          <span className="sr-only">({t.tool.external})</span>
        </a>
      </div>
      <p role="status" className="sr-only">{equipped ? t.explore.equipped : ""}</p>
    </m.aside>
  );
}
