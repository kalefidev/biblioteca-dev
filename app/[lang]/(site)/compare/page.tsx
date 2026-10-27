import { Suspense } from "react";
import { Compare } from "@/components/compare/Compare";
import { Skeleton } from "@/components/ui/Skeleton";
import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: t.compare.title, alternates: alternates(locale, "/compare") };
}

export default async function ComparePage() {
  const { t } = await getI18n();
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{t.compare.title}</h1>
      <p className="mt-3 mb-10 text-fg-muted">{t.compare.lead}</p>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Compare />
      </Suspense>
    </section>
  );
}
