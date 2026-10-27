import type { ReactNode } from "react";

const tones = {
  neutral: "border-line text-fg-muted",
  accent: "border-transparent bg-accent-soft text-accent", // único destaque de cor (Von Restorff)
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}
