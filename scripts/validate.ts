// Valida o catálogo. Roda antes do build (prebuild); sai com código 1 se algo estiver errado.
import { z } from 'zod'
import { categories, toolFiles, metrics, overlayEn } from '../lib/catalog.ts'
import { guidance, guidanceEn } from '../lib/guidance.ts'
import { categorySchema, guidanceSchema, metricsSchema, toolSchema } from '../lib/schema.ts'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

const cats = z.array(categorySchema).safeParse(categories)
if (!cats.success) fail(`data/categories.json: ${z.prettifyError(cats.error)}`)
const catIds = new Set(categories.map((c) => c.id))
if (catIds.size !== categories.length) fail('data/categories.json: ids duplicados')

const slugs = new Map<string, string>()
const tools = Object.entries(toolFiles).flatMap(([file, list]) => {
  if (!catIds.has(file)) fail(`data/tools/${file}.json: não existe em categories.json`)
  return list.flatMap((raw, i) => {
    const r = toolSchema.safeParse(raw)
    if (!r.success) return fail(`data/tools/${file}.json[${i}]: ${z.prettifyError(r.error)}`), []
    const t = r.data
    if (t.category !== file) fail(`${t.slug}: category "${t.category}" difere do arquivo ${file}.json`)
    const prev = slugs.get(t.slug)
    if (prev) fail(`${t.slug}: slug duplicado (${prev} e ${file})`)
    slugs.set(t.slug, file)
    return [t]
  })
})

for (const t of tools) {
  for (const a of t.alternatives) {
    if (a === t.slug) fail(`${t.slug}: alternatives contém ele mesmo`)
    else if (!slugs.has(a)) fail(`${t.slug}: alternativa "${a}" não existe`)
  }
}

for (const [slug, m] of Object.entries(metrics)) {
  if (!slugs.has(slug)) fail(`data/metrics.json: slug "${slug}" não existe no catálogo`)
  const r = metricsSchema.safeParse(m)
  if (!r.success) fail(`data/metrics.json[${slug}]: ${z.prettifyError(r.error)}`)
}

for (const slug of slugs.keys()) if (!guidance[slug]) fail(`data/guidance.json: falta "${slug}"`)
for (const [slug, g] of Object.entries(guidance)) {
  if (!slugs.has(slug)) fail(`data/guidance.json: slug "${slug}" não existe no catálogo`)
  const r = guidanceSchema.safeParse(g)
  if (!r.success) fail(`data/guidance.json[${slug}]: ${z.prettifyError(r.error)}`)
}

// Tradução en (data/i18n/en.json): cobre todo texto curado dos JSON-base (pt-BR) e não tem chave sobrando.
const covers = (what: string, need: Iterable<string>, have: Record<string, unknown>) => {
  const needed = new Set(need)
  for (const k of needed) if (!(k in have)) fail(`data/i18n/${what === 'guidance' ? 'en-guidance' : 'en'}.json ${what}: falta "${k}"`)
  for (const k of Object.keys(have)) if (!needed.has(k)) fail(`data/i18n/${what === 'guidance' ? 'en-guidance' : 'en'}.json ${what}: "${k}" não existe nos dados-base`)
}
covers('categories', catIds, overlayEn.categories)
covers('subcategories', tools.map((t) => t.subcategory), overlayEn.subcategories)
covers('tools', slugs.keys(), overlayEn.tools)
covers('guidance', slugs.keys(), guidanceEn)
for (const [slug, o] of Object.entries(overlayEn.tools)) {
  const r = toolSchema.pick({ tagline: true, description: true }).safeParse(o)
  if (!r.success) fail(`data/i18n/en.json tools[${slug}]: ${z.prettifyError(r.error)}`)
}
for (const [slug, g] of Object.entries(guidanceEn)) {
  const r = guidanceSchema.safeParse(g)
  if (!r.success) fail(`data/i18n/en-guidance.json[${slug}]: ${z.prettifyError(r.error)}`)
}

if (errors.length) {
  console.error(`✗ ${errors.length} erro(s) no catálogo:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`✓ catálogo ok: ${tools.length} ferramentas, ${categories.length} categorias`)
