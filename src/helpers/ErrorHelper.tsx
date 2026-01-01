import { AuthenticationApi } from "../findjobnu-auth";
import { createAuthClient } from "./ApiFactory";
import type { User } from "../context/UserContext.shared";

// Adapter interface to accept the UserContext without importing the hook
export interface UserContextAdapter {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export async function handleApiError(error: unknown, ctx?: UserContextAdapter) {
  console.error("API Error:", error);

  // Helper functions for type guards
  function hasResponse(obj: unknown): obj is { response: unknown } {
    return typeof obj === "object" && obj !== null && "response" in obj;
  }
  function hasStatus(obj: unknown): obj is { status: number } {
    return typeof obj === "object" && obj !== null && "status" in obj;
  }
  function hasMessage(obj: unknown): obj is { message: string } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "message" in obj &&
      typeof (obj as { message: unknown }).message === "string"
    );
  }
  function hasBody(obj: unknown): obj is { body: unknown } {
    return typeof obj === "object" && obj !== null && "body" in obj;
  }

  // Helper to coerce various date shapes to Date
  const toDate = (d: unknown): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === "string" || typeof d === "number") {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };

  //401 Unauthorized
  if (
    (hasResponse(error) && (error as { response: { status?: number } }).response?.status === 401) ||
    (hasStatus(error) && (error as { status?: number }).status === 401) ||
    (hasMessage(error) && (error as { message: string }).message.toLowerCase().includes("unauthorized"))
  ) {
    // Prefer tokens from UserContext; fall back to localStorage
    const accessTokenExpiration =
      ctx?.user?.accessTokenExpiration ?? localStorage.getItem("accessTokenExpiration");
    const refreshToken = ctx?.user?.refreshToken ?? localStorage.getItem("refreshToken");
    const accessToken = ctx?.user?.accessToken ?? localStorage.getItem("accessToken");
    if (accessTokenExpiration && accessToken && refreshToken) {
      const expirationDate = toDate(accessTokenExpiration);
      if (expirationDate && expirationDate <= new Date()) {
        try {
          const api = createAuthClient(AuthenticationApi, accessToken ?? undefined);
          const response = await api.refreshToken({
            tokenRefreshRequest: { refreshToken, accessToken }
          });
          // Update context if provided, otherwise persist directly
          const exp = response.accessTokenExpiration;
          let expIso = "";
          if (exp) {
            if (exp instanceof Date) {
              expIso = exp.toISOString();
            } else {
              const parsed = new Date(exp as unknown as string);
              expIso = isNaN(parsed.getTime()) ? "" : parsed.toISOString();
            }
          }

          if (ctx) {
            const current = ctx.user ?? {};
            ctx.setUser({
              ...current,
              accessToken: response.accessToken ?? "",
              refreshToken: response.refreshToken ?? "",
              accessTokenExpiration: expIso,
            });
          } else {
            localStorage.setItem("accessToken", response.accessToken ?? "");
            localStorage.setItem("refreshToken", response.refreshToken ?? "");
            localStorage.setItem("accessTokenExpiration", expIso);
          }
          return { type: "refreshed", message: "Token fornyet." };
        } catch (refreshError) {
          console.warn("Token refresh failed:", refreshError);
          if (ctx) {
            ctx.logout();
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");
          }
          return { type: "unauthorized", message: "Det var ikke muligt at forny din session. Log venligst ind igen." };
        }
      } else {
        if (ctx) {
          ctx.logout();
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
        }
        return { type: "unauthorized", message: "Din session er udløbet. Log venligst ind igen." };
      }
    }
  }
  else if (
    (hasResponse(error) && (error as { response: { status?: number } }).response?.status === 400) ||
    (hasStatus(error) && (error as { status?: number }).status === 400)
  ) {
    let message = "Ugyldig forespørgsel.";

    if (
      hasResponse(error) &&
      typeof (error as { response: { json?: unknown } }).response?.json === "function"
    ) {
      try {
        const data = await (error as { response: { json: () => Promise<unknown> } }).response.json();
        if (typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string") {
          message = (data as { message: string }).message;
        } else {
          message = JSON.stringify(data);
        }
      } catch (e) {
        try {
          console.log("Error parsing response:", e);
          message = await (error as { response: { text: () => Promise<string> } }).response.text();
        } catch {
          message = "Ukendt fejl (kan ikke læse serverens svar)";
        }
      }
    }
    else if (
      hasResponse(error) &&
      (error as { response: { data?: unknown } }).response?.data &&
      typeof (error as { response: { data: unknown } }).response.data === "object" &&
      "message" in ((error as { response: { data: unknown } }).response.data as unknown as object)
    ) {
      message = ((error as { response: { data: { message: string } } }).response.data as { message: string }).message;
    }
    else if (
      hasResponse(error) &&
      (error as { response: { data?: unknown } }).response?.data &&
      typeof (error as { response: { data: unknown } }).response.data === "string"
    ) {
      try {
        const data = JSON.parse((error as { response: { data: string } }).response.data as string);
        if (data?.message) message = data.message;
        else message = (error as { response: { data: string } }).response.data as string;
      } catch {
        message = (error as { response: { data: string } }).response.data as string;
      }
    }
    else if (
      hasBody(error) &&
      (error as { body?: unknown }).body &&
      typeof (error as { body: unknown }).body === "object" &&
      "message" in ((error as { body: unknown }).body as unknown as object)
    ) {
      message = ((error as { body: { message: string } }).body as { message: string }).message;
    }
    else if (error instanceof Response) {
      try {
        const data = await error.json();
        if (data?.message) {
          message = data.message;
        } else {
          message = JSON.stringify(data);
        }
      } catch {
        message = await error.text();
      }
    }
    else if (typeof error === "string") {
      try {
        const data = JSON.parse(error);
        if (data?.message) message = data.message;
        else message = error;
      } catch {
        message = error;
      }
    }
    else if (hasMessage(error)) {
      message = (error as { message: string }).message;
    }
    else if (hasResponse(error) && (error as { response: { data?: unknown } }).response?.data) {
      message = JSON.stringify((error as { response: { data: unknown } }).response.data);
    }

    return { type: "bad_request", message };
  }
  else if (
    (hasResponse(error) && (error as { response: { status?: number } }).response?.status === 404) ||
    (hasStatus(error) && (error as { status?: number }).status === 404) ||
    (hasMessage(error) && (error as { message: string }).message.toLowerCase().includes("not found"))
  ) {
    return { type: "not_found", message: "Ressourcen blev ikke fundet." };
  }

  return { type: "unknown", message: "Der opstod en fejl. Prøv igen senere." };
}
