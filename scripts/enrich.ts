// Busca métricas no GitHub e no npm e grava data/metrics.json.
// Uso: GITHUB_TOKEN=... npm run enrich (sem token vale o limite de 60 req/h).
// Tolerante a falha: se uma chamada falhar, mantém o valor anterior.
import { writeFileSync } from 'node:fs'
import { tools, metrics as previous } from '../lib/catalog.ts'
import type { Metrics } from '../lib/schema.ts'

const token = process.env.GITHUB_TOKEN
if (!token) console.warn('! GITHUB_TOKEN ausente: limite de 60 requisições/h do GitHub.')

const get = async <T>(url: string, auth = false, quiet404 = false): Promise<T | null> => {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { accept: 'application/json', 'user-agent': 'biblioteca-dev-enrich', ...(auth && token ? { authorization: `Bearer ${token}` } : {}) },
    })
    if (!res.ok) {
      if (!(quiet404 && res.status === 404)) console.warn(`! ${res.status} ${url}`)
      return null
    }
    return (await res.json()) as T
  } catch (e) {
    console.warn(`! ${url}: ${e}`)
    return null
  }
}

type GH = { stargazers_count: number; pushed_at: string; license: { spdx_id: string } | null }
const gh = (repo: string) => get<GH>(`https://api.github.com/repos/${repo}`, true)
const ghRelease = (repo: string) => get<{ tag_name: string }>(`https://api.github.com/repos/${repo}/releases/latest`, true, true) // repo sem releases é normal
const npmPkg = (name: string) => get<{ version: string }>(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`)
const npmDl = (name: string) => get<{ downloads: number }>(`https://api.npmjs.org/downloads/point/last-week/${name.replace('/', '%2F')}`)

const next: Record<string, Metrics> = { ...previous }
let withRepo = 0
let enriched = 0

for (const t of tools) {
  if (!t.repo && !t.npm) continue
  const old = next[t.slug]
  const [repo, release, pkg, dl] = await Promise.all([
    t.repo ? gh(t.repo) : null,
    t.repo && !t.npm ? ghRelease(t.repo) : null,
    t.npm ? npmPkg(t.npm) : null,
    t.npm ? npmDl(t.npm) : null,
  ])
  if (t.repo) withRepo++
  const spdx = repo?.license?.spdx_id
  if (spdx && spdx !== 'NOASSERTION' && !t.license.includes(spdx)) {
    console.warn(`! licença de ${t.slug}: curada "${t.license}", GitHub "${spdx}"`)
  }
  const m: Metrics = {
    stars: repo?.stargazers_count ?? old?.stars ?? null,
    version: pkg?.version ?? release?.tag_name ?? old?.version ?? null,
    lastCommit: repo?.pushed_at ?? old?.lastCommit ?? null,
    weeklyDownloads: dl?.downloads ?? old?.weeklyDownloads ?? null,
    updatedAt: new Date().toISOString(),
  }
  if (t.repo && repo) enriched++
  next[t.slug] = m
}

const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(new URL('../data/metrics.json', import.meta.url), JSON.stringify(sorted, null, 2) + '\n')
console.log(`✓ métricas: ${enriched}/${withRepo} repositórios, ${Object.keys(sorted).length} entradas`)
