import { categories, tools } from '@/lib/catalog'
import { SITE_URL } from '@/lib/site'
import { pt } from '@/messages/pt-BR'

// Índice em Markdown para leitores de IA (convenção llms.txt), gerado do catálogo no build.
export function GET() {
  const body = [
    `# ${pt.site.name}`,
    `> ${pt.site.description}`,
    ...categories.map((c) => {
      const items = tools.filter((t) => t.category === c.id).map((t) => `- [${t.name}](${SITE_URL}/t/${t.slug}): ${t.tagline}`)
      return `## ${c.label}\n${items.join('\n')}`
    }),
    `## Páginas\n- [Catálogo](${SITE_URL}/tools)\n- [Explorar em 3D](${SITE_URL}/explore)`,
  ].join('\n\n')
  return new Response(body + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
