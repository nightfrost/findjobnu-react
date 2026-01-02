import { Configuration as ApiConfiguration, ProfileApi, NewsletterApi } from "../findjobnu-api";
import { Configuration as AuthConfiguration, AuthenticationApi } from "../findjobnu-auth";
import type { ProfileCreateRequest } from "../findjobnu-api/models/ProfileCreateRequest";

// Central places to configure base URLs; override via Vite env vars if needed
const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.findjob.nu/";
const DEFAULT_AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE_URL ?? "https://auth.findjob.nu";

// Shared refresh promise to prevent parallel refreshes
let refreshInFlight: Promise<string | null> | null = null;

function isExpired(expIso: string | null): boolean {
  if (!expIso) return true;
  const d = new Date(expIso);
  return Number.isNaN(d.getTime()) || new Date() >= d;
}

async function refreshAccessTokenUsingAuthApi(): Promise<string | null> {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const client = new AuthenticationApi(new AuthConfiguration({ basePath: DEFAULT_AUTH_BASE }));
    const res = await client.refreshToken({
      tokenRefreshRequest: {
        accessToken: accessToken ?? undefined,
        refreshToken: refreshToken ?? undefined,
      },
    });
    if (res.accessToken) localStorage.setItem("accessToken", res.accessToken);
    if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
    if (res.accessTokenExpiration) localStorage.setItem("accessTokenExpiration", res.accessTokenExpiration.toISOString());
    if (res.userId != null) localStorage.setItem("userId", String(res.userId));
    if (res.email != null) localStorage.setItem("email", String(res.email));
    if (res.firstName != null) localStorage.setItem("firstName", String(res.firstName));
    if (res.lastName != null) localStorage.setItem("lastName", String(res.lastName));
    if (res.linkedInId != null) localStorage.setItem("isLinkedInUser", res.linkedInId ? "true" : "false");
    return res.accessToken ?? null;
  } catch (error) {
    console.warn("refreshAccessTokenUsingAuthApi failed:", error);
    // Clear on hard failure
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("accessTokenExpiration");
    return null;
  }
}

async function getOrRefreshToken(bootstrapToken?: string | null): Promise<string | null> {
  const token = localStorage.getItem("accessToken");
  const exp = localStorage.getItem("accessTokenExpiration");
  if (token && !isExpired(exp)) return token;

  // try refresh (de-duped)
  refreshInFlight ??= refreshAccessTokenUsingAuthApi().finally(() => {
    refreshInFlight = null;
  });
  const refreshed = await refreshInFlight;
  if (refreshed) return refreshed;
  // fallback to bootstrap token if provided (e.g., right after login before localStorage sync)
  return bootstrapToken ?? null;
}

function buildAuthRetryMiddleware(baseUrl: string) {
  const isRefreshUrl = (url: string) => url.startsWith(baseUrl + "/api/auth/refresh-token") || url.includes("/refresh-token");
  return [{
    post: async (ctx: import("../findjobnu-api").ResponseContext) => {
      // If unauthorized and not already the refresh-token call, try one refresh and retry the request once
      if (ctx.response.status === 401 && !isRefreshUrl(ctx.url)) {
        refreshInFlight ??= refreshAccessTokenUsingAuthApi().finally(() => {
          refreshInFlight = null;
        });
        const newToken = await refreshInFlight;
        if (newToken) {
          const headers = new Headers(ctx.init.headers);
          headers.set("Authorization", `Bearer ${newToken}`);
          const retried = await ctx.fetch(ctx.url, { ...ctx.init, headers });
          return retried;
        }
      }
      return undefined;
    }
  }];
}

// Generic factory for main API clients with auto Authorization
export function createApiClient<T>(Ctor: new (config?: ApiConfiguration) => T, accessToken: string | null = null): T {
  const bootstrap = accessToken;
  const defaultHeaders: Record<string, string> = { "Accept-Encoding": "gzip, deflate, br" };
  if (bootstrap) defaultHeaders["Authorization"] = `Bearer ${bootstrap}`;
  return new Ctor(
    new ApiConfiguration({
      basePath: DEFAULT_API_BASE,
      // Dynamic Authorization header for any endpoint that declares Bearer apiKey
      apiKey: async () => {
        const token = await getOrRefreshToken(bootstrap);
        return token ? `Bearer ${token}` : "";
      },
      // Also set static header if caller passed a token (first request bootstrap)
      headers: defaultHeaders,
      middleware: buildAuthRetryMiddleware(DEFAULT_AUTH_BASE) as unknown as ApiConfiguration["middleware"],
    })
  );
}

// Factory for auth API clients (separate host)
export function createAuthClient<T>(Ctor: new (config?: AuthConfiguration) => T, accessToken: string | null = null): T {
  const bootstrap = accessToken;
  const defaultHeaders: Record<string, string> = { "Accept-Encoding": "gzip, deflate, br" };
  if (bootstrap) defaultHeaders["Authorization"] = `Bearer ${bootstrap}`;
  return new Ctor(
    new AuthConfiguration({
      basePath: DEFAULT_AUTH_BASE,
      apiKey: async () => {
        const token = await getOrRefreshToken(bootstrap);
        return token ? `Bearer ${token}` : "";
      },
      headers: defaultHeaders,
      middleware: buildAuthRetryMiddleware(DEFAULT_AUTH_BASE) as unknown as AuthConfiguration["middleware"],
    })
  );
}

// Convenience helpers (optional wrappers)
export const getApiBaseUrl = () => DEFAULT_API_BASE;
export const getAuthBaseUrl = () => DEFAULT_AUTH_BASE;

// Convenience wrapper for creating a profile without repeating the verbose request property name
export async function createProfileSimple(api: ProfileApi, data: ProfileCreateRequest) {
  return api.createProfile({ profileCreateRequest: data });
}

// Convenience helper for newsletter client creation
export const createNewsletterClient = (accessToken: string | null = null) =>
  createApiClient(NewsletterApi, accessToken);
