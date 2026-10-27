"use client";

import { createContext, useContext, type ReactNode } from "react";
import { i18n, type I18n, type Locale } from "@/lib/i18n";

const Ctx = createContext<I18n | null>(null);

// As mensagens têm funções (não serializam), então só o `locale` cruza a fronteira servidor→cliente.
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <Ctx value={i18n(locale)}>{children}</Ctx>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n fora do I18nProvider");
  return v;
}
