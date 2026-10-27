import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog/Catalog";
import { Link } from "@/components/Link";
import { categories } from "@/lib/catalog";
import { full } from "@/lib/catalog-i18n";
import { alternates, hasLocale } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export const generateStaticParams = () => categories.map((c) => ({ categoria: c.id }));

export async function generateMetadata({ params }: PageProps<"/[lang]/c/[categoria]">): Promise<Metadata> {
  const { lang, categoria } = await params;
  if (!hasLocale(lang)) return {};
  const { t, categories } = full(lang);
  const label = categories.find((c) => c.id === categoria)?.label;
  return { title: label ? t.catalog.categoryPage(label) : t.catalog.title, alternates: alternates(lang, `/c/${categoria}`) };
}

// `params` é lido aqui (fora de Suspense) para uma categoria inexistente responder 404 de verdade.
export default async function CategoryPage({ params }: PageProps<"/[lang]/c/[categoria]">) {
  const { t, categories, tools } = await getI18n();
  const { categoria } = await params;
  const category = categories.find((c) => c.id === categoria);
  if (!category) notFound();
  const count = tools.filter((x) => x.category === category.id).length;

  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <nav aria-label={t.catalog.breadcrumb} className="mb-6 text-sm text-fg-muted">
        <ol className="flex items-center gap-2">
          <li><Link href="/tools" className="rounded-sm underline-offset-4 hover:text-fg hover:underline">{t.catalog.title}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-fg">{category.label}</li>
        </ol>
      </nav>
      <h1 className="flex items-center gap-4 font-display text-2xl tracking-tight">
        <span aria-hidden className="size-3 rounded-full" style={{ background: category.color }} />
        {category.label}
      </h1>
      <p className="mt-3 mb-10 text-fg-muted">{t.catalog.results(count)}</p>
      <Catalog lockedCategory={category.id} />
    </section>
  );
}
