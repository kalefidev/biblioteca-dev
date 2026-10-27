"use client";

import { useActionState, useState } from "react";
import { m } from "motion/react";
import { Link } from "@/components/Link";
import { useI18n } from "@/components/I18nProvider";
import type { SuggestState } from "@/app/[lang]/(site)/suggest/actions";
import { toolHref } from "@/lib/tool-href";
import { dur, ease } from "@/lib/motion";

type Action = (prev: SuggestState, form: FormData) => Promise<SuggestState>;

const field =
  "w-full rounded-xl border border-line bg-surface px-4 text-base transition-colors duration-150 placeholder:text-fg-subtle hover:border-line-strong focus-visible:border-accent focus-visible:outline-none aria-invalid:border-accent";

/** Formulário de sugestão. "Sugerir outra" remonta o formulário (zera o estado da ação). */
export function SuggestForm(props: { action: Action; categories: { id: string; label: string }[] }) {
  const [round, setRound] = useState(0);
  return <Inner key={round} {...props} again={() => setRound((r) => r + 1)} />;
}

function Inner({ action, categories, again }: { action: Action; categories: { id: string; label: string }[]; again: () => void }) {
  const { t } = useI18n();
  const s = t.suggest;
  const [state, run, pending] = useActionState(action, { status: "idle" });
  // O React limpa o formulário depois de cada envio; guardamos os valores para devolvê-los quando der erro.
  const [values, setValues] = useState<Record<string, string>>({});
  const bad = (f: "name" | "url" | "note") => state.status === "invalid" && state.fields.includes(f);

  if (state.status === "sent") {
    return (
      <m.div
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.base, ease }}
        className="rounded-2xl border border-line bg-surface p-8"
      >
        <p className="text-lg font-medium tracking-tight">{s.sent}</p>
        <button type="button" onClick={again} className="mt-6 inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium transition-colors duration-150 hover:border-line-strong hover:bg-surface-2">
          {s.another}
        </button>
      </m.div>
    );
  }

  const error =
    state.status === "limited" ? s.errors.limited :
    state.status === "down" ? s.errors.down : null;

  return (
    <form
      action={(fd) => {
        setValues(Object.fromEntries([...fd].map(([k, v]) => [k, String(v)])));
        run(fd);
      }}
      className="relative flex flex-col gap-6"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{s.name}</span>
        <input name="name" required minLength={2} maxLength={80} defaultValue={values.name} placeholder={s.namePlaceholder} autoComplete="off" aria-invalid={bad("name") || undefined} aria-describedby={bad("name") ? "e-name" : undefined} className={`${field} h-12`} />
        {bad("name") && <span id="e-name" className="text-sm text-accent">{s.errors.name}</span>}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{s.url}</span>
        <input name="url" type="url" required maxLength={300} pattern="https?://.+" defaultValue={values.url} placeholder={s.urlPlaceholder} autoComplete="url" aria-invalid={bad("url") || undefined} aria-describedby={bad("url") ? "e-url" : undefined} className={`${field} h-12 font-mono text-sm`} />
        {bad("url") && <span id="e-url" className="text-sm text-accent">{s.errors.url}</span>}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{s.category}</span>
        <select name="category" defaultValue={values.category ?? ""} className={`${field} h-12`}>
          <option value="">{s.categoryAny}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">{s.note}</span>
        <textarea name="note" rows={4} maxLength={1000} defaultValue={values.note} placeholder={s.notePlaceholder} aria-invalid={bad("note") || undefined} className={`${field} resize-y py-3`} />
        {bad("note") && <span className="text-sm text-accent">{s.errors.note}</span>}
      </label>

      {/* Campo-isca: invisível para pessoas e leitores de tela; robôs costumam preencher. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div role="status" className="empty:hidden">
        {error && <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">{error}</p>}
        {state.status === "exists" && (
          <p className="rounded-lg bg-surface-2 px-4 py-3 text-sm">
            {s.exists(state.name)}{" "}
            <Link href={toolHref({ slug: state.slug })} className="font-medium text-accent underline underline-offset-4">{s.seeTool}</Link>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-accent px-7 font-medium text-accent-fg transition-[background-color,opacity] duration-150 hover:bg-[color-mix(in_srgb,var(--accent)_88%,var(--fg))] disabled:opacity-60"
        >
          {pending ? s.sending : s.send}
        </button>
        <p className="max-w-[40ch] text-xs text-fg-subtle">{s.privacy}</p>
      </div>
    </form>
  );
}
