import React, { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { UserContext, type User } from "./UserContext.shared";

const USER_STORAGE_KEYS = [
  "userId",
  "email",
  "firstName",
  "lastName",
  "accessToken",
  "refreshToken",
  "accessTokenExpiration",
  "isLinkedInUser"
] as const;

function getUserFromStorage(): User | null {
  const user: User = {};
  let hasAny = false;
  for (const key of USER_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      user[key] = value;
      hasAny = true;
    }
  }
  return hasAny ? user : null;
}

function setUserToStorage(user: User | null) {
  if (!user) {
    for (const key of USER_STORAGE_KEYS) localStorage.removeItem(key);
    return;
  }
  for (const key of USER_STORAGE_KEYS) {
    const value = user[key];
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => getUserFromStorage());

  useEffect(() => {
    setUserToStorage(user);
  }, [user]);

  const setUser = (u: User | null) => {
    setUserState(u);
  };

  const logout = () => {
    setUserState(null);
  };

  const contextValue = useMemo(() => ({ user, setUser, logout }), [user]);
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Intentionally do not re-export hooks here to keep this file exporting only components for fast-refresh
