import { Stack } from "@/components/stack/Stack";
import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: t.stack.title, alternates: alternates(locale, "/stack") };
}

export default async function StackPage() {
  const { t } = await getI18n();
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{t.stack.title}</h1>
      <p className="mt-3 mb-10 max-w-[60ch] text-fg-muted">{t.stack.lead}</p>
      <Stack />
    </section>
  );
}
