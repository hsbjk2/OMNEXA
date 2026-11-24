-- OTP registration support.
-- Safe to run against both a fresh and an existing OMNEXA database.

CREATE TABLE IF NOT EXISTS "PendingRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "PendingRegistration_email_key"
    ON "PendingRegistration"("email");
CREATE INDEX IF NOT EXISTS "PendingRegistration_expiresAt_idx"
    ON "PendingRegistration"("expiresAt");
CREATE INDEX IF NOT EXISTS "PendingRegistration_lastSentAt_idx"
    ON "PendingRegistration"("lastSentAt");

CREATE TABLE IF NOT EXISTS "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "RateLimit_resetAt_idx"
    ON "RateLimit"("resetAt");
