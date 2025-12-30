import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import GoodCv from "../../views/GoodCv";
import { renderWithProviders, screen, waitFor } from "../../test/testUtils";

const analyzeCvPdfMock = vi.fn();

vi.mock("../../helpers/ApiFactory", () => ({
  __esModule: true,
  createApiClient: vi.fn(() => ({ analyzeCvPdf: analyzeCvPdfMock })),
}));

vi.mock("../../assets/illustrations/undraw_file-search_cbur.svg", () => ({ default: "illu-file-search.svg" }));
vi.mock("../../assets/illustrations/undraw_personal-information_h7kf.svg", () => ({ default: "illu-personal-info.svg" }));
vi.mock("../../assets/illustrations/undraw_certification_i2m0.svg", () => ({ default: "illu-certification.svg" }));

describe("GoodCv view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables analyze button until a file is selected", async () => {
    const user = userEvent.setup();

    renderWithProviders(<GoodCv />, {
      userContext: { user: { userId: "u1", accessToken: "token" } },
    });

    const analyzeButton = screen.getByRole("button", { name: "Analyser CV" });
    expect(analyzeButton).toBeDisabled();

    const file = new File(["pdf"], "cv.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Upload CV som PDF");
    await user.upload(input, file);

    expect(analyzeButton).not.toBeDisabled();
  });

  it("analyzes the CV and shows metrics", async () => {
    const user = userEvent.setup();

    analyzeCvPdfMock.mockResolvedValueOnce({
      readabilityScore: 0.72,
      summary: {
        totalWords: 200,
        totalChars: 1000,
        totalLines: 20,
        bulletCount: 6,
        matchedSections: 4,
        hasEmail: true,
        hasPhone: false,
      },
    });

    renderWithProviders(<GoodCv />, {
      userContext: { user: { userId: "u1", accessToken: "token" } },
    });

    const file = new File(["pdf"], "cv.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Upload CV som PDF");
    await user.upload(input, file);

    await user.click(screen.getByRole("button", { name: "Analyser CV" }));

    await waitFor(() => expect(analyzeCvPdfMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByText("Læsbarhedsscore:")).toBeInTheDocument();
    expect(screen.getByText("72%"))
      .toBeInTheDocument();
    expect(screen.getByText("Ord i alt")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("Punkter (bullets)")).toBeInTheDocument();
  });

  it("shows an error message when analysis fails and re-enables the button", async () => {
    const user = userEvent.setup();

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    analyzeCvPdfMock.mockRejectedValueOnce(new Error("Boom"));

    renderWithProviders(<GoodCv />, {
      userContext: { user: { userId: "u1", accessToken: "token" } },
    });

    const file = new File(["pdf"], "cv.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Upload CV som PDF");
    await user.upload(input, file);

    const analyzeButton = screen.getByRole("button", { name: "Analyser CV" });
    await user.click(analyzeButton);

    await waitFor(() => expect(analyzeCvPdfMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByText("Der opstod en fejl. Prøv igen senere.")).toBeInTheDocument();
    expect(analyzeButton).not.toBeDisabled();

    consoleSpy.mockRestore();
  });
});
