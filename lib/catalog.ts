// Fonte única dos dados curados. Importável pelo app e pelos scripts (Node roda .ts direto).
import type { Category, Guidance, Metrics, Tool } from './schema.ts'
import categoriesJson from '../data/categories.json' with { type: 'json' }
import guidanceJson from '../data/guidance.json' with { type: 'json' }
import metricsJson from '../data/metrics.json' with { type: 'json' }
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

export const guidance = guidanceJson as Record<string, Guidance>
export const toolBySlug = new Map(tools.map((t) => [t.slug, t]))

export const toolHref = (t: Tool) => `/t/${t.slug}`

/** Ferramentas parecidas que não são alternativas diretas: mesma categoria, ordenadas por subcategoria e tags em comum. */
export function relatedTo(t: Tool, limit = 4): Tool[] {
  const score = (o: Tool) => (o.subcategory === t.subcategory ? 2 : 0) + o.tags.filter((tag) => t.tags.includes(tag)).length
  return tools
    .filter((o) => o.category === t.category && o.slug !== t.slug && !t.alternatives.includes(o.slug) && score(o) > 0)
    .sort((a, b) => score(b) - score(a) || (metrics[b.slug]?.stars ?? 0) - (metrics[a.slug]?.stars ?? 0))
    .slice(0, limit)
}
