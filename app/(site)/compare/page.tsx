import type { Metadata } from "next";
import { Suspense } from "react";
import { Compare } from "@/components/compare/Compare";
import { Skeleton } from "@/components/ui/Skeleton";
import { pt } from "@/messages/pt-BR";

export const metadata: Metadata = { title: pt.compare.title };

export default function ComparePage() {
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{pt.compare.title}</h1>
      <p className="mt-3 mb-10 text-fg-muted">{pt.compare.lead}</p>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Compare />
      </Suspense>
    </section>
  );
}
