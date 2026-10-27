"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// <dialog> nativo: foco preso, Esc e fundo inerte vêm de graça. `sheet` = gaveta inferior no mobile.
export function Dialog({
  open, onClose, label, variant = "modal", children,
}: { open: boolean; onClose: () => void; label: string; variant?: "modal" | "sheet"; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  // O conteúdo sai da árvore só depois da animação de saída (CSS em globals.css, ~200ms).
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const position =
    variant === "sheet"
      ? "m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl rounded-b-none lg:hidden"
      : "mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl rounded-2xl";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-variant={variant}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()} // clique no fundo
      className={`${position} overflow-hidden border border-line bg-surface p-0 text-fg shadow-float backdrop:bg-bg/70 backdrop:backdrop-blur-sm`}
    >
      {(open || mounted) && children}
    </dialog>
  );
}
