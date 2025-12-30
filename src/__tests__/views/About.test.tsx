import React from "react";
import { describe, it, expect, vi } from "vitest";
import About from "../../views/About";
import { renderWithProviders, screen } from "../../test/testUtils";

vi.mock("../../assets/illustrations/undraw_businesswoman-avatar_ktl2.svg", () => ({ default: "illu-business.svg" }));
vi.mock("../../assets/illustrations/undraw_file-search_cbur.svg", () => ({ default: "illu-file-search.svg" }));
vi.mock("../../assets/illustrations/undraw_certification_i2m0.svg", () => ({ default: "illu-certification.svg" }));

describe("About view", () => {
  it("renders mission hero and all sections", () => {
    renderWithProviders(<About />);

    expect(screen.getByText("Om Findjobnu")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(screen.getByText("Garderobe af viden")).toBeInTheDocument();
    expect(screen.getByText("Design for alle")).toBeInTheDocument();
    expect(screen.getByText("Handling før hypen")).toBeInTheDocument();
  });
});
