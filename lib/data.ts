// Adaptador do catálogo para o modo Explorar 3D (posições na esfera).
import { categories as cats, tools as all } from './catalog.ts'

export type V3 = [number, number, number]
export type Tool = { name: string; desc: string; url: string; tags: string[]; cat: string; pos: V3 }
export type Category = { id: string; label: string; color: string; pos: V3; tools: Tool[] }

// Distribui i de n pontos numa esfera de raio r (espiral de Fibonacci).
const fib = (i: number, n: number, r: number): V3 => {
  const y = 1 - (2 * (i + 0.5)) / n
  const rad = Math.sqrt(1 - y * y)
  const a = i * 2.399963
  return [Math.cos(a) * rad * r, y * r, Math.sin(a) * rad * r]
}

export const CLUSTER_R = 3
export const categories: Category[] = cats.map(({ id, label, color }, i) => {
  const pos = fib(i, cats.length, 16)
  const list = all.filter((t) => t.category === id)
  return {
    id, label, color, pos,
    tools: list.map((t, j) => {
      const o = fib(j, list.length, CLUSTER_R)
      return { name: t.name, desc: t.tagline, url: t.url, tags: t.tags, cat: id, pos: [pos[0] + o[0], pos[1] + o[1], pos[2] + o[2]] as V3 }
    }),
  }
})
export const allTools = categories.flatMap((c) => c.tools)
export const catById = Object.fromEntries(categories.map((c) => [c.id, c]))

export const matches = (t: Tool, q: string) =>
  !q || `${t.name} ${t.desc} ${t.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())
