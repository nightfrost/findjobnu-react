import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import Contact from "../../views/Contact";
import { renderWithProviders, screen } from "../../test/testUtils";

vi.mock("../../assets/illustrations/undraw_personal-information_h7kf.svg", () => ({ default: "illu-personal.svg" }));
vi.mock("../../assets/illustrations/undraw_file-search_cbur.svg", () => ({ default: "illu-file-search.svg" }));

describe("Contact view", () => {
  it("shows contact cards and FAQ", () => {
    renderWithProviders(<Contact />);

    expect(screen.getByText("Support til kandidater")).toBeInTheDocument();
    expect(screen.getByText("Virksomhedssamarbejder")).toBeInTheDocument();
    expect(screen.getByText("Telefon")).toBeInTheDocument();

    expect(screen.getByRole("form", { name: "Kontaktformular" })).toBeInTheDocument();

    expect(screen.getByText("Hvornår får jeg svar?")).toBeInTheDocument();
    expect(screen.getByText("Kan I hjælpe med at skrive mit CV?")).toBeInTheDocument();
    expect(screen.getByText("Hvordan bliver jeg partner?")).toBeInTheDocument();
  });

  it("enables send button when message is typed", async () => {
    const user = userEvent.setup();

    renderWithProviders(<Contact />);

    const sendButton = screen.getByRole("button", { name: "Send besked" });
    expect(sendButton).toBeDisabled();

    await user.type(screen.getByLabelText("Besked"), "Hej der");

    expect(sendButton).not.toBeDisabled();
  });
});
