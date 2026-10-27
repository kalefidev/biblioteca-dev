// Idiomas do site. en é o padrão (URL sem prefixo); pt-BR vive em /pt-BR/... (proxy.ts faz o rewrite de en).
// Sem biblioteca: as mensagens são módulos TS tipados. Este módulo é leve de propósito (entra no JS de todas as páginas);
// o catálogo traduzido fica em lib/catalog-i18n.ts e só entra nas rotas que o usam.
import type { Messages } from '../messages/pt-BR.ts'
import { ptBR } from '../messages/pt-BR.ts'
import { en } from '../messages/en.ts'

export const LOCALES = ['en', 'pt-BR'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const hasLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s)

const messages: Record<Locale, Messages> = { en, 'pt-BR': ptBR }
const ogLocale: Record<Locale, string> = { en: 'en_US', 'pt-BR': 'pt_BR' }

/** Caminho com o prefixo do idioma (en não tem). `path` começa com `/` e pode ter query. */
export const localePath = (locale: Locale, path: string) =>
  locale === DEFAULT_LOCALE ? path : path === '/' ? `/${locale}` : `/${locale}${path}`

/** Caminho como o visitante vê na barra de endereço. O proxy reescreve /x para /en/x, e usePathname pode devolver a versão interna. */
export const publicPath = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, '') || '/'

/** Caminho sem nenhum prefixo de idioma (para comparar rotas). */
export const stripLocale = (pathname: string) => pathname.replace(/^\/(?:pt-BR|en)(?=\/|$)/, '') || '/'

/** canonical + hreflang de uma página. */
export const alternates = (locale: Locale, path: string) => ({
  canonical: localePath(locale, path),
  languages: { ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])), 'x-default': localePath(DEFAULT_LOCALE, path) },
})

const cache = new Map<Locale, ReturnType<typeof build>>()
function build(locale: Locale) {
  return { locale, t: messages[locale], og: ogLocale[locale], href: (path: string) => localePath(locale, path) }
}

/** Mensagens + helper de link para um idioma (memoizado). */
export function i18n(locale: Locale) {
  if (!cache.has(locale)) cache.set(locale, build(locale))
  return cache.get(locale)!
}
export type I18n = ReturnType<typeof i18n>
