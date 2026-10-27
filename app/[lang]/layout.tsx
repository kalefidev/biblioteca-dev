import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/I18nProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { LOCALES, hasLocale, i18n } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Só para títulos de destaque (display); o resto do site é Geist.
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400" });

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { t, og } = i18n(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.site.name, template: `%s · ${t.site.name}` },
    description: t.site.description,
    openGraph: { type: "website", siteName: t.site.name, locale: og },
    twitter: { card: "summary_large_image" },
  };
}

// Aplica o tema salvo antes da primeira pintura (evita flash). Constante estática, sem dados externos.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;else document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { t } = i18n(lang);
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#content" className="fixed top-2 left-2 z-50 -translate-y-20 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-fg focus:translate-y-0">
          {t.site.skip}
        </a>
        <I18nProvider locale={lang}>
          <MotionProvider>{children}</MotionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
