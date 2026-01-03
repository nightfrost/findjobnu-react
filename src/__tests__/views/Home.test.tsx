import React from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Home from "../../views/Home";
import { renderWithProviders, screen } from "../../test/testUtils";

describe("Home view", () => {
  it("renders the landing hero and primary CTAs", () => {
    renderWithProviders(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Velkommen til FindJob.nu")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /samlet forside til jobsøgning/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start jobsøgningen/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Se værktøjer til jobsøgende/i })).toBeInTheDocument();
  });
});
