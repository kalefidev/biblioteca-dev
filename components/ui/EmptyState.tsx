import type { ReactNode } from "react";

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
      <p className="text-lg font-medium tracking-tight">{title}</p>
      {hint && <p className="max-w-[45ch] text-fg-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
