"use client";

import { useI18n } from "@/components/I18nProvider";

// Sem estado: o ícone certo é escolhido por CSS a partir de <html data-theme>, então não há mismatch de hidratação.
export function ThemeToggle() {
  const { t } = useI18n();
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  const icon = "size-5 fill-none stroke-current stroke-[1.5]";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.theme.toggle}
      className="grid size-11 place-items-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg active:bg-line"
    >
      <svg viewBox="0 0 24 24" className={`${icon} [[data-theme=dark]_&]:hidden`} aria-hidden>
        <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
      </svg>
      <svg viewBox="0 0 24 24" className={`${icon} hidden [[data-theme=dark]_&]:block`} aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
