import { NextResponse, type NextRequest } from 'next/server'

// Idioma padrão (en) mora em /en/... internamente, mas a URL pública não tem prefixo. pt-BR passa direto.
// Sem detecção por Accept-Language: o redirecionamento quebraria o cache de HTML estático e o SEO; o seletor de idioma cobre.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Arquivos com extensão (robots.txt, sitemap.xml, llms.txt, favicon.ico, imagens) ficam como estão.
  if (/\.[^/]+$/.test(pathname)) return NextResponse.next()

  if (pathname === '/pt-BR' || pathname.startsWith('/pt-BR/')) return NextResponse.next()

  // A meta tag og:image aponta para /en/opengraph-image (caminho interno do Next): serve direto, sem redirecionar.
  if (pathname === '/en/opengraph-image') return NextResponse.next()

  // /en/x é a mesma página de /x: redireciona para a URL canônica (evita conteúdo duplicado).
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

// Fora: internos do Next (o resto é filtrado acima).
export const config = { matcher: ['/((?!_next/).*)'] }
