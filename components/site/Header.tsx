import Link from "next/link";
import { pt } from "@/messages/pt-BR";
import { SearchButton } from "./SearchButton";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  ["/tools", pt.nav.catalog],
  ["/stack", pt.nav.stack],
  ["/explore", pt.nav.explore],
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className="flex h-11 shrink-0 items-center gap-2 font-medium tracking-tight max-sm:w-11 max-sm:justify-center">
          <span aria-hidden className="size-2.5 rounded-full bg-accent" />
          <span className="max-sm:sr-only">{pt.site.name}</span>
        </Link>
        <nav aria-label={pt.nav.main} className="flex items-center gap-1">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex h-11 items-center rounded-lg px-2 text-sm whitespace-nowrap sm:px-3 text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            >
              {label}
            </Link>
          ))}
          <SearchButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
