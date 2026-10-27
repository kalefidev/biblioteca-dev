import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PickToggle } from "@/components/site/PickToggle";
import { ShareButton } from "@/components/site/ShareButton";
import { ToolCard } from "@/components/site/ToolCard";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/ui/JsonLd";
import { metrics, tools } from "@/lib/catalog";
import { full } from "@/lib/catalog-i18n";
import { cardMeta } from "@/lib/catalog";
import { alternates, hasLocale } from "@/lib/i18n";
import { getI18n, type ServerI18n } from "@/lib/i18n-server";
import { SITE_URL } from "@/lib/site";
import type { Tool } from "@/lib/schema";

export const generateStaticParams = () => tools.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: PageProps<"/[lang]/t/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const tool = full(lang).toolBySlug.get(slug);
  if (!tool) return {};
  return {
    title: `${tool.name}: ${tool.tagline}`,
    description: tool.description,
    alternates: alternates(lang, `/t/${tool.slug}`),
  };
}

const linkClass =
  "inline-flex h-11 items-center gap-1.5 rounded-lg border border-line px-4 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg";

function Ext({ href, children, primary, external }: { href: string; children: ReactNode; primary?: boolean; external: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90"
          : linkClass
      }
    >
      {children}
      <span aria-hidden>↗</span>
      <span className="sr-only">({external})</span>
    </a>
  );
}

// `params` é lido aqui (fora de Suspense) para um slug inexistente responder 404 de verdade, não 200 com tela de erro.
export default async function ToolPage({ params }: PageProps<"/[lang]/t/[slug]">) {
  const i = await getI18n();
  const tool = i.toolBySlug.get((await params).slug);
  if (!tool) notFound();
  return <ToolContent tool={tool} i={i} />;
}

function ToolContent({ tool, i }: { tool: Tool; i: ServerI18n }) {
  const { t, locale, categories, guidance, toolBySlug, related: relatedTo, href } = i;
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
  const category = categories.find((c) => c.id === tool.category)!;
  const m = metrics[tool.slug];
  const g = guidance[tool.slug];
  const alternatives = tool.alternatives.flatMap((s) => toolBySlug.get(s) ?? []);
  const related = relatedTo(tool);
  const external = t.tool.external;

  const facts: [string, ReactNode][] = [
    [t.tool.stars, m?.stars != null && <span title={m.stars.toLocaleString(locale)}>★ {compact.format(m.stars)}</span>],
    [t.tool.version, m?.version && <span className="font-mono">{m.version}</span>],
    [t.tool.lastCommit, m?.lastCommit && date.format(new Date(m.lastCommit))],
    [t.tool.downloads, m?.weeklyDownloads != null && <span title={m.weeklyDownloads.toLocaleString(locale)}>{compact.format(m.weeklyDownloads)}</span>],
    [t.tool.license, tool.license],
    [t.tool.platforms, tool.platforms.map((p) => t.platform[p]).join(", ")],
    [t.tool.languages, tool.languages.map((l) => t.language[l] ?? l).join(", ")],
    [t.tool.subcategory, tool.subcategory],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}${href(`/t/${tool.slug}`)}`,
    inLanguage: locale,
    sameAs: tool.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: tool.platforms.map((p) => t.platform[p]).join(", "),
    ...(m?.version && { softwareVersion: m.version }),
    license: tool.license,
  };

  return (
    <article className="pt-12 pb-24 sm:pt-16">
      <JsonLd data={jsonLd} />
      <nav aria-label={t.catalog.breadcrumb} className="mb-8 text-sm text-fg-muted">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li><Link href="/tools" className="rounded-sm underline-offset-4 hover:text-fg hover:underline">{t.catalog.title}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/c/${category.id}`} className="rounded-sm underline-offset-4 hover:text-fg hover:underline">{category.label}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-fg">{tool.name}</li>
        </ol>
      </nav>

      <header className="flex items-start gap-5">
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-xl font-display text-2xl text-fg"
          style={{ background: `color-mix(in srgb, ${category.color} 35%, var(--surface))` }}
        >
          {tool.name[0]}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl tracking-tight">{tool.name}</h1>
          <p className="mt-2 text-lg text-fg-muted">{tool.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{t.kind[tool.kind]}</Badge>
            <Badge>{t.pricing[tool.pricing]}</Badge>
            {tool.featured && <Badge tone="accent">{t.card.featured}</Badge>}
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Ext href={tool.url} primary external={external}>{t.tool.openSite}</Ext>
        {tool.repo && <Ext href={`https://github.com/${tool.repo}`} external={external}>{t.tool.repo}</Ext>}
        {tool.npm && <Ext href={`https://www.npmjs.com/package/${tool.npm}`} external={external}>{t.tool.npm}</Ext>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <PickToggle slug={tool.slug} list="compare" />
        <PickToggle slug={tool.slug} list="stack" />
        <ShareButton />
      </div>

      <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
        <div className="space-y-16">
          <p className="max-w-[60ch] text-base text-fg-muted">{tool.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-medium tracking-tight">{t.tool.use}</h2>
              <p className="mt-2 text-sm text-fg-muted">{g.use}</p>
            </section>
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-medium tracking-tight">{t.tool.avoid}</h2>
              <p className="mt-2 text-sm text-fg-muted">{g.avoid}</p>
            </section>
          </div>

          {alternatives.length > 0 && (
            <section aria-labelledby="alternatives">
              <h2 id="alternatives" className="font-display text-xl tracking-tight">{t.tool.alternatives}</h2>
              <p className="mt-2 mb-6 text-fg-muted">{t.tool.alternativesHint}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {alternatives.map((x) => <li key={x.slug}><ToolCard tool={x} {...cardMeta(x)} showFeatured={false} /></li>)}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related">
              <h2 id="related" className="font-display text-xl tracking-tight">{t.tool.related}</h2>
              <p className="mt-2 mb-6 text-fg-muted">{t.tool.relatedHint}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {related.map((x) => <li key={x.slug}><ToolCard tool={x} {...cardMeta(x)} showFeatured={false} /></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="details" className="lg:pt-1">
          <h2 id="details" className="font-medium tracking-tight">{t.tool.details}</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
            {facts.map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {tool.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
          {m && <p className="mt-6 text-xs text-fg-subtle">{t.tool.metricsNote}</p>}
        </aside>
      </div>
    </article>
  );
}
