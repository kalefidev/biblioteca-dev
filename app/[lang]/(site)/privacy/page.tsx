import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";
import { CONTACT_EMAIL } from "@/lib/site";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: t.privacy.title, alternates: alternates(locale, "/privacy") };
}

export default async function PrivacyPage() {
  const { t } = await getI18n();
  return (
    <article className="max-w-[65ch] pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{t.privacy.title}</h1>
      <p className="mt-3 text-sm text-fg-subtle">{t.privacy.updated}</p>
      {t.privacy.sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="font-medium tracking-tight">{s.h}</h2>
          {s.p.map((text) => <p key={text} className="mt-3 text-fg-muted">{text}</p>)}
        </section>
      ))}
      <section className="mt-10">
        <h2 className="font-medium tracking-tight">{t.privacy.contact.h}</h2>
        <p className="mt-3 text-fg-muted">
          {t.privacy.contact.p}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-4">{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </article>
  );
}
