import { lang } from 'next/root-params'
import { notFound } from 'next/navigation'
import { full } from './catalog-i18n.ts'
import { localizedGuidance } from './guidance-i18n.ts'
import { hasLocale } from './i18n.ts'

/** Tudo do idioma da rota atual (mensagens, catálogo, guidance). Só em Server Components (root param `lang`). */
export async function getI18n() {
  const locale = await lang()
  if (!hasLocale(locale)) notFound()
  return { ...full(locale), guidance: localizedGuidance(locale) }
}
export type ServerI18n = Awaited<ReturnType<typeof getI18n>>
