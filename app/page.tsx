import Link from "next/link";

// Placeholder: a home de verdade nasce nas etapas 2 e 3 do PLANO.md.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Biblioteca de ferramentas</h1>
      <p className="text-zinc-500">Em construção. O protótipo 3D já está disponível.</p>
      <Link className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900" href="/explore">
        Abrir o modo Explorar
      </Link>
    </main>
  );
}
