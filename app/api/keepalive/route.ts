// Mantém o projeto Supabase do formulário acordado: no plano free ele pausa após 7 dias sem uso.
// Chamado 1x/dia pelo Vercel Cron (vercel.json), que manda `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  const { CRON_SECRET, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env
  if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) return new Response(null, { status: 401 })
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return new Response(null, { status: 500 })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ping`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  return new Response(null, { status: res?.ok ? 204 : 502 })
}
