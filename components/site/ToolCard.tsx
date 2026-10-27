"use client";

import { Link } from "@/components/Link";
import { useI18n } from "@/components/I18nProvider";
import { toolHref } from "@/lib/tool-href";
import type { Tool } from "@/lib/schema";
import { Badge } from "@/components/ui/Badge";
import { PickToggle } from "@/components/site/PickToggle";
import { Highlight } from "@/components/ui/Highlight";

type Props = {
  tool: Tool;
  /** Cor da categoria e estrelas (use `cardMeta(tool)`); ficam fora daqui para o catálogo não entrar no JS global. */
  color?: string;
  stars?: number | null;
  href?: string;
  showFeatured?: boolean;
  /** "list" = linha compacta para o catálogo. */
  layout?: "card" | "list";
  /** Termos da busca a destacar no nome e na descrição curta. */
  highlight?: string[];
};

export function ToolCard({ tool, color, stars, href = toolHref(tool), showFeatured = true, layout = "card", highlight = [] }: Props) {
  const { t, locale } = useI18n();
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const list = layout === "list";

  const starsEl = stars != null && (
    <span className="font-mono tabular-nums" title={`${stars.toLocaleString(locale)} ${t.card.stars}`}>
      ★ {compact.format(stars)}
    </span>
  );

  return (
    <article
      className={`group relative isolate rounded-xl border border-line bg-surface transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 ${
        list ? "flex items-center gap-4 px-4 py-3" : "flex flex-col gap-4 p-5"
      }`}
    >
      <div className={`flex items-center gap-3 ${list ? "min-w-0 flex-1" : ""}`}>
        {/* Monograma na cor da categoria; troca por logo oficial se algum dia valer a dependência. */}
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg font-display text-xl text-fg"
          style={{ background: `color-mix(in srgb, ${color} 35%, var(--surface))` }}
        >
          {tool.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 font-medium tracking-tight">
            <Link
              href={href}
              className="truncate after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              <Highlight text={tool.name} terms={highlight} />
            </Link>
            {showFeatured && tool.featured && <Badge tone="accent">{t.card.featured}</Badge>}
          </h3>
          {list && (
            <p className="truncate text-sm text-fg-muted">
              <Highlight text={tool.tagline} terms={highlight} />
            </p>
          )}
        </div>
      </div>
      {!list && (
        <p className="text-sm text-fg-muted">
          <Highlight text={tool.tagline} terms={highlight} />
        </p>
      )}
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-fg-subtle ${
          list ? "shrink-0 max-sm:hidden" : "mt-auto pt-1"
        }`}
      >
        <Badge>{t.kind[tool.kind]}</Badge>
        <span>{t.pricing[tool.pricing]}</span>
        <span className="ml-auto flex items-center gap-3">
          {starsEl && <span className={list ? "w-20 text-right whitespace-nowrap" : ""}>{starsEl}</span>}
          <PickToggle slug={tool.slug} list="compare" size="sm" />
        </span>
      </div>
      {/* Foco no card inteiro, já que o link é esticado sobre ele. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl group-has-focus-visible:outline-2 group-has-focus-visible:outline-offset-2 group-has-focus-visible:outline-accent" />
    </article>
  );
}
