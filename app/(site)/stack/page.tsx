import type { Metadata } from "next";
import { Stack } from "@/components/stack/Stack";
import { pt } from "@/messages/pt-BR";

export const metadata: Metadata = { title: pt.stack.title };

export default function StackPage() {
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{pt.stack.title}</h1>
      <p className="mt-3 mb-10 max-w-[60ch] text-fg-muted">{pt.stack.lead}</p>
      <Stack />
    </section>
  );
}
