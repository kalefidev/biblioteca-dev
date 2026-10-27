import type { Metadata } from "next";
import { ToolCard } from "@/components/site/ToolCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, ToolCardSkeleton } from "@/components/ui/Skeleton";
import { tools } from "@/lib/catalog";
import { pt } from "@/messages/pt-BR";

// Galeria interna dos componentes (para revisar estados). Sai do build público na etapa 7.
export const metadata: Metadata = { title: "Design system", robots: { index: false } };

const swatches = ["bg", "surface", "surface-2", "line", "line-strong", "fg", "fg-muted", "fg-subtle", "accent", "accent-soft"];
const scale = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];

export default function DesignPage() {
  return (
    <div className="flex flex-col gap-16 py-16">
      <h1 className="font-display text-2xl tracking-tight">Design system</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Cores</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map((s) => (
            <li key={s} className="flex flex-col gap-2">
              <span className="h-14 rounded-lg border border-line" style={{ background: `var(--${s})` }} />
              <code className="font-mono text-xs text-fg-muted">{s}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Tipografia</h2>
        <p className="font-display text-3xl leading-none">Display 72</p>
        {scale.map((s) => (
          <p key={s} className={s}>
            {s} · Escala tipográfica
          </p>
        ))}
        <p className="font-mono text-sm tabular-nums">mono · v19.3.0 · 1.234.567</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Badge</h2>
        <div className="flex gap-2">
          <Badge>{pt.kind.library}</Badge>
          <Badge tone="accent">{pt.card.featured}</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">ToolCard · normal e skeleton</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ToolCard tool={tools.find((t) => t.featured)!} />
          <ToolCard tool={tools.find((t) => !t.featured)!} />
          <ToolCardSkeleton />
        </div>
        <Skeleton className="h-4 w-48" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">EmptyState</h2>
        <EmptyState
          title={pt.states.emptyTitle}
          hint={pt.states.emptyHint}
          action={
            <button
              type="button"
              className="h-11 rounded-lg border border-line-strong px-4 text-sm transition-colors duration-150 hover:bg-surface-2 active:bg-line"
            >
              {pt.states.emptyAction}
            </button>
          }
        />
      </section>
    </div>
  );
}
