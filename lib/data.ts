// Adaptador do catálogo para o modo Explorar 3D (posições na esfera).
import { categories as cats, tools as all } from './catalog.ts'

export type V3 = [number, number, number]
export type Node3 = { slug: string; name: string; cat: string; pos: V3 }
export type Cluster = { id: string; color: string; pos: V3; tools: Node3[] }

// Distribui i de n pontos numa esfera de raio r (espiral de Fibonacci).
const fib = (i: number, n: number, r: number): V3 => {
  const y = 1 - (2 * (i + 0.5)) / n
  const rad = Math.sqrt(1 - y * y)
  const a = i * 2.399963
  return [Math.cos(a) * rad * r, y * r, Math.sin(a) * rad * r]
}

export const CLUSTER_R = 3
export const SPREAD_R = 16
export const clusters: Cluster[] = cats.map(({ id, color }, i) => {
  const pos = fib(i, cats.length, SPREAD_R)
  const list = all.filter((t) => t.category === id)
  return {
    id, color, pos,
    tools: list.map((t, j) => {
      const o = fib(j, list.length, CLUSTER_R)
      return { slug: t.slug, name: t.name, cat: id, pos: [pos[0] + o[0], pos[1] + o[1], pos[2] + o[2]] as V3 }
    }),
  }
})
export const nodes = clusters.flatMap((c) => c.tools)
export const clusterById = Object.fromEntries(clusters.map((c) => [c.id, c]))
