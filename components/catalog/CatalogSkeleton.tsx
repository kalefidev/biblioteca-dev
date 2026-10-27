import { ToolCard } from "@/components/site/ToolCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { parseState, runQuery } from "@/lib/search";

/**
 * Fallback do catálogo (que lê a URL no cliente). Renderiza no servidor as primeiras ferramentas na ordem padrão,
 * então o HTML já traz links rastreáveis para buscadores; o cliente troca pela lista filtrável ao hidratar.
 */
export function CatalogSkeleton({ lockedCategory }: { lockedCategory?: string }) {
  const first = runQuery(parseState(new URLSearchParams()), lockedCategory).results.slice(0, 24);
  return (
    <div className="gap-10 lg:grid lg:grid-cols-[15rem_1fr]">
      <div className="hidden lg:block" />
      <div>
        <Skeleton className="h-14 rounded-xl" />
        <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {first.map((t) => (
            <li key={t.slug} className="flex *:flex-1">
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
