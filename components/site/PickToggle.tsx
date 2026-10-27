"use client";

import { usePicks, type PickKey } from "@/lib/picks";
import { pt } from "@/messages/pt-BR";

const labels = {
  compare: [pt.picks.compare, pt.picks.comparing],
  stack: [pt.picks.stackAdd, pt.picks.stackIn],
} as const;

/** Liga/desliga uma ferramenta na lista de comparação ou na stack. `size="sm"` é a versão dos cards. */
export function PickToggle({ slug, list, size = "md" }: { slug: string; list: PickKey; size?: "sm" | "md" }) {
  const { has, full, toggle } = usePicks(list);
  const on = has(slug);
  const blocked = full && !on;
  const [off, active] = labels[list];

  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={blocked}
      title={blocked ? pt.picks.compareFull : undefined}
      onClick={() => toggle(slug)}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-lg border whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "sm" ? "h-8 px-2.5 text-xs after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']" : "h-11 px-4 text-sm"
      } ${
        on
          ? "border-transparent bg-accent-soft text-accent"
          : "border-line text-fg-muted hover:border-line-strong hover:bg-surface-2 hover:text-fg"
      }`}
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {on ? <path d="m3.5 8.5 3 3 6-7" /> : <path d="M8 3.5v9M3.5 8h9" />}
      </svg>
      {on ? active : off}
    </button>
  );
}
