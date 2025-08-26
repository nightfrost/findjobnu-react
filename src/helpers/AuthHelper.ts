/**
 * Checks if the current access token is expired and clears localStorage and user state if it is
 * @param setUser - function to update user state (from UserContext)
 * @returns boolean - true if token was expired and cleared, false if token is still valid
 */
import type { User } from "../context/UserContext.shared";

export const checkAndClearExpiredToken = (setUser?: (user: User | null) => void): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  const accessTokenExpiration = localStorage.getItem("accessTokenExpiration");

  // If no token or expiration date, nothing to check
  if (!accessToken || !accessTokenExpiration) {
    return false;
  }

  try {
    const expirationDate = new Date(accessTokenExpiration);
    const currentDate = new Date();

    // Check if token is expired
    if (currentDate >= expirationDate) {
      // Token is expired, clear all auth-related localStorage items
      clearAuthLocalStorage();
      if (setUser) setUser(null);
      console.log("Access token expired. Cleared localStorage and user state.");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error parsing token expiration date:", error);
    // If we can't parse the date, assume token is invalid and clear storage
    clearAuthLocalStorage();
    if (setUser) setUser(null);
    return true;
  }
};

/**
 * Clears all authentication-related items from localStorage
 */
export const clearAuthLocalStorage = (): void => {
  localStorage.removeItem("email");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("accessTokenExpiration");
  localStorage.removeItem("savedJobsArray");
};

/**
 * Checks if user is currently authenticated (has valid token)
 * @returns boolean - true if user has a valid token
 */
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  const accessTokenExpiration = localStorage.getItem("accessTokenExpiration");

  if (!accessToken || !accessTokenExpiration) {
    return false;
  }

  try {
    const expirationDate = new Date(accessTokenExpiration);
    const currentDate = new Date();
    return currentDate < expirationDate;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

// --- Refresh Token Utilities ---
import { AuthenticationApi } from "../findjobnu-auth";
import { createAuthClient } from "./ApiFactory";

/**
 * Persist tokens and related user info from AuthResponse-like object to localStorage.
 */
export const persistAuthResponse = (data: {
  userId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpiration?: Date | string | null;
  linkedInId?: string | null;
}): void => {
  if (data.userId != null) localStorage.setItem("userId", String(data.userId));
  if (data.email != null) localStorage.setItem("email", String(data.email));
  if (data.firstName != null) localStorage.setItem("firstName", String(data.firstName));
  if (data.lastName != null) localStorage.setItem("lastName", String(data.lastName));
  if (data.accessToken != null) localStorage.setItem("accessToken", String(data.accessToken));
  if (data.refreshToken != null) localStorage.setItem("refreshToken", String(data.refreshToken));
  if (data.accessTokenExpiration != null) {
    const iso = typeof data.accessTokenExpiration === "string"
      ? data.accessTokenExpiration
      : data.accessTokenExpiration.toISOString();
    localStorage.setItem("accessTokenExpiration", iso);
  }
  if (data.linkedInId != null) localStorage.setItem("isLinkedInUser", data.linkedInId ? "true" : "false");
};

/**
 * Returns whether the access token is expired (or invalid date).
 */
export const isAccessTokenExpired = (): boolean => {
  const exp = localStorage.getItem("accessTokenExpiration");
  if (!exp) return true;
  try {
    const expirationDate = new Date(exp);
    return new Date() >= expirationDate;
  } catch {
    return true;
  }
};

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Try to refresh the access token using the refresh token.
 * On success, updates localStorage and returns the new access token string.
 * On failure, clears auth storage and returns null.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const currentAccessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const client = createAuthClient(AuthenticationApi);
    const res = await client.refreshToken({
      tokenRefreshRequest: {
        accessToken: currentAccessToken ?? undefined,
        refreshToken: refreshToken ?? undefined,
      },
    });

    // Persist new tokens
    persistAuthResponse(res);
    const newToken = res.accessToken ?? null;
    return newToken;
  } catch (err) {
    console.warn("Token refresh failed, clearing auth:", err);
    clearAuthLocalStorage();
    return null;
  }
};

/**
 * Get a valid access token, refreshing if needed. Returns null if cannot ensure a valid token.
 */
export const getValidAccessToken = async (setUser?: (user: User | null) => void): Promise<string | null> => {
  const token = localStorage.getItem("accessToken");
  const expired = isAccessTokenExpired();
  if (token && !expired) return token;

  refreshInFlight ??= (async () => {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      if (setUser) setUser(null);
      return null;
    }
    // Optionally sync user state
    if (setUser) {
      const nextUser: User = {
        userId: localStorage.getItem("userId") ?? undefined,
        email: localStorage.getItem("email") ?? undefined,
        firstName: localStorage.getItem("firstName") ?? undefined,
        lastName: localStorage.getItem("lastName") ?? undefined,
        accessToken: localStorage.getItem("accessToken") ?? undefined,
        refreshToken: localStorage.getItem("refreshToken") ?? undefined,
        accessTokenExpiration: localStorage.getItem("accessTokenExpiration") ?? undefined,
        isLinkedInUser: localStorage.getItem("isLinkedInUser") ?? undefined,
      };
      setUser(nextUser);
    }
    return newToken;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

/**
 * Force a refresh regardless of local expiration. Useful on 401 responses.
 */
export const forceRefreshAccessToken = async (setUser?: (user: User | null) => void): Promise<string | null> => {
  try {
    const newToken = await refreshAccessToken();
    if (!newToken && setUser) setUser(null);
    return newToken;
  } finally {
    // no-op
  }
};
