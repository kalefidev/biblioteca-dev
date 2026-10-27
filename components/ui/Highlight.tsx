import { fold } from "@/lib/search";

// Destaca no texto os trechos que casam com os termos da busca (sem acento, sem diferenciar caixa).
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const folded = fold(text);
  if (!terms.length || folded.length !== text.length) return text;

  const ranges: [number, number][] = [];
  for (const term of terms) {
    for (let i = folded.indexOf(term); i !== -1; i = folded.indexOf(term, i + term.length)) ranges.push([i, i + term.length]);
  }
  if (!ranges.length) return text;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (const [s, e] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  const parts: React.ReactNode[] = [];
  let pos = 0;
  merged.forEach(([s, e], i) => {
    if (s > pos) parts.push(text.slice(pos, s));
    parts.push(<mark key={i} className="rounded-xs bg-accent-soft text-inherit">{text.slice(s, e)}</mark>);
    pos = e;
  });
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
}
