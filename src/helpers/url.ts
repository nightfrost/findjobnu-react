const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function hasAllowedProtocol(url: URL): boolean {
  return ALLOWED_PROTOCOLS.has(url.protocol);
}

export function sanitizeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (hasAllowedProtocol(parsed)) {
      return parsed.toString();
    }
    return null;
  } catch {
    if (trimmed.startsWith("/")) {
      return trimmed;
    }
    return null;
  }
}
