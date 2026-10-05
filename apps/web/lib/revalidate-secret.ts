const DEVELOPMENT_SECRET = 'dev-revalidate-secret';

/**
 * Resolves the shared secret for `/api/revalidate`. The well-known default exists only for
 * `NODE_ENV=development`; in every other environment a missing secret yields `null`, which
 * makes the route reject every request (fail closed).
 */
export function resolveRevalidateSecret(input: {
  envSecret: string | undefined;
  nodeEnv: string | undefined;
}): string | null {
  const configured = input.envSecret?.trim();
  if (configured) return input.envSecret as string;
  return input.nodeEnv === 'development' ? DEVELOPMENT_SECRET : null;
}

export function isRevalidateRequestAuthorized(
  secret: string | null,
  providedHeader: string | null,
): boolean {
  if (secret === null || providedHeader === null) return false;
  return providedHeader === secret;
}
