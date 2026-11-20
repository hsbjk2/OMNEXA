"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/components/providers/store-provider";

export function SearchRecorder({ query }: { query: string }) {
  const { addSearch } = useStore();
  const recorded = useRef("");

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2 || recorded.current === clean) return;
    recorded.current = clean;
    addSearch(clean);
  }, [query, addSearch]);

  return null;
}
