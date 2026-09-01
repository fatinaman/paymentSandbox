export const SESSION_QUERY_KEYS = [
  "amount",
  "invoice",
  "invoiceNumber",
  "userName",
  "user",
  "userId",
  "planName",
  "plan",
  "subscription",
  "sessionId",
  "returnUrl",
] as const;

export function pickSessionQuery(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams();
  for (const key of SESSION_QUERY_KEYS) {
    const value = searchParams.get(key);
    if (value) next.set(key, value);
  }
  return next;
}

export function sessionQueryString(searchParams: URLSearchParams): string {
  const qs = pickSessionQuery(searchParams).toString();
  return qs ? `?${qs}` : "";
}

export function parseAmount(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function withQuery(path: string, searchParams: URLSearchParams): string {
  return `${path}${sessionQueryString(searchParams)}`;
}

export function successHref(paymentId: string, searchParams: URLSearchParams): string {
  const next = pickSessionQuery(searchParams);
  next.set("paymentId", paymentId);
  return `/success?${next.toString()}`;
}
