/**
 * Checks if the current access token is expired and clears localStorage and user state if it is
 * @param setUser - function to update user state (from UserContext)
 * @returns boolean - true if token was expired and cleared, false if token is still valid
 */
export const checkAndClearExpiredToken = (setUser?: (user: any) => void): boolean => {
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
