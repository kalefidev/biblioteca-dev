// URL pública do site (canonical, sitemap, OpenGraph). Defina SITE_URL no ambiente de build;
// na Vercel, cai no domínio de produção do projeto; em dev, localhost.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const SITE_URL = (process.env.SITE_URL ?? (vercel ? `https://${vercel}` : 'http://localhost:3000')).replace(/\/$/, '')
