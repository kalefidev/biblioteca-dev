import { z } from 'zod'

// Valores são chaves estáveis (ASCII); os rótulos de UI ficam em messages/.
export const KINDS = ['library', 'framework', 'cli', 'service', 'app', 'language', 'runtime', 'database'] as const
export const PRICINGS = ['free', 'open-source', 'freemium', 'paid'] as const
export const PLATFORMS = ['web', 'desktop', 'mobile', 'cli', 'cloud'] as const

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

export const toolSchema = z.strictObject({
  slug,
  name: z.string().min(1),
  tagline: z.string().min(1).max(90),
  description: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  kind: z.enum(KINDS),
  pricing: z.enum(PRICINGS),
  license: z.string().min(1),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  languages: z.array(z.string()),
  tags: z.array(z.string()).min(1),
  url: z.url({ protocol: /^https$/ }),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/).optional(), // GitHub: dono/nome
  npm: z.string().optional(),
  featured: z.boolean(),
  alternatives: z.array(slug),
})

export const categorySchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
})

// Preenchido por scripts/enrich.ts; null = não encontrado.
export const metricsSchema = z.strictObject({
  stars: z.number().int().nullable(),
  version: z.string().nullable(),
  lastCommit: z.string().nullable(),
  weeklyDownloads: z.number().int().nullable(),
  updatedAt: z.string(),
})

export type Tool = z.infer<typeof toolSchema>
export type Category = z.infer<typeof categorySchema>
export type Metrics = z.infer<typeof metricsSchema>
