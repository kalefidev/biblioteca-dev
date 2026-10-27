"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/components/I18nProvider";

/** next/link que põe o prefixo do idioma em caminhos internos (`/tools` → `/pt-BR/tools`). */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { href: localize } = useI18n();
  return <NextLink href={typeof href === "string" && href.startsWith("/") ? localize(href) : href} {...props} />;
}
