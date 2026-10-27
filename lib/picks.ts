"use client";

// Listas do usuário guardadas no navegador: "compare" (até 3) e "stack" (qualquer quantidade).
// localStorage pode falhar (aba privada, bloqueio): nesse caso a lista vive só em memória nesta sessão.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { toolBySlug } from "@/lib/catalog";

export const COMPARE_MAX = 3;
export type PickKey = "compare" | "stack";

const KEY = { compare: "pick:compare", stack: "pick:stack" } as const;
const cache: Partial<Record<PickKey, string>> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function raw(key: PickKey) {
  if (cache[key] === undefined) {
    try {
      cache[key] = localStorage.getItem(KEY[key]) ?? "[]";
    } catch {
      cache[key] = "[]";
    }
  }
  return cache[key];
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    // Outra aba mudou a lista: descarta o cache e relê.
    const key = (Object.keys(KEY) as PickKey[]).find((k) => KEY[k] === e.key);
    if (key) delete cache[key];
    cb();
  };
  listeners.add(cb);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Só slugs que existem no catálogo, sem repetição (o valor salvo pode ter sido editado à mão). */
function parse(value: string, key: PickKey): string[] {
  let list: unknown;
  try {
    list = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  const ok = [...new Set(list)].filter((s): s is string => typeof s === "string" && toolBySlug.has(s));
  return key === "compare" ? ok.slice(0, COMPARE_MAX) : ok;
}

export function usePicks(key: PickKey) {
  const value = useSyncExternalStore(subscribe, () => raw(key), () => "[]");
  const list = useMemo(() => parse(value, key), [value, key]);

  const save = useCallback(
    (next: string[]) => {
      cache[key] = JSON.stringify(next);
      try {
        localStorage.setItem(KEY[key], cache[key]);
      } catch {}
      emit();
    },
    [key],
  );
  const toggle = (slug: string) => {
    if (list.includes(slug)) return save(list.filter((s) => s !== slug));
    if (key === "compare" && list.length >= COMPARE_MAX) return;
    save([...list, slug]);
  };

  return {
    list,
    has: (slug: string) => list.includes(slug),
    full: key === "compare" && list.length >= COMPARE_MAX,
    toggle,
    clear: () => save([]),
  };
}
