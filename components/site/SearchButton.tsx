"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

// A paleta (e o índice de busca) só é baixada na primeira vez que alguém a abre.
const CommandPalette = dynamic(() => import("./CommandPalette").then((m) => m.CommandPalette), { ssr: false });

export function SearchButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const show = () => { setOpen(true); setEverOpened(true); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={t.palette.open}
        aria-keyshortcuts="Control+K Meta+K"
        className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg sm:w-56 sm:border sm:border-line sm:bg-surface"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3.5 3.5" />
        </svg>
        <span className="hidden flex-1 text-left sm:inline">{t.palette.open}…</span>
        <kbd className="hidden rounded border border-line px-1.5 font-mono text-xs text-fg-subtle sm:inline">Ctrl K</kbd>
      </button>
      {everOpened && <CommandPalette open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
