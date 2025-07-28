import { AuthenticationApi } from "../findjobnu-auth/apis/AuthenticationApi";

export async function handleApiError(error: unknown) {
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

  //401 Unauthorized
  if (
    (hasResponse(error) && (error as { response: { status?: number } }).response?.status === 401) ||
    (hasStatus(error) && (error as { status?: number }).status === 401) ||
    (hasMessage(error) && (error as { message: string }).message.toLowerCase().includes("unauthorized"))
  ) {
    // Check if access token is expired
    const accessTokenExpiration = localStorage.getItem("accessTokenExpiration");
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");
    if (accessTokenExpiration && accessToken && refreshToken) {
      const expirationDate = new Date(accessTokenExpiration);
      if (expirationDate <= new Date()) {
        try {
          const api = new AuthenticationApi();
          const response = await api.refreshToken({
            tokenRefreshRequest: { refreshToken, accessToken }
          });

          localStorage.setItem("accessToken", response.accessToken ?? "");
          localStorage.setItem("refreshToken", response.refreshToken ?? "");
          localStorage.setItem("accessTokenExpiration", response.accessTokenExpiration?.toISOString() ?? "");
          return { type: "refreshed", message: "Token fornyet." };
        } catch (refreshError) {
          console.warn("Token refresh failed:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          return { type: "unauthorized", message: "Det var ikke muligt at forny din session. Log venligst ind igen." };
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
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