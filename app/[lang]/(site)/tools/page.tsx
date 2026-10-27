import { Catalog } from "@/components/catalog/Catalog";
import { alternates } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export async function generateMetadata() {
  const { locale, t } = await getI18n();
  return { title: t.catalog.title, alternates: alternates(locale, "/tools") };
}

// O catálogo é pré-renderizado inteiro (lista padrão, links rastreáveis) e aplica os filtros da URL ao hidratar.
export default async function ToolsPage() {
  const { t, tools } = await getI18n();
  return (
    <section className="pt-12 pb-24 sm:pt-16">
      <h1 className="font-display text-2xl tracking-tight">{t.catalog.title}</h1>
      <p className="mt-3 mb-10 text-fg-muted">{t.catalog.lead(tools.length)}</p>
      <Catalog />
    </section>
  );
}
