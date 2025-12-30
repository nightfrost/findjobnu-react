import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import Home from "../../views/Home";
import { renderWithProviders, screen } from "../../test/testUtils";

afterEach(() => {
  vi.resetModules();
});

vi.mock("../../views/JobSearch", () => ({
  __esModule: true,
  default: () => <div data-testid="job-search-view">job-search</div>,
}));

describe("Home view", () => {
  it("renders job search view", () => {
    renderWithProviders(<Home />);

    expect(screen.getByTestId("job-search-view")).toBeInTheDocument();
  });
});
