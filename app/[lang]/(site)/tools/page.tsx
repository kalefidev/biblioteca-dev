import { Suspense } from "react";
import { Catalog } from "@/components/catalog/Catalog";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: t.catalog.title, alternates: alternates(locale, "/tools") };
}

export default async function ToolsPage() {
  const { t, tools } = await getI18n();
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{t.catalog.title}</h1>
      <p className="mt-3 mb-10 text-fg-muted">{t.catalog.lead(tools.length)}</p>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog />
      </Suspense>
    </section>
  );
}
