"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";

export function ClearSearchHistory() {
  const { clearSearchHistory } = useStore();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await clearSearchHistory();
        setPending(false);
      }}
      className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-forest/50 transition hover:text-forest disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <RotateCcw className="size-3" />
      )}
      {pending ? "Clearing…" : "Clear history"}
    </button>
  );
}
