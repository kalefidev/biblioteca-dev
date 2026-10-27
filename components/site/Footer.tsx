import Link from "next/link";
import { pt } from "@/messages/pt-BR";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-300 flex-col gap-1 px-4 py-10 text-sm text-fg-subtle sm:px-6">
        <p className="text-fg-muted">{pt.footer.tagline}</p>
        <p>{pt.footer.data}</p>
        <p>
          <Link href="/privacidade" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-fg hover:underline">
            {pt.footer.privacy}
          </Link>
        </p>
      </div>
    </footer>
  );
}
