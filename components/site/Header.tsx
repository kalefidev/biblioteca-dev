import Link from "next/link";
import { pt } from "@/messages/pt-BR";
import { ThemeToggle } from "./ThemeToggle";

// A busca (com Cmd/Ctrl+K) entra aqui na etapa 3, junto com o catálogo.
export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex h-11 items-center gap-2 font-medium tracking-tight">
          <span aria-hidden className="size-2.5 rounded-full bg-accent" />
          {pt.site.name}
        </Link>
        <nav aria-label={pt.nav.main} className="flex items-center gap-1">
          <Link
            href="/explore"
            className="flex h-11 items-center rounded-lg px-3 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          >
            {pt.nav.explore}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
