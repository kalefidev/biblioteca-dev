// Raridade do modo Explorar: posição em estrelas no GitHub dentro do catálogo (não é opinião).
// Sem repositório (Cursor, Warp...) = "unknown", para não parecer "comum" por falta de dado.
import { metrics, tools } from './catalog.ts'

export const RARITIES = ['legendary', 'epic', 'rare', 'common', 'unknown'] as const
export type Rarity = (typeof RARITIES)[number]

// Fatia do topo de cada nível: 5% lendário, até 20% épico, até 50% raro, resto comum.
const CUTS: [number, Rarity][] = [[0.05, 'legendary'], [0.2, 'epic'], [0.5, 'rare'], [1, 'common']]

const ranked = tools
  .filter((t) => metrics[t.slug]?.stars != null)
  .sort((a, b) => metrics[b.slug].stars! - metrics[a.slug].stars!)
const bySlug = new Map(ranked.map((t, i) => [t.slug, CUTS.find(([p]) => i < ranked.length * p)![1]]))

export const rarity = (slug: string): Rarity => bySlug.get(slug) ?? 'unknown'
