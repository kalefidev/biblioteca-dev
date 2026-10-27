import { pt } from "@/messages/pt-BR";

// Um bloco cinza que pulsa; o motion-reduce do globals.css já neutraliza a animação.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div role="status" aria-label={pt.states.loading} className={`animate-pulse rounded-md bg-surface-2 ${className}`} />;
}

export function ToolCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5" aria-hidden>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-surface-2" />
        <div className="h-4 w-1/3 rounded bg-surface-2" />
      </div>
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-6 w-2/3 rounded bg-surface-2" />
    </div>
  );
}
