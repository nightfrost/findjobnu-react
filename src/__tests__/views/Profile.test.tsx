import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Profile from "../../views/Profile";
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
    renderWithProviders(<Profile />);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login"));
  });

  it("renders profile content when user is present", async () => {
    renderWithProviders(<Profile />, {
      userContext: { user: { userId: "user-123", accessToken: "token-abc" } },
    });

    await waitFor(() => expect(navigateMock).not.toHaveBeenCalled());

    expect(screen.getByTestId("user-profile")).toHaveTextContent("user-123");
    expect(screen.getByTestId("connections")).toHaveTextContent("user-123:token-abc");
    expect(screen.getByTestId("job-agent")).toHaveTextContent("user-123:token-abc");
  });

  it("does not navigate away when a valid user stays the same", async () => {
    const user = { userId: "user-abc", accessToken: "token-123" };

    const { rerender } = renderWithProviders(<Profile />, {
      userContext: { user },
    });

    await waitFor(() => expect(navigateMock).not.toHaveBeenCalled());

    rerender(<Profile />);

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
