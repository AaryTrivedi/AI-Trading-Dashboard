/**
 * Current ISO timestamp (UTC).
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Unix timestamp in seconds.
 */
export function unixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
