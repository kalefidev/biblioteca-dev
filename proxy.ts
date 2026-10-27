import { NextResponse, type NextRequest } from 'next/server'
import { categories, toolBySlug } from './lib/catalog.ts'

const categoryIds = new Set(categories.map((c) => c.id))

// /t/<slug> ou /c/<categoria> que não existe. A página não consegue responder 404 sozinha: com Partial Prefetching o
// shell (status 200) sai antes de `params` resolver. Aqui ainda dá: reescreve para a rota pega-tudo, que chama notFound().
function unknownEntry(path: string) {
  const m = /^\/(t|c)\/([^/]+)\/?$/.exec(path)
  return !!m && !(m[1] === 't' ? toolBySlug.has(m[2]) : categoryIds.has(m[2]))
}

// Idioma padrão (en) mora em /en/... internamente, mas a URL pública não tem prefixo. pt-BR passa direto.
// Sem detecção por Accept-Language: o redirecionamento quebraria o cache de HTML estático e o SEO; o seletor de idioma cobre.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Arquivos com extensão (robots.txt, sitemap.xml, llms.txt, favicon.ico, imagens) ficam como estão.
  if (/\.[^/]+$/.test(pathname)) return NextResponse.next()

  // Rotas de API não têm idioma (ex.: /api/keepalive do Vercel Cron).
  if (pathname.startsWith('/api/')) return NextResponse.next()

  if (pathname === '/pt-BR' || pathname.startsWith('/pt-BR/')) {
    if (!unknownEntry(pathname.slice(6))) return NextResponse.next()
    url.pathname = '/pt-BR/unknown'
    return NextResponse.rewrite(url)
  }

  // A meta tag og:image aponta para /en/opengraph-image (caminho interno do Next): serve direto, sem redirecionar.
  if (pathname === '/en/opengraph-image') return NextResponse.next()

  // /en/x é a mesma página de /x: redireciona para a URL canônica (evita conteúdo duplicado).
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  url.pathname = unknownEntry(pathname) ? '/en/unknown' : `/en${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

// Fora: internos do Next (o resto é filtrado acima).
export const config = { matcher: ['/((?!_next/).*)'] }
