import type { Metadata } from "next";
import { pt } from "@/messages/pt-BR";

export const metadata: Metadata = { title: pt.privacy.title, alternates: { canonical: "/privacidade" } };

export default function PrivacyPage() {
  return (
    <article className="max-w-[65ch] pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{pt.privacy.title}</h1>
      <p className="mt-3 text-sm text-fg-subtle">{pt.privacy.updated}</p>
      {pt.privacy.sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="font-medium tracking-tight">{s.h}</h2>
          {s.p.map((text) => <p key={text} className="mt-3 text-fg-muted">{text}</p>)}
        </section>
      ))}
    </article>
  );
}
