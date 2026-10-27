// Fonte única dos dados curados. Importável pelo app e pelos scripts (Node roda .ts direto).
import type { Category, Metrics, Tool } from './schema.ts'
import categoriesJson from '../data/categories.json' with { type: 'json' }
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
