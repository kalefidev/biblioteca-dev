import Link from "next/link";
import { ToolCard } from "@/components/site/ToolCard";
import { categories, tools } from "@/lib/catalog";
import { pt } from "@/messages/pt-BR";

// Versão da etapa 2: hero + destaques. Busca, categorias e filtros chegam na etapa 3.
export default function Home() {
  // 9 = 3 linhas cheias na grade de 3 colunas (o 10º destaque aparece no catálogo, etapa 3).
  const featured = tools.filter((t) => t.featured).slice(0, 9);
  return (
    <>
      <section className="pt-20 pb-24 sm:pt-32">
        <p className="mb-6 font-mono text-xs tracking-wide text-accent uppercase">{pt.home.eyebrow}</p>
        <h1 className="max-w-[16ch] font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-tight text-balance">
          {pt.home.title}
        </h1>
        <p className="mt-8 max-w-[52ch] text-lg text-fg-muted">{pt.home.lead(tools.length, categories.length)}</p>
        <Link
          href="/explore"
          className="mt-10 inline-flex h-12 items-center rounded-lg bg-accent px-6 font-medium text-accent-fg transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))] active:scale-[0.98]"
        >
          {pt.home.openExplore}
        </Link>
      </section>

      <section aria-labelledby="destaques">
        <h2 id="destaques" className="text-xl tracking-tight">{pt.home.featuredTitle}</h2>
        <p className="mt-2 mb-8 text-fg-muted">{pt.home.featuredHint}</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <li key={t.slug} className="flex">
              <div className="flex w-full flex-col [&>article]:flex-1">
                <ToolCard tool={t} showFeatured={false} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
