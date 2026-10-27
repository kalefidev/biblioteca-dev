import Link from "next/link";
import { pt } from "@/messages/pt-BR";

export function NotFound() {
  return (
    <section className="pt-20 pb-24 sm:pt-32">
      <p className="mb-6 font-mono text-xs tracking-wide text-accent uppercase">404</p>
      <h1 className="font-display text-2xl tracking-tight">{pt.notFound.title}</h1>
      <p className="mt-3 max-w-[52ch] text-fg-muted">{pt.notFound.hint}</p>
      <Link href="/tools" className="mt-8 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90">
        {pt.notFound.action}
      </Link>
    </section>
  );
}
