import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { NotFound } from "@/components/site/NotFound";

// Fallback do not-found no nível do layout raiz: o (site)/layout não se aplica aqui, então monta o shell à mão.
export default function RootNotFound() {
  return (
    <>
      <Header />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-300 flex-1 px-4 focus:outline-none sm:px-6">
        <NotFound />
      </main>
      <Footer />
    </>
  );
}
