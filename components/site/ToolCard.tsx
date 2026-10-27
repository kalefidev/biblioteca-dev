import { categories, metrics } from "@/lib/catalog";
import type { Tool } from "@/lib/schema";
import { pt } from "@/messages/pt-BR";
import { Badge } from "@/components/ui/Badge";

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

// href vira /t/[slug] na etapa 4; por enquanto o card leva ao site oficial.
export function ToolCard({ tool, href = tool.url, showFeatured = true }: { tool: Tool; href?: string; showFeatured?: boolean }) {
  const color = categories.find((c) => c.id === tool.category)?.color;
  const stars = metrics[tool.slug]?.stars;
  const external = href.startsWith("http");

  return (
    <article className="group relative isolate flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2">
      <div className="flex items-center gap-3">
        {/* Monograma na cor da categoria; troca por logo oficial se algum dia valer a dependência. */}
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg font-display text-xl text-fg"
          style={{ background: `color-mix(in srgb, ${color} 35%, var(--surface))` }}
        >
          {tool.name[0]}
        </span>
        <h3 className="min-w-0 flex-1 truncate font-medium tracking-tight">
          <a
            href={href}
            {...(external && { target: "_blank", rel: "noopener noreferrer", "aria-label": `${tool.name} (${pt.card.openSite})` })}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {tool.name}
          </a>
        </h3>
        {showFeatured && tool.featured && <Badge tone="accent">{pt.card.featured}</Badge>}
      </div>
      <p className="text-sm text-fg-muted">{tool.tagline}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-1 text-xs text-fg-subtle">
        <Badge>{pt.kind[tool.kind]}</Badge>
        <span>{pt.pricing[tool.pricing]}</span>
        {stars != null && (
          <span className="ml-auto font-mono tabular-nums" title={`${stars.toLocaleString("pt-BR")} ${pt.card.stars}`}>
            ★ {compact.format(stars)}
          </span>
        )}
      </div>
      {/* Foco no card inteiro, já que o link é esticado sobre ele. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl group-has-focus-visible:outline-2 group-has-focus-visible:outline-offset-2 group-has-focus-visible:outline-accent" />
    </article>
  );
}
