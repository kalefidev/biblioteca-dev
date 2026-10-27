// Fora de lib/catalog.ts de propósito: o ToolCard usa isto e não pode puxar os dados do catálogo para o JS global.
export const toolHref = (t: { slug: string }) => `/t/${t.slug}`
