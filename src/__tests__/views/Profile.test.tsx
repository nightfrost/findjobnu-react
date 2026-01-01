import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Profile from "../../views/Profile";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders, screen, waitFor } from "../../test/testUtils";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../components/UserProfile", () => ({
  __esModule: true,
  default: ({ userId }: { userId: string }) => (
    <div data-testid="user-profile">profile:{userId}</div>
  ),
}));

vi.mock("../../components/Connections", () => ({
  __esModule: true,
  default: ({ userId, accessToken }: { userId: string; accessToken?: string }) => (
    <div data-testid="connections">connections:{userId}:{accessToken}</div>
  ),
}));

vi.mock("../../components/JobAgentCard", () => ({
  __esModule: true,
  default: ({ userId, accessToken }: { userId: string; accessToken?: string }) => (
    <div data-testid="job-agent">job-agent:{userId}:{accessToken}</div>
  ),
}));

describe("Profile view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when no user is present", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/profile"]}>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login"));
  });

  it("renders profile content when user is present", async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/profile"]}>
        <Profile />
      </MemoryRouter>,
      {
        userContext: { user: { userId: "user-123", accessToken: "token-abc" } },
      }
    );

    await waitFor(() => expect(navigateMock).not.toHaveBeenCalled());

    expect(screen.getByTestId("user-profile")).toHaveTextContent("user-123");

    await userEvent.click(screen.getByRole("button", { name: /forbindelser/i }));
    expect(await screen.findByTestId("connections")).toHaveTextContent("user-123:token-abc");

    await userEvent.click(screen.getByRole("button", { name: /jobagent/i }));
    expect(await screen.findByTestId("job-agent")).toHaveTextContent("user-123:token-abc");
  });

  it("does not navigate away when a valid user stays the same", async () => {
    const user = { userId: "user-abc", accessToken: "token-123" };

    const { rerender } = renderWithProviders(
      <MemoryRouter initialEntries={["/profile"]}>
        <Profile />
      </MemoryRouter>,
      {
        userContext: { user },
      }
    );

    await waitFor(() => expect(navigateMock).not.toHaveBeenCalled());

    rerender(
      <MemoryRouter initialEntries={["/profile"]}>
        <Profile />
      </MemoryRouter>
    );

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
