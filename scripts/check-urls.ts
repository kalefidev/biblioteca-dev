// Confere se o site de cada ferramenta responde. Manual (usa rede): npm run check-urls
import { tools } from '../lib/catalog.ts'

const check = async (url: string) => {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 biblioteca-dev-check' } })
    return { status: res.status, final: res.url }
  } catch (e) {
    return { status: 0, final: String(e) }
  }
}

const results = await Promise.all(tools.map(async (t) => ({ t, ...(await check(t.url)) })))
let bad = 0
for (const { t, status, final } of results) {
  const moved = status && new URL(final).origin !== new URL(t.url).origin ? ` → ${final}` : ''
  // 403/429 costumam ser bloqueio de bot, não link quebrado.
  const flag = status >= 200 && status < 400 ? 'ok ' : status === 403 || status === 429 ? '?  ' : 'ERR'
  if (flag === 'ERR') bad++
  console.log(`${flag} ${String(status).padEnd(3)} ${t.slug.padEnd(16)} ${t.url}${moved}`)
}
process.exit(bad ? 1 : 0)
