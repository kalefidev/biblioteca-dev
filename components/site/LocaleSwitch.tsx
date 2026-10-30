"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/components/I18nProvider";
import { LOCALES, localePath, stripLocale } from "@/lib/i18n";

function Switch({ qs }: { qs: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const target = LOCALES.find((l) => l !== locale)!;
  const href = localePath(target, stripLocale(pathname)) + (qs ? `?${qs}` : "");
  const name = t.locale.name[target];
  // <a> comum (não next/link): trocar de idioma troca o layout raiz, então tem que ser um carregamento completo.
  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={`${target.slice(0, 2).toUpperCase()}: ${t.locale.switchTo(name)}`}
      title={name}
      className="grid h-11 min-w-11 place-items-center rounded-lg px-1 font-mono sm:px-2 text-xs text-fg-muted uppercase transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
    >
      {target.slice(0, 2)}
    </a>
  );
}

// useSearchParams exige Suspense; o fallback é o mesmo botão sem a query (mantém filtros ao trocar de idioma).
function WithQuery() {
  return <Switch qs={useSearchParams().toString()} />;
}

export function LocaleSwitch() {
  return (
    <Suspense fallback={<Switch qs="" />}>
      <WithQuery />
    </Suspense>
  );
}
