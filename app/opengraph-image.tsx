import { ImageResponse } from 'next/og'
import { pt } from '@/messages/pt-BR'

export const alt = pt.site.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Imagem de compartilhamento única do site (herdada pelas páginas). Cores = tokens escuros de globals.css.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 80, background: '#131312', color: '#ecebe6' }}>
        <div style={{ fontSize: 28, color: '#ee7a54', letterSpacing: 2 }}>CATÁLOGO PARA DEVS</div>
        <div style={{ fontSize: 88, lineHeight: 1, marginTop: 24, maxWidth: 900 }}>{pt.site.name}</div>
        <div style={{ fontSize: 32, color: '#a3a097', marginTop: 28, maxWidth: 900 }}>{pt.site.description}</div>
      </div>
    ),
    size,
  )
}
