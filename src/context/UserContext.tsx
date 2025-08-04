import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

export interface User {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiration?: string;
  isLinkedInUser?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

const USER_STORAGE_KEYS = [
  "userId",
  "email",
  "firstName",
  "lastName",
  "accessToken",
  "refreshToken",
  "accessTokenExpiration",
  "isLinkedInUser"
];

function getUserFromStorage(): User | null {
  const user: User = {};
  let hasAny = false;
  USER_STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      (user as any)[key] = value;
      hasAny = true;
    }
  });
  return hasAny ? user : null;
}

function setUserToStorage(user: User | null) {
  if (!user) {
    USER_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    return;
  }
  USER_STORAGE_KEYS.forEach(key => {
    const value = (user as any)[key];
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  });
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
