type RateEntry = { count: number; resetAt: number };

const requests = new Map<string, RateEntry>();
let callsSinceCleanup = 0;

export function takeRateLimit(key: string) {
  const now = Date.now();
  const max = Math.max(1, Number(process.env.CONTACT_RATE_LIMIT_MAX || 5));
  const windowMs = Math.max(60_000, Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || 900_000));

  callsSinceCleanup += 1;
  if (callsSinceCleanup >= 100) {
    for (const [storedKey, entry] of requests) {
      if (entry.resetAt <= now) requests.delete(storedKey);
    }
    callsSinceCleanup = 0;
  }

  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
