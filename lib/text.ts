/** Minúsculas e sem acento, caractere a caractere (mantém o comprimento para o destaque). */
export const fold = (s: string) => Array.from(s, (c) => c.normalize('NFD')[0].toLowerCase()).join('')

export const queryTerms = (q: string) => fold(q).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
