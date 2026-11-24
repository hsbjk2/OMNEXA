import { prisma } from "@/lib/prisma";

export type PersistentRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * A D1-safe rate limit bucket. Each consume is a single conditional UPDATE, so
 * two Workers cannot both spend the last slot in the same bucket. D1 does not
 * support interactive transactions; this statement-level approach is the
 * concurrency guarantee used here.
 */
export async function takePersistentRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<PersistentRateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const consumed = await prisma.rateLimit.updateMany({
      where: {
        key,
        resetAt: { gt: now },
        count: { lt: limit },
      },
      data: { count: { increment: 1 } },
    });

    if (consumed.count === 1) {
      const row = await prisma.rateLimit.findUnique({
        where: { key },
        select: { count: true },
      });
      return {
        allowed: true,
        remaining: Math.max(0, limit - (row?.count ?? 1)),
        retryAfterSeconds: 0,
      };
    }

    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing) {
      try {
        await prisma.rateLimit.create({
          data: { key, count: 1, resetAt },
        });
        return {
          allowed: true,
          remaining: Math.max(0, limit - 1),
          retryAfterSeconds: 0,
        };
      } catch (error) {
        if (isUniqueConstraintError(error)) continue;
        throw error;
      }
    }

    if (existing.resetAt.getTime() <= now.getTime()) {
      const reset = await prisma.rateLimit.updateMany({
        where: { key, resetAt: { lte: now } },
        data: { count: 1, resetAt },
      });
      if (reset.count === 1) {
        return {
          allowed: true,
          remaining: Math.max(0, limit - 1),
          retryAfterSeconds: 0,
        };
      }
      continue;
    }

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000),
      ),
    };
  }

  return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
}

/** Best-effort cleanup; never blocks registration if it fails. */
export async function cleanupExpiredRateLimits() {
  try {
    await prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
  } catch (error) {
    console.error("Could not clean expired rate limits:", error);
  }
}
