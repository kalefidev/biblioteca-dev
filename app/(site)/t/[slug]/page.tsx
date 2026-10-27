import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PickToggle } from "@/components/site/PickToggle";
import { ShareButton } from "@/components/site/ShareButton";
import { ToolCard } from "@/components/site/ToolCard";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/ui/JsonLd";
import { categories, guidance, metrics, relatedTo, toolBySlug, tools } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import type { Tool } from "@/lib/schema";
import { pt } from "@/messages/pt-BR";

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" });

export const generateStaticParams = () => tools.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const tool = toolBySlug.get((await params).slug);
  if (!tool) return {};
  return {
    title: `${tool.name}: ${tool.tagline}`,
    description: tool.description,
    alternates: { canonical: `/t/${tool.slug}` },
  };
}

const linkClass =
  "inline-flex h-11 items-center gap-1.5 rounded-lg border border-line px-4 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg";

function Ext({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
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
      <span className="sr-only">({pt.tool.external})</span>
    </a>
  );
}

// `params` é lido aqui (fora de Suspense) para um slug inexistente responder 404 de verdade, não 200 com tela de erro.
export default async function ToolPage({ params }: PageProps<"/t/[slug]">) {
  const tool = toolBySlug.get((await params).slug);
  if (!tool) notFound();
  return <ToolContent tool={tool} />;
}

function ToolContent({ tool }: { tool: Tool }) {
  const category = categories.find((c) => c.id === tool.category)!;
  const m = metrics[tool.slug];
  const g = guidance[tool.slug];
  const alternatives = tool.alternatives.flatMap((s) => toolBySlug.get(s) ?? []);
  const related = relatedTo(tool);

  const facts: [string, ReactNode][] = [
    [pt.tool.stars, m?.stars != null && <span title={m.stars.toLocaleString("pt-BR")}>★ {compact.format(m.stars)}</span>],
    [pt.tool.version, m?.version && <span className="font-mono">{m.version}</span>],
    [pt.tool.lastCommit, m?.lastCommit && date.format(new Date(m.lastCommit))],
    [pt.tool.downloads, m?.weeklyDownloads != null && <span title={m.weeklyDownloads.toLocaleString("pt-BR")}>{compact.format(m.weeklyDownloads)}</span>],
    [pt.tool.license, tool.license],
    [pt.tool.platforms, tool.platforms.map((p) => pt.platform[p]).join(", ")],
    [pt.tool.languages, tool.languages.map((l) => pt.language[l] ?? l).join(", ")],
    [pt.tool.subcategory, tool.subcategory],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/t/${tool.slug}`,
    sameAs: tool.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: tool.platforms.map((p) => pt.platform[p]).join(", "),
    ...(m?.version && { softwareVersion: m.version }),
    license: tool.license,
  };

  return (
    <article className="pt-12 pb-24 sm:pt-16">
      <JsonLd data={jsonLd} />
      <nav aria-label={pt.catalog.breadcrumb} className="mb-8 text-sm text-fg-muted">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li><Link href="/tools" className="rounded-sm underline-offset-4 hover:text-fg hover:underline">{pt.catalog.title}</Link></li>
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
            <Badge>{pt.kind[tool.kind]}</Badge>
            <Badge>{pt.pricing[tool.pricing]}</Badge>
            {tool.featured && <Badge tone="accent">{pt.card.featured}</Badge>}
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Ext href={tool.url} primary>{pt.tool.openSite}</Ext>
        {tool.repo && <Ext href={`https://github.com/${tool.repo}`}>{pt.tool.repo}</Ext>}
        {tool.npm && <Ext href={`https://www.npmjs.com/package/${tool.npm}`}>{pt.tool.npm}</Ext>}
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
              <h2 className="font-medium tracking-tight">{pt.tool.use}</h2>
              <p className="mt-2 text-sm text-fg-muted">{g.use}</p>
            </section>
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-medium tracking-tight">{pt.tool.avoid}</h2>
              <p className="mt-2 text-sm text-fg-muted">{g.avoid}</p>
            </section>
          </div>

          {alternatives.length > 0 && (
            <section aria-labelledby="alternatives">
              <h2 id="alternatives" className="font-display text-xl tracking-tight">{pt.tool.alternatives}</h2>
              <p className="mt-2 mb-6 text-fg-muted">{pt.tool.alternativesHint}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {alternatives.map((t) => <li key={t.slug}><ToolCard tool={t} showFeatured={false} /></li>)}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related">
              <h2 id="related" className="font-display text-xl tracking-tight">{pt.tool.related}</h2>
              <p className="mt-2 mb-6 text-fg-muted">{pt.tool.relatedHint}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {related.map((t) => <li key={t.slug}><ToolCard tool={t} showFeatured={false} /></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="details" className="lg:pt-1">
          <h2 id="details" className="font-medium tracking-tight">{pt.tool.details}</h2>
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
          {m && <p className="mt-6 text-xs text-fg-subtle">{pt.tool.metricsNote}</p>}
        </aside>
      </div>
    </article>
  );
}
