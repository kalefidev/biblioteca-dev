"use client";

import { useI18n } from "@/components/I18nProvider";
import { full } from "@/lib/catalog-i18n";

/** useI18n + catálogo traduzido. Importar este hook leva todos os dados do catálogo para o JS da rota; use só onde precisa. */
export function useFull() {
  return full(useI18n().locale);
}
