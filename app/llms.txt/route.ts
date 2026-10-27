import { full } from '@/lib/catalog-i18n'
import { SITE_URL } from '@/lib/site'

// Índice em Markdown para leitores de IA (convenção llms.txt), gerado do catálogo no build.
// Só em inglês (uma versão canônica); as páginas em pt-BR estão no sitemap com hreflang.
export function GET() {
  const { t, categories, tools } = full('en')
  const body = [
    `# ${t.site.name}`,
    `> ${t.site.description}`,
    ...categories.map((c) => {
      const items = tools.filter((x) => x.category === c.id).map((x) => `- [${x.name}](${SITE_URL}/t/${x.slug}): ${x.tagline}`)
      return `## ${c.label}\n${items.join('\n')}`
    }),
    `## Pages\n- [${t.catalog.title}](${SITE_URL}/tools)\n- [${t.explore.title} (3D)](${SITE_URL}/explore)\n- [Português (Brasil)](${SITE_URL}/pt-BR)`,
  ].join('\n\n')
  return new Response(body + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
