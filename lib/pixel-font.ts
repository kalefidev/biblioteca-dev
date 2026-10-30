import { Pixelify_Sans } from 'next/font/google'

// Fonte pixel só do /explore (placas, títulos da loja, raridade). Self-hosted pelo next/font, então a CSP continua 'self'.
export const pixelFont = Pixelify_Sans({ variable: '--font-pixelify', subsets: ['latin'], weight: ['400', '600'] })
