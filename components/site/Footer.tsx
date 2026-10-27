import { Link } from "@/components/Link";
import { getI18n } from "@/lib/i18n-server";

export async function Footer() {
  const { t } = await getI18n();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-300 flex-col gap-1 px-4 py-10 text-sm text-fg-subtle sm:px-6">
        <p className="text-fg-muted">{t.footer.tagline}</p>
        <p>{t.footer.data}</p>
        <p className="flex gap-6">
          <Link href="/suggest" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-fg hover:underline">
            {t.footer.suggest}
          </Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-fg hover:underline">
            {t.footer.privacy}
          </Link>
        </p>
      </div>
    </footer>
  );
}
