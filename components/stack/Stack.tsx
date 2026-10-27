"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, toolBySlug, toolHref } from "@/lib/catalog";
import { usePicks } from "@/lib/picks";
import { pt } from "@/messages/pt-BR";

/** Lista em Markdown, só com as áreas que têm ferramenta. */
function toMarkdown(slugs: string[]) {
  const sections = categories.flatMap((c) => {
    const items = slugs.flatMap((s) => toolBySlug.get(s) ?? []).filter((t) => t.category === c.id);
    return items.length ? [`## ${c.label}`, ...items.map((t) => `- [${t.name}](${t.url}): ${t.tagline}`), ""] : [];
  });
  return [`# ${pt.stack.heading}`, "", ...sections].join("\n").trimEnd() + "\n";
}

export function Stack() {
  const { list, toggle, clear } = usePicks("stack");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(""), 2500);
    return () => clearTimeout(id);
  }, [msg]);

  const filled = categories.filter((c) => list.some((s) => toolBySlug.get(s)?.category === c.id)).length;
  const total = categories.length;
  const markdown = toMarkdown(list);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setMsg(pt.stack.copied);
    } catch {
      setMsg(pt.stack.copyFailed);
    }
  }

  return (
    <>
      {/* Gradiente de meta: mostra quanto falta, não só quanto tem. */}
      <div className="mb-10">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">{pt.stack.progress(filled, total)}</span>
          {filled === total && <span className="text-accent">{pt.stack.allDone}</span>}
        </div>
        <div
          role="progressbar"
          aria-label={pt.stack.progressLabel}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={filled}
          aria-valuetext={pt.stack.progress(filled, total)}
          className="h-2 overflow-hidden rounded-full bg-surface-2"
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(filled / total) * 100}%` }} />
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {categories.map((c) => {
          const picked = list.flatMap((s) => toolBySlug.get(s) ?? []).filter((t) => t.category === c.id);
          return (
            <li
              key={c.id}
              className={`flex flex-col gap-3 rounded-xl p-5 ${picked.length ? "border border-line bg-surface" : "border border-dashed border-line-strong"}`}
            >
              <h2 className="flex items-center gap-3 font-medium tracking-tight">
                <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
                {c.label}
              </h2>
              {picked.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {picked.map((t) => (
                    <li key={t.slug} className="flex items-center justify-between gap-2">
                      <Link href={toolHref(t)} className="rounded-sm underline-offset-4 hover:underline">{t.name}</Link>
                      <button
                        type="button"
                        aria-label={pt.stack.remove(t.name)}
                        onClick={() => toggle(t.slug)}
                        className="-mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
                      >
                        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="m4 4 8 8M12 4l-8 8" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/c/${c.id}`}
                className={`mt-auto inline-flex h-11 items-center text-sm underline-offset-4 hover:underline ${picked.length ? "text-fg-muted" : "text-accent"}`}
              >
                {picked.length === 0 && <span className="mr-2 text-fg-subtle">{pt.stack.emptySlot} ·</span>}
                {pt.stack.pick(c.label)}
              </Link>
            </li>
          );
        })}
      </ul>

      {list.length > 0 && (
        <section aria-labelledby="export" className="mt-16">
          <h2 id="export" className="font-display text-xl tracking-tight">{pt.stack.exportTitle}</h2>
          <p className="mt-2 mb-6 text-fg-muted">{pt.stack.exportHint}</p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-5 font-mono text-sm whitespace-pre-wrap">{markdown}</pre>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity duration-150 hover:opacity-90"
            >
              {pt.stack.copy}
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg"
            >
              {pt.stack.clear}
            </button>
            <span role="status" className="text-sm text-fg-muted">{msg}</span>
          </div>
        </section>
      )}
    </>
  );
}
