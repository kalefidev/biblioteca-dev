// Fonte única dos dados curados. Importável pelo app e pelos scripts (Node roda .ts direto).
import type { Category, Metrics, Tool } from './schema.ts'
import categoriesJson from '../data/categories.json' with { type: 'json' }
import metricsJson from '../data/metrics.json' with { type: 'json' }
import enJson from '../data/i18n/en.json' with { type: 'json' }
import editores from '../data/tools/editores.json' with { type: 'json' }
import git from '../data/tools/git.json' with { type: 'json' }
import frontend from '../data/tools/frontend.json' with { type: 'json' }
import backend from '../data/tools/backend.json' with { type: 'json' }
import dados from '../data/tools/dados.json' with { type: 'json' }
import devops from '../data/tools/devops.json' with { type: 'json' }
import testes from '../data/tools/testes.json' with { type: 'json' }
import ia from '../data/tools/ia.json' with { type: 'json' }

// Os JSON são validados em scripts/validate.ts (roda antes do build), então o cast é seguro.
export const categories = categoriesJson as Category[]
export const toolFiles: Record<string, unknown[]> = { editores, git, frontend, backend, dados, devops, testes, ia }
export const tools = Object.values(toolFiles).flat() as Tool[]
export const metrics = metricsJson as Record<string, Metrics>


/** Tradução (en) dos textos curados. Os JSON-base em data/ estão em pt-BR; validate exige cobertura total. */
export const overlayEn = enJson as {
  categories: Record<string, string>
  subcategories: Record<string, string>
  tools: Record<string, Pick<Tool, 'tagline' | 'description'>>
}
export const toolBySlug = new Map(tools.map((t) => [t.slug, t]))

export { toolHref } from './tool-href.ts'

/** Cor da categoria e estrelas de um cartão. Fica fora do ToolCard para ele não puxar o catálogo inteiro para o JS global. */
export const cardMeta = (t: Tool) => ({ color: categories.find((c) => c.id === t.category)?.color, stars: metrics[t.slug]?.stars })

/** Ferramentas parecidas que não são alternativas diretas: mesma categoria, ordenadas por subcategoria e tags em comum. */
export function relatedTo(t: Tool, limit = 4, pool: Tool[] = tools): Tool[] {
  const score = (o: Tool) => (o.subcategory === t.subcategory ? 2 : 0) + o.tags.filter((tag) => t.tags.includes(tag)).length
  return pool
    .filter((o) => o.category === t.category && o.slug !== t.slug && !t.alternatives.includes(o.slug) && score(o) > 0)
    .sort((a, b) => score(b) - score(a) || (metrics[b.slug]?.stars ?? 0) - (metrics[a.slug]?.stars ?? 0))
    .slice(0, limit)
}
