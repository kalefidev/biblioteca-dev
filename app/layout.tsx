import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { SITE_URL } from "@/lib/site";
import { pt } from "@/messages/pt-BR";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Só para títulos de destaque (display); o resto do site é Geist.
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: pt.site.name, template: `%s · ${pt.site.name}` },
  description: pt.site.description,
  openGraph: { type: "website", siteName: pt.site.name, locale: "pt_BR" },
  twitter: { card: "summary_large_image" },
};

// Aplica o tema salvo antes da primeira pintura (evita flash). Constante estática, sem dados externos.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;else document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#conteudo" className="fixed top-2 left-2 z-50 -translate-y-20 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-fg focus:translate-y-0">
          {pt.site.skip}
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
