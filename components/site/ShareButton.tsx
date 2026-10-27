"use client";

import { useEffect, useState } from "react";
import { pt } from "@/messages/pt-BR";

/** Copia a URL da página atual. O resultado vai para uma região `status` (anunciada por leitores de tela). */
export function ShareButton() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(""), 2500);
    return () => clearTimeout(id);
  }, [msg]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMsg(pt.tool.copied);
    } catch {
      setMsg(pt.tool.copyFailed);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line px-4 text-sm text-fg-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 hover:text-fg"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.8 2.8 0 0 1 4 4l-1 1M9 11.5l-1 1a2.8 2.8 0 0 1-4-4l1-1" />
        </svg>
        {pt.tool.share}
      </button>
      <span role="status" className="text-sm text-fg-muted">{msg}</span>
    </>
  );
}
