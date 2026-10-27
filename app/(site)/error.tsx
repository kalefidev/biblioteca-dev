"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { pt } from "@/messages/pt-BR";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="py-24">
      <EmptyState
        title={pt.states.errorTitle}
        hint={pt.states.errorHint}
        action={
          <button type="button" onClick={() => retry()} className="h-11 rounded-lg bg-accent px-5 font-medium text-accent-fg">
            {pt.states.errorAction}
          </button>
        }
      />
    </div>
  );
}
