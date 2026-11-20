const buckets = new Map<string, { count: number; resetAt: number }>();

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count };
}

// Keep the in-memory map bounded in long-running dev sessions.
if (buckets.size === 0) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(key);
    }
  }, 10 * 60 * 1000).unref?.();
}
