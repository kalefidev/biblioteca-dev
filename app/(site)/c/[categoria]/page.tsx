import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog/Catalog";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { categories, tools } from "@/lib/catalog";
import { pt } from "@/messages/pt-BR";

export const generateStaticParams = () => categories.map((c) => ({ categoria: c.id }));

export async function generateMetadata({ params }: PageProps<"/c/[categoria]">): Promise<Metadata> {
  const { categoria } = await params;
  const label = categories.find((c) => c.id === categoria)?.label;
  return { title: label ? pt.catalog.categoryPage(label) : pt.catalog.title, alternates: { canonical: `/c/${categoria}` } };
}

// `params` é lido aqui (fora de Suspense) para uma categoria inexistente responder 404 de verdade.
export default async function CategoryPage({ params }: PageProps<"/c/[categoria]">) {
  const { categoria } = await params;
  const category = categories.find((c) => c.id === categoria);
  if (!category) notFound();
  const count = tools.filter((t) => t.category === category.id).length;

  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <nav aria-label={pt.catalog.breadcrumb} className="mb-6 text-sm text-fg-muted">
        <ol className="flex items-center gap-2">
          <li><Link href="/tools" className="rounded-sm underline-offset-4 hover:text-fg hover:underline">{pt.catalog.title}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-fg">{category.label}</li>
        </ol>
      </nav>
      <h1 className="flex items-center gap-4 font-display text-2xl tracking-tight">
        <span aria-hidden className="size-3 rounded-full" style={{ background: category.color }} />
        {category.label}
      </h1>
      <p className="mt-3 mb-10 text-fg-muted">{pt.catalog.results(count)}</p>
      <Suspense fallback={<CatalogSkeleton lockedCategory={category.id} />}>
        <Catalog lockedCategory={category.id} />
      </Suspense>
    </section>
  );
}
