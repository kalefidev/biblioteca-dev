"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { categories, toolHref, tools } from "@/lib/catalog";
import { fold, searchScores } from "@/lib/search";
import { pt } from "@/messages/pt-BR";

type Item = { id: string; label: string; hint: string; href: string };

const catItem = (c: (typeof categories)[number]): Item => ({ id: `c-${c.id}`, label: c.label, hint: pt.palette.categories, href: `/c/${c.id}` });
const toolItem = (t: (typeof tools)[number]): Item => ({
  id: `t-${t.slug}`, label: t.name, hint: t.tagline, href: toolHref(t),
});

// Paleta Ctrl/Cmd+K: pula direto para uma ferramenta ou categoria.
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label={pt.palette.label}>
      <Palette onClose={onClose} />
    </Dialog>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const list = useRef<HTMLUListElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const term = q.trim();
    if (!term) return [...categories.map(catItem), ...tools.filter((t) => t.featured).slice(0, 5).map(toolItem)];
    const f = fold(term);
    const cats = categories.filter((c) => fold(c.label).includes(f)).map(catItem);
    const scores = searchScores(term);
    const found = tools.filter((t) => scores.has(t.slug)).sort((a, b) => scores.get(b.slug)! - scores.get(a.slug)!).slice(0, 8);
    return [...cats, ...found.map(toolItem)];
  }, [q]);
  const seeAll: Item | null = q.trim() ? { id: "all", label: pt.palette.seeAll(q.trim()), hint: "", href: `/tools?q=${encodeURIComponent(q.trim())}` } : null;
  const all = seeAll ? [...items, seeAll] : items;
  const current = Math.min(active, all.length - 1);

  function go(item: Item) {
    onClose();
    router.push(item.href);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (current + (e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length;
      setActive(next);
      list.current?.children[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && all[current]) {
      e.preventDefault();
      go(all[current]);
    }
  }

  return (
    <div>
      <input
        autoFocus
        role="combobox"
        aria-expanded
        aria-controls={listId}
        aria-activedescendant={all[current] ? `${listId}-${all[current].id}` : undefined}
        aria-label={pt.palette.label}
        placeholder={pt.palette.placeholder}
        value={q}
        onChange={(e) => { setQ(e.target.value); setActive(0); }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="h-14 w-full border-b border-line bg-transparent px-5 text-base placeholder:text-fg-subtle focus-visible:outline-none"
      />
      <ul id={listId} ref={list} role="listbox" aria-label={pt.palette.label} className="max-h-[50dvh] overflow-y-auto p-2">
        {all.map((item, i) => (
          <li
            key={item.id}
            id={`${listId}-${item.id}`}
            role="option"
            aria-selected={i === current}
            onMouseMove={() => setActive(i)}
            onClick={() => go(item)}
            className="flex min-h-11 cursor-pointer items-baseline gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-surface-2"
          >
            <span className="font-medium">{item.label}</span>
            <span className="min-w-0 flex-1 truncate text-fg-muted">{item.hint}</span>
          </li>
        ))}
        {!items.length && <li role="presentation" className="px-3 py-6 text-center text-sm text-fg-muted">{pt.palette.empty}</li>}
      </ul>
      <p className="hidden border-t border-line px-5 py-3 text-xs text-fg-subtle sm:block">{pt.palette.hint}</p>
    </div>
  );
}
