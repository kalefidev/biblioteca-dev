// "Quando usar / evitar" (pt-BR em data/guidance.json, en em data/i18n/en-guidance.json).
// Módulo à parte de lib/catalog.ts: é o maior bloco de texto e só a página de comparar e o servidor precisam dele.
import type { Guidance } from './schema.ts'
import guidanceJson from '../data/guidance.json' with { type: 'json' }
import guidanceEnJson from '../data/i18n/en-guidance.json' with { type: 'json' }

export const guidance = guidanceJson as Record<string, Guidance>
export const guidanceEn = guidanceEnJson as Record<string, Guidance>
