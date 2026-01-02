import React from "react";
import type { ReactElement, ReactNode } from "react";
import { render, screen, waitFor, type RenderOptions } from "@testing-library/react";
import { vi } from "vitest";
import { UserContext, type UserContextType } from "../context/UserContext.shared";

interface WrapperOptions {
  userContext?: Partial<UserContextType>;
}

type ProviderProps = Readonly<{ children: ReactNode; userContext?: Partial<UserContextType> }>;

function Providers({ children, userContext }: ProviderProps) {
  const defaultContext = React.useMemo<UserContextType>(
    () => ({
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
    }),
    []
  );

  const mergedContext = React.useMemo<UserContextType>(
    () => ({
      ...defaultContext,
      ...userContext,
    }),
    [defaultContext, userContext]
  );

  return <UserContext.Provider value={mergedContext}>{children}</UserContext.Provider>;
}

export function renderWithProviders(
  ui: ReactElement,
  { userContext, ...renderOptions }: WrapperOptions & RenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => <Providers userContext={userContext}>{children}</Providers>,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { screen, waitFor };
