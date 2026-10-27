'use server'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { z } from 'zod'
import { categories, tools } from '@/lib/catalog'
import { hasLocale } from '@/lib/i18n'
import { fold } from '@/lib/text'

export type SuggestState =
  | { status: 'idle' | 'sent' | 'limited' | 'down' }
  | { status: 'exists'; slug: string; name: string }
  | { status: 'invalid'; fields: ('name' | 'url' | 'note')[] }

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  url: z.url({ protocol: /^https?$/ }).max(300),
  category: z.enum(categories.map((c) => c.id) as [string, ...string[]]).optional(),
  note: z.string().trim().max(1000),
})

// host+caminho sem "www." nem barra final: https://www.vite.dev/ == vite.dev
const urlKey = (u: string) => {
  const x = new URL(u)
  return `${x.hostname.replace(/^www\./, '')}${x.pathname.replace(/\/+$/, '')}`.toLowerCase()
}
const known = new Map<string, (typeof tools)[number]>()
for (const t of tools) {
  known.set(fold(t.name), t)
  known.set(urlKey(t.url), t)
  if (t.repo) known.set(`github.com/${t.repo}`.toLowerCase(), t)
}

/** Grava a sugestão no Supabase (tabela `suggestions`: o papel anon só insere; limite por IP no próprio banco). */
export async function suggest(locale: string, _prev: SuggestState, form: FormData): Promise<SuggestState> {
  if (!hasLocale(locale)) return { status: 'down' }
  if (form.get('website')) return { status: 'sent' } // campo-isca: só robô preenche; finge que deu certo

  const parsed = schema.safeParse({
    name: form.get('name') ?? '',
    url: String(form.get('url') ?? '').trim(),
    category: form.get('category') || undefined,
    note: form.get('note') ?? '',
  })
  if (!parsed.success) {
    return { status: 'invalid', fields: [...new Set(parsed.error.issues.map((i) => i.path[0]))].filter((f) => f !== 'category') as ('name' | 'url' | 'note')[] }
  }
  const { name, url, category, note } = parsed.data

  const dup = known.get(fold(name)) ?? known.get(urlKey(url))
  if (dup) return { status: 'exists', slug: dup.slug, name: dup.name }

  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUGGEST_SALT } = process.env
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUGGEST_SALT) return { status: 'down' }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/suggestions`, {
      method: 'POST',
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        name, url, note: note || null, category: category ?? null, locale,
        ip_hash: createHmac('sha256', SUGGEST_SALT).update(ip).digest('hex'),
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) return { status: 'sent' }
    const body = await res.json().catch(() => null)
    if (body?.message === 'rate_limited') return { status: 'limited' }
    console.error('suggest: supabase respondeu', res.status, body?.code)
  } catch (e) {
    console.error('suggest: falha de rede', e) // projeto free pausado também cai aqui
  }
  return { status: 'down' }
}
