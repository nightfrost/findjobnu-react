import { useCallback } from "react";
import { useUser } from "../context/UserContext.shared";
import { getValidAccessToken, forceRefreshAccessToken } from "./AuthHelper";

/**
 * React hook to get a valid access token on demand.
 * - getToken(): returns a valid token, refreshing if needed; updates UserContext if it refreshes.
 * - forceRefresh(): always try to refresh; returns new token or null; updates UserContext on failure.
 */
export function useValidToken() {
  const { setUser } = useUser();

  const getToken = useCallback(async () => {
    return await getValidAccessToken(setUser);
  }, [setUser]);

  const forceRefresh = useCallback(async () => {
    return await forceRefreshAccessToken(setUser);
  }, [setUser]);

  return { getToken, forceRefresh };
}
