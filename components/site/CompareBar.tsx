"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePicks } from "@/lib/picks";
import { pt } from "@/messages/pt-BR";

/** Barra fixa com a seleção de comparação. Some quando a lista está vazia e na própria página de comparação. */
export function CompareBar() {
  const { list, clear } = usePicks("compare");
  const pathname = usePathname();
  if (list.length === 0 || pathname === "/compare") return null;

  const ready = list.length >= 2;
  const href = `/compare?${list.map((s) => `t=${s}`).join("&")}`;

  return (
    <div
      role="region"
      aria-label={pt.compare.barLabel}
      className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-line-strong bg-surface p-2 pl-4 shadow-float"
    >
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-medium">{pt.compare.bar(list.length)}</span>
        {!ready && <span className="block truncate text-xs text-fg-subtle">{pt.compare.needTwo}</span>}
      </p>
      <button
        type="button"
        onClick={clear}
        className="h-11 rounded-lg px-3 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
      >
        {pt.compare.clear}
      </button>
      {ready ? (
        <Link href={href} className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90">
          {pt.compare.go}
        </Link>
      ) : (
        <span aria-disabled className="inline-flex h-11 items-center rounded-lg bg-surface-2 px-4 text-sm font-medium text-fg-subtle">
          {pt.compare.go}
        </span>
      )}
    </div>
  );
}
