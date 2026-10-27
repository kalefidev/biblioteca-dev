"use client";

import { m } from "motion/react";
import { Link } from "@/components/Link";
import { useFull } from "@/components/useFull";
import { Badge } from "@/components/ui/Badge";
import { metrics, toolHref } from "@/lib/catalog";
import { dur, ease } from "@/lib/motion";

/** Mesmas informações do topo da página da ferramenta, em formato de painel flutuante. */
export function ToolPanel({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { t, locale, categories, toolBySlug } = useFull();
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const tool = toolBySlug.get(slug);
  if (!tool) return null;
  const category = categories.find((c) => c.id === tool.category)!;
  const metric = metrics[slug];

  return (
    <m.aside
      aria-label={tool.name}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: dur.fast, ease } }}
      transition={{ duration: dur.base, ease }}
      className="fixed right-4 bottom-24 left-4 z-5 rounded-2xl border border-line bg-surface p-5 shadow-float sm:top-4 sm:bottom-auto sm:left-auto sm:w-88 sm:p-6"
      style={{ borderTop: `2px solid ${category.color}` }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.explore.close}
        className="absolute top-2 right-2 grid size-11 place-items-center rounded-lg text-fg-muted transition-colors duration-150 hover:text-fg"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 4 8 8M12 4l-8 8" /></svg>
      </button>
      <p className="font-mono text-xs tracking-wide uppercase" style={{ color: category.color }}>{category.label}</p>
      <h2 className="mt-2 pr-8 font-display text-xl tracking-tight">{tool.name}</h2>
      <p className="mt-2 text-sm text-fg-muted">{tool.tagline}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>{t.kind[tool.kind]}</Badge>
        <Badge>{t.pricing[tool.pricing]}</Badge>
        {metric?.stars != null && <span className="font-mono text-xs text-fg-subtle tabular-nums">★ {compact.format(metric.stars)}</span>}
        {metric?.version && <span className="font-mono text-xs text-fg-subtle">{metric.version}</span>}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={toolHref(tool)}
          className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90"
        >
          {t.explore.openPage}
        </Link>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line px-4 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg"
        >
          {t.explore.openSite}
          <span aria-hidden>↗</span>
          <span className="sr-only">({t.tool.external})</span>
        </a>
      </div>
    </m.aside>
  );
}
