import { Link } from "@/components/Link";
import { HeroGalaxyLoader } from "@/components/home/HeroGalaxyLoader";
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
        <HeroGalaxyLoader />
        <p className="mb-6 font-mono text-xs tracking-wide text-accent uppercase">{t.home.eyebrow}</p>
        <h1 className="max-w-[16ch] font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-tight text-balance">
          {t.home.title}
        </h1>
        <p className="mt-8 max-w-[52ch] text-lg text-fg-muted">{t.home.lead(tools.length, categories.length)}</p>

        {/* GET simples para /tools?q=…: funciona até sem JavaScript. */}
        <form action={href("/tools")} role="search" className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            aria-label={t.home.searchLabel}
            placeholder={t.home.searchPlaceholder}
            autoComplete="off"
            className="h-14 min-w-0 flex-1 rounded-xl border border-line bg-surface px-5 text-base transition-colors duration-150 placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:outline-none"
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
                className="group flex min-h-24 flex-col justify-between gap-4 rounded-xl border border-line bg-surface p-4 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2"
              >
                <span className="flex items-center gap-2.5 font-medium tracking-tight">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </span>
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

      <section aria-labelledby="explorar" className="mt-24 mb-24 rounded-2xl border border-line bg-surface px-6 py-12 sm:px-12">
        <h2 id="explorar" className="max-w-[20ch] font-display text-2xl tracking-tight text-balance">{t.home.exploreTitle}</h2>
        <p className="mt-4 max-w-[52ch] text-fg-muted">{t.home.exploreLead}</p>
        <Link
          href="/explore"
          className="mt-8 inline-flex h-12 items-center rounded-lg border border-line-strong px-6 font-medium transition-colors duration-150 hover:bg-surface-2 active:scale-[0.98]"
        >
          {t.home.openExplore}
        </Link>
      </section>
    </>
  );
}
