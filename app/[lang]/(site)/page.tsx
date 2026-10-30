import { Link } from "@/components/Link";
import type { CSSProperties } from "react";
import { ToolCard } from "@/components/site/ToolCard";
import { cardMeta } from "@/lib/catalog";
import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: { absolute: t.site.name }, alternates: alternates(locale, "/") };
}

export default async function Home() {
  const { t, categories, tools, href } = await getI18n();
  // 9 = 3 linhas cheias na grade de 3 colunas (o 10º destaque aparece no catálogo).
  const featured = tools.filter((x) => x.featured).slice(0, 9);
  return (
    <>
      <section className="relative isolate pt-20 pb-20 sm:pt-32">
        {/* Prévia estática da vila do Explorar (sem JS, não pesa no LCP); dia/noite segue o tema. Só ≥ 1024px, onde não cobre o título.
            <img> de propósito: o next/image redimensionaria o pixel art (10 KB) e borraria os pixels. */}
        <div aria-hidden className="pointer-events-none absolute top-20 right-0 -z-10 hidden w-96 overflow-hidden rounded-2xl border border-line lg:block xl:w-144">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pixel/village.png" alt="" width={384} height={224} loading="lazy" className="pixel w-full [[data-theme=dark]_&]:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pixel/village-night.png" alt="" width={384} height={224} loading="lazy" className="pixel hidden w-full [[data-theme=dark]_&]:block" />
        </div>
        <p className="mb-6 font-mono text-xs tracking-wide text-accent uppercase">{t.home.eyebrow}</p>
        <h1 className="max-w-[16ch] font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-tight text-balance">
          {t.home.title}
        </h1>
        <p className="mt-8 max-w-[42ch] text-lg text-fg-muted">{t.home.lead(tools.length, categories.length)}</p>

        {/* GET simples para /tools?q=…: funciona até sem JavaScript. */}
        <form action={href("/tools")} role="search" className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            aria-label={t.home.searchLabel}
            placeholder={t.home.searchPlaceholder}
            autoComplete="off"
            className="h-14 min-w-0 shrink-0 rounded-xl sm:flex-1 border border-line bg-surface px-5 text-base transition-colors duration-150 placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:outline-none"
          />
          <button
            type="submit"
            className="h-14 rounded-xl bg-accent px-7 font-medium text-accent-fg transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))] active:scale-[0.98]"
          >
            {t.home.searchAction}
          </button>
        </form>
      </section>

      <section aria-labelledby="areas" className="pb-24">
        <h2 id="areas" className="text-xl tracking-tight">{t.home.categoriesTitle}</h2>
        <p className="mt-2 mb-8 text-fg-muted">{t.home.categoriesHint}</p>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/c/${c.id}`}
                className="bld-host group flex min-h-24 flex-col justify-between gap-3 rounded-xl border border-line bg-surface p-4 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
              >
                {/* Ícone = o prédio da área na vila do Explorar (porta abre no hover). */}
                <span aria-hidden className="bld" style={{ "--s": 1, "--b": `url(/pixel/b-${c.id}.png)` } as CSSProperties} />
                <span className="font-medium tracking-tight">{c.label}</span>
                <span className="font-mono text-xs text-fg-subtle">{t.catalog.results(tools.filter((x) => x.category === c.id).length)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="destaques">
        <h2 id="destaques" className="text-xl tracking-tight">{t.home.featuredTitle}</h2>
        <p className="mt-2 mb-8 text-fg-muted">{t.home.featuredHint}</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((x) => (
            <li key={x.slug} className="flex *:flex-1">
              <ToolCard tool={x} {...cardMeta(x)} showFeatured={false} />
            </li>
          ))}
        </ul>
        <Link href="/tools" className="mt-8 inline-flex h-11 items-center rounded-lg text-sm font-medium text-accent underline-offset-4 hover:underline">
          {t.home.seeCatalog} →
        </Link>
      </section>

      <section aria-labelledby="explorar" className="mt-24 mb-24 overflow-hidden rounded-2xl border border-line bg-surface">
        <div aria-hidden className="village h-[calc(var(--u)*2)]">
          <div className="village-trees" />
        </div>
        <div className="px-6 py-12 sm:px-12">
          <h2 id="explorar" className="max-w-[20ch] font-display text-2xl tracking-tight text-balance">{t.home.exploreTitle}</h2>
          <p className="mt-4 max-w-[52ch] text-fg-muted">{t.home.exploreLead}</p>
          <Link
            href="/explore"
            className="mt-8 inline-flex h-12 items-center rounded-lg border border-line-strong px-6 font-medium transition-colors duration-150 hover:bg-surface-2 active:scale-[0.98]"
          >
            {t.home.openExplore}
          </Link>
        </div>
      </section>
    </>
  );
}
