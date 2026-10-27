import { Link } from "@/components/Link";
import { getI18n } from "@/lib/i18n-server";
import { LocaleSwitch } from "./LocaleSwitch";
import { SearchButton } from "./SearchButton";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const { t } = await getI18n();
  const links = [
    ["/tools", t.nav.catalog],
    ["/stack", t.nav.stack],
    ["/explore", t.nav.explore],
  ] as const;
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between gap-2 px-3 sm:px-6">
        <Link href="/" className="flex h-11 shrink-0 items-center gap-2 font-medium tracking-tight max-sm:w-11 max-sm:justify-center">
          <span aria-hidden className="size-2.5 rounded-full bg-accent" />
          <span className="max-sm:sr-only">{t.site.name}</span>
        </Link>
        <nav aria-label={t.nav.main} className="flex items-center sm:gap-1">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex h-11 items-center rounded-lg px-1 text-sm whitespace-nowrap sm:px-3 text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            >
              {label}
            </Link>
          ))}
          <SearchButton />
          <LocaleSwitch />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
