import { createContext, useContext } from "react";

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

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
