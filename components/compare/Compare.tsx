"use client";

import { Link } from "@/components/Link";
import { useFull } from "@/components/useFull";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { metrics, toolHref } from "@/lib/catalog";
import type { Full } from "@/lib/catalog-i18n";
import type { Guidance } from "@/lib/schema";
import { publicPath } from "@/lib/i18n";
import { COMPARE_MAX } from "@/lib/picks";
import type { Tool } from "@/lib/schema";

// `diff: false`: números e textos que quase sempre diferem; não entram no destaque de diferenças.
type Row = { label: string; cell: (t: Tool) => ReactNode; mono?: boolean; diff?: false };

function buildRows({ t, locale, categories }: Full, guidance: Record<string, Guidance> | null): Row[] {
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
  const num = (n: number | null | undefined) => (n == null ? null : compact.format(n));
  return [
    { label: t.compare.category, cell: (x) => categories.find((c) => c.id === x.category)?.label },
    { label: t.compare.kind, cell: (x) => t.kind[x.kind] },
    { label: t.compare.pricing, cell: (x) => t.pricing[x.pricing] },
    { label: t.tool.license, cell: (x) => x.license },
    { label: t.tool.platforms, cell: (x) => x.platforms.map((p) => t.platform[p]).join(", ") },
    { label: t.tool.languages, cell: (x) => x.languages.map((l) => t.language[l] ?? l).join(", ") },
    { label: t.tool.stars, cell: (x) => num(metrics[x.slug]?.stars), diff: false },
    { label: t.tool.version, cell: (x) => metrics[x.slug]?.version, mono: true, diff: false },
    { label: t.tool.lastCommit, cell: (x) => { const d = metrics[x.slug]?.lastCommit; return d && date.format(new Date(d)); }, diff: false },
    { label: t.tool.downloads, cell: (x) => num(metrics[x.slug]?.weeklyDownloads), diff: false },
    { label: t.tool.use, cell: (x) => guidance?.[x.slug]?.use, diff: false },
    { label: t.tool.avoid, cell: (x) => guidance?.[x.slug]?.avoid, diff: false },
  ];
}

/** Comparação lado a lado. A fonte da verdade é a URL: `/compare?t=react&t=svelte` (link compartilhável). */
export function Compare() {
  const i = useFull();
  const { t, locale, categories, tools, toolBySlug } = i;
  // "Quando usar / evitar" é o maior bloco de texto do catálogo: carrega sob demanda, só nesta página.
  const [guidance, setGuidance] = useState<Record<string, Guidance> | null>(null);
  useEffect(() => {
    let live = true;
    import("@/lib/guidance-i18n").then((m) => live && setGuidance(m.localizedGuidance(locale)));
    return () => { live = false; };
  }, [locale]);
  const rows = useMemo(() => buildRows(i, guidance), [i, guidance]);
  const params = useSearchParams();
  const pathname = publicPath(usePathname());
  const [onlyDiffs, setOnlyDiffs] = useState(false);

  const picked = useMemo(
    () => [...new Set(params.getAll("t"))].flatMap((s) => toolBySlug.get(s) ?? []).slice(0, COMPARE_MAX),
    [params, toolBySlug],
  );

  function setPicked(next: string[]) {
    const qs = next.map((s) => `t=${s}`).join("&");
    window.history.pushState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }

  const picker = picked.length < COMPARE_MAX && (
    <select
      aria-label={t.compare.addLabel}
      value=""
      onChange={(e) => e.target.value && setPicked([...picked.map((x) => x.slug), e.target.value])}
      className="h-11 rounded-lg border border-line bg-surface px-3 text-sm"
    >
      <option value="">{t.compare.add}</option>
      {categories.map((c) => (
        <optgroup key={c.id} label={c.label}>
          {tools
            .filter((x) => x.category === c.id && !picked.includes(x))
            .map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
        </optgroup>
      ))}
    </select>
  );

  if (picked.length === 0) {
    return (
      <EmptyState
        title={t.compare.emptyTitle}
        hint={t.compare.emptyHint}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            {picker}
            <Link href="/tools" className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm hover:bg-surface-2">
              {t.compare.emptyAction}
            </Link>
          </div>
        }
      />
    );
  }

  const cells = rows.map((r) => {
    const values = picked.map((x) => r.cell(x) ?? null);
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
            {t.compare.onlyDiffs}
          </label>
        )}
      </div>
      {picked.length === 1 && <p className="mb-6 text-sm text-fg-muted">{t.compare.needMore}</p>}

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-xl border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line align-bottom">
              <th scope="col" className="sticky left-0 w-28 bg-bg p-4 sm:w-36 font-normal text-fg-subtle">{t.compare.attribute}</th>
              {picked.map((x) => (
                <th key={x.slug} scope="col" className="p-4 align-top font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={toolHref(x)} className="inline-flex min-h-11 items-center font-display text-xl tracking-tight underline-offset-4 hover:underline">
                      {x.name}
                    </Link>
                    <button
                      type="button"
                      aria-label={t.compare.remove(x.name)}
                      onClick={() => setPicked(picked.filter((p) => p !== x).map((p) => p.slug))}
                      className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-fg-subtle hover:bg-surface-2 hover:text-fg"
                    >
                      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="m4 4 8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-normal text-fg-muted">{x.tagline}</p>
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
                    {differs && <span className="sr-only">({t.compare.differs})</span>}
                  </span>
                </th>
                {values.map((v, i) => (
                  <td
                    key={picked[i].slug}
                    className={`p-4 ${r.mono ? "font-mono" : ""} ${differs ? "bg-accent-soft text-fg" : "text-fg-muted"}`}
                  >
                    {v ?? <span className="text-fg-subtle">{t.compare.none}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onlyDiffs && shown.length === 0 && <p className="mt-6 text-sm text-fg-muted">{t.compare.sameAll}</p>}
    </>
  );
}
