import { AuthenticationApi } from "../findjobnu-auth/apis/AuthenticationApi";

export async function handleApiError(error: any) {
  console.error("API Error:", error);

  //401 Unauthorized
  if (
    error?.response?.status === 401 ||
    error?.status === 401 ||
    (typeof error?.message === "string" && error.message.toLowerCase().includes("unauthorized"))
  ) {
    // Check if access token is expired
    const accessTokenExpiration = localStorage.getItem("accessTokenExpiration");
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("refreshToken");
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
    error?.response?.status === 400 ||
    error?.status === 400
  ) {
    let message = "Ugyldig forespørgsel.";

    if (error?.response && typeof error.response.json === "function") {
      try {
        const data = await error.response.json();
        if (data?.message) {
          message = data.message;
        } else {
          message = JSON.stringify(data);
        }
      } catch (e) {
        try {
          message = await error.response.text();
        } catch {
          message = "Ukendt fejl (kan ikke læse serverens svar)";
        }
      }
    }
    else if (error?.response?.data && typeof error.response.data === "object" && error.response.data.message) {
      message = error.response.data.message;
    }
    else if (error?.response?.data && typeof error.response.data === "string") {
      try {
        const data = JSON.parse(error.response.data);
        if (data?.message) message = data.message;
        else message = error.response.data;
      } catch {
        message = error.response.data;
      }
    }
    else if (error?.body && typeof error.body === "object" && error.body.message) {
      message = error.body.message;
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
    else if (typeof error?.message === "string") {
      message = error.message;
    }
    else if (error?.response?.data) {
      message = JSON.stringify(error.response.data);
    }

    return { type: "bad_request", message };
  }
  else if (error?.response?.status === 404 ||
    error?.status === 404 ||
    (typeof error?.message === "string" && error.message.toLowerCase().includes("not found"))) {
    return { type: "not_found", message: "Ressourcen blev ikke fundet." };
  }

  return { type: "unknown", message: "Der opstod en fejl. Prøv igen senere." };
}