import { ImageResponse } from 'next/og'
import { LOCALES, hasLocale, i18n } from '@/lib/i18n'

export const alt = 'Dev Tools Library'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }))

// Imagem de compartilhamento do site (herdada pelas páginas), uma por idioma. Cores = tokens escuros de globals.css.
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const { t } = i18n(hasLocale(lang) ? lang : 'en')
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 80, background: '#131312', color: '#ecebe6' }}>
        <div style={{ fontSize: 28, color: '#ee7a54', letterSpacing: 2 }}>{t.home.eyebrow.toUpperCase()}</div>
        <div style={{ fontSize: 88, lineHeight: 1, marginTop: 24, maxWidth: 900 }}>{t.site.name}</div>
        <div style={{ fontSize: 32, color: '#a3a097', marginTop: 28, maxWidth: 900 }}>{t.site.description}</div>
      </div>
    ),
    size,
  )
}
