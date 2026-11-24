function providerUrl(path: string, next?: string) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

function FacebookMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-3.5"
      fill="currentColor"
    >
      <path d="M13.5 21v-7.2h2.5l.4-2.9h-2.9V9c0-.8.2-1.4 1.4-1.4h1.6V5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8v2.2H8.5v2.9h2.5V21h2.5Z" />
    </svg>
  );
}

export function SocialLogin({
  googleEnabled,
  facebookEnabled,
  next,
}: {
  googleEnabled: boolean;
  facebookEnabled: boolean;
  next?: string;
}) {
  if (!googleEnabled && !facebookEnabled) return null;

  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[0.58rem] uppercase tracking-[0.15em] text-muted/50">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="space-y-3">
        {googleEnabled && (
          <a
            href={providerUrl("/api/auth/google", next)}
            className="flex h-12 w-full items-center justify-center gap-3 border border-line bg-white text-[0.76rem] font-semibold text-ink transition hover:border-forest"
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-forest/15 font-display text-sm text-forest">
              G
            </span>
            Continue with Google
          </a>
        )}
        {facebookEnabled && (
          <a
            href={providerUrl("/api/auth/facebook", next)}
            className="flex h-12 w-full items-center justify-center gap-3 border border-line bg-white text-[0.76rem] font-semibold text-ink transition hover:border-forest"
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-forest/15 text-forest">
              <FacebookMark />
            </span>
            Continue with Facebook
          </a>
        )}
      </div>
    </>
  );
}
