// "Quando usar / evitar" no idioma pedido. Módulo separado para ficar fora do JS global (só a página de comparar e o servidor usam).
import { guidance, guidanceEn } from './guidance.ts'
import type { Locale } from './i18n.ts'

export const localizedGuidance = (locale: Locale) => (locale === 'pt-BR' ? guidance : guidanceEn)
