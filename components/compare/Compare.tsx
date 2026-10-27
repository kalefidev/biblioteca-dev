"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { categories, guidance, metrics, toolBySlug, toolHref, tools } from "@/lib/catalog";
import { COMPARE_MAX } from "@/lib/picks";
import type { Tool } from "@/lib/schema";
import { pt } from "@/messages/pt-BR";

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" });
const num = (n: number | null | undefined) => (n == null ? null : compact.format(n));

// `diff: false`: números e textos que quase sempre diferem; não entram no destaque de diferenças.
type Row = { label: string; cell: (t: Tool) => ReactNode; mono?: boolean; diff?: false };

const rows: Row[] = [
  { label: pt.compare.category, cell: (t) => categories.find((c) => c.id === t.category)?.label },
  { label: pt.compare.kind, cell: (t) => pt.kind[t.kind] },
  { label: pt.compare.pricing, cell: (t) => pt.pricing[t.pricing] },
  { label: pt.tool.license, cell: (t) => t.license },
  { label: pt.tool.platforms, cell: (t) => t.platforms.map((p) => pt.platform[p]).join(", ") },
  { label: pt.tool.languages, cell: (t) => t.languages.map((l) => pt.language[l] ?? l).join(", ") },
  { label: pt.tool.stars, cell: (t) => num(metrics[t.slug]?.stars), diff: false },
  { label: pt.tool.version, cell: (t) => metrics[t.slug]?.version, mono: true, diff: false },
  { label: pt.tool.lastCommit, cell: (t) => { const d = metrics[t.slug]?.lastCommit; return d && date.format(new Date(d)); }, diff: false },
  { label: pt.tool.downloads, cell: (t) => num(metrics[t.slug]?.weeklyDownloads), diff: false },
  { label: pt.tool.use, cell: (t) => guidance[t.slug].use, diff: false },
  { label: pt.tool.avoid, cell: (t) => guidance[t.slug].avoid, diff: false },
];

/** Comparação lado a lado. A fonte da verdade é a URL: `/compare?t=react&t=svelte` (link compartilhável). */
export function Compare() {
  const params = useSearchParams();
  const pathname = usePathname();
  const [onlyDiffs, setOnlyDiffs] = useState(false);

  const picked = useMemo(
    () => [...new Set(params.getAll("t"))].flatMap((s) => toolBySlug.get(s) ?? []).slice(0, COMPARE_MAX),
    [params],
  );

  function setPicked(next: string[]) {
    const qs = next.map((s) => `t=${s}`).join("&");
    window.history.pushState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  const picker = picked.length < COMPARE_MAX && (
    <select
      aria-label={pt.compare.addLabel}
      value=""
      onChange={(e) => e.target.value && setPicked([...picked.map((t) => t.slug), e.target.value])}
      className="h-11 rounded-lg border border-line bg-surface px-3 text-sm"
    >
      <option value="">{pt.compare.add}</option>
      {categories.map((c) => (
        <optgroup key={c.id} label={c.label}>
          {tools
            .filter((t) => t.category === c.id && !picked.includes(t))
            .map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </optgroup>
      ))}
    </select>
  );

  if (picked.length === 0) {
    return (
      <EmptyState
        title={pt.compare.emptyTitle}
        hint={pt.compare.emptyHint}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            {picker}
            <Link href="/tools" className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm hover:bg-surface-2">
              {pt.compare.emptyAction}
            </Link>
          </div>
        }
      />
    );
  }

  const cells = rows.map((r) => {
    const values = picked.map((t) => r.cell(t) ?? null);
    const differs = r.diff !== false && picked.length > 1 && new Set(values.map((v) => v ?? "")).size > 1;
    return { r, values, differs };
  });
  const shown = onlyDiffs ? cells.filter((c) => c.differs) : cells;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {picker}
        {picked.length > 1 && (
          <label className="flex min-h-11 items-center gap-2 text-sm text-fg-muted">
            <input type="checkbox" checked={onlyDiffs} onChange={(e) => setOnlyDiffs(e.target.checked)} className="size-4 accent-(--accent)" />
            {pt.compare.onlyDiffs}
          </label>
        )}
      </div>
      {picked.length === 1 && <p className="mb-6 text-sm text-fg-muted">{pt.compare.needMore}</p>}

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-xl border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line align-bottom">
              <th scope="col" className="sticky left-0 w-28 bg-bg p-4 sm:w-36 font-normal text-fg-subtle">{pt.compare.attribute}</th>
              {picked.map((t) => (
                <th key={t.slug} scope="col" className="p-4 align-top font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={toolHref(t)} className="inline-flex min-h-11 items-center font-display text-xl tracking-tight underline-offset-4 hover:underline">
                      {t.name}
                    </Link>
                    <button
                      type="button"
                      aria-label={pt.compare.remove(t.name)}
                      onClick={() => setPicked(picked.filter((p) => p !== t).map((p) => p.slug))}
                      className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-fg-subtle hover:bg-surface-2 hover:text-fg"
                    >
                      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="m4 4 8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-normal text-fg-muted">{t.tagline}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(({ r, values, differs }) => (
              <tr key={r.label} className="border-b border-line align-top last:border-b-0">
                <th scope="row" className="sticky left-0 bg-bg p-4 font-normal text-fg-muted">
                  <span className="flex items-center gap-2">
                    {differs && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />}
                    {r.label}
                    {differs && <span className="sr-only">({pt.compare.differs})</span>}
                  </span>
                </th>
                {values.map((v, i) => (
                  <td
                    key={picked[i].slug}
                    className={`p-4 ${r.mono ? "font-mono" : ""} ${differs ? "bg-accent-soft text-fg" : "text-fg-muted"}`}
                  >
                    {v ?? <span className="text-fg-subtle">{pt.compare.none}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onlyDiffs && shown.length === 0 && <p className="mt-6 text-sm text-fg-muted">{pt.compare.sameAll}</p>}
    </>
  );
}
