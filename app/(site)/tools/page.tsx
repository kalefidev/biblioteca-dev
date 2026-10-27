import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog/Catalog";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { tools } from "@/lib/catalog";
import { pt } from "@/messages/pt-BR";

export const metadata: Metadata = { title: pt.catalog.title, alternates: { canonical: "/tools" } };

export default function ToolsPage() {
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{pt.catalog.title}</h1>
      <p className="mt-3 mb-10 text-fg-muted">{pt.catalog.lead(tools.length)}</p>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog />
      </Suspense>
    </section>
  );
}
