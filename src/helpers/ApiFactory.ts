import { Configuration as ApiConfiguration } from "../findjobnu-api";
import { Configuration as AuthConfiguration } from "../findjobnu-auth";

// Central places to configure base URLs; override via Vite env vars if needed
const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://findjob.nu";
const DEFAULT_AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE_URL ?? "https://auth.findjob.nu";

// Generic factory for main API clients
export function createApiClient<T>(Ctor: new (config?: ApiConfiguration) => T, accessToken?: string | null): T {
  return new Ctor(
    new ApiConfiguration({
      basePath: DEFAULT_API_BASE,
      accessToken: accessToken || undefined,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
  );
}

// Factory for auth API clients (separate host)
export function createAuthClient<T>(Ctor: new (config?: AuthConfiguration) => T, accessToken?: string | null): T {
  return new Ctor(
    new AuthConfiguration({
      basePath: DEFAULT_AUTH_BASE,
      accessToken: accessToken || undefined,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
  );
}

// Convenience helpers (optional wrappers)
export const getApiBaseUrl = () => DEFAULT_API_BASE;
export const getAuthBaseUrl = () => DEFAULT_AUTH_BASE;
