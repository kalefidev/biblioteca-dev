import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

// Shell do site. /explore fica fora deste grupo porque ocupa a tela inteira.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-300 flex-1 px-4 sm:px-6">{children}</main>
      <Footer />
    </>
  );
}
