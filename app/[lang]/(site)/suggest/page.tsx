import { SuggestForm } from "@/components/suggest/SuggestForm";
import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";
import { suggest } from "./actions";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: t.suggest.title, alternates: alternates(locale, "/suggest") };
}

export default async function SuggestPage() {
  const { t, locale, categories } = await getI18n();
  return (
    <section className="max-w-xl pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{t.suggest.title}</h1>
      <p className="mt-3 mb-10 text-fg-muted">{t.suggest.lead}</p>
      <SuggestForm action={suggest.bind(null, locale)} categories={categories.map(({ id, label }) => ({ id, label }))} />
    </section>
  );
}
