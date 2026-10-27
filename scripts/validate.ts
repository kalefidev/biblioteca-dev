// Valida o catálogo. Roda antes do build (prebuild); sai com código 1 se algo estiver errado.
import { z } from 'zod'
import { categories, toolFiles, metrics } from '../lib/catalog.ts'
import { categorySchema, metricsSchema, toolSchema } from '../lib/schema.ts'

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

if (errors.length) {
  console.error(`✗ ${errors.length} erro(s) no catálogo:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`✓ catálogo ok: ${tools.length} ferramentas, ${categories.length} categorias`)
