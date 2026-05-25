"use client";

import { useEffect, useMemo } from "react";

type ReadOnViewProps = {
  endpoint: string;
  payload?: Record<string, string>;
};

export function ReadOnView({ endpoint, payload }: ReadOnViewProps) {
  const body = useMemo(() => (payload ? JSON.stringify(payload) : undefined), [payload]);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
      keepalive: true,
      signal: controller.signal,
    }).catch(() => undefined);

    return () => controller.abort();
  }, [body, endpoint]);

  return null;
}
