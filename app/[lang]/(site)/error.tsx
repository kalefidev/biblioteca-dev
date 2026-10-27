"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useI18n } from "@/components/I18nProvider";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="py-24">
      <EmptyState
        title={t.states.errorTitle}
        hint={t.states.errorHint}
        action={
          <button type="button" onClick={() => retry()} className="h-11 rounded-lg bg-accent px-5 font-medium text-accent-fg">
            {t.states.errorAction}
          </button>
        }
      />
    </div>
  );
}
