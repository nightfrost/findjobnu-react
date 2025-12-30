import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import JobSearch from "../../views/JobSearch";
import { renderWithProviders, screen, waitFor } from "../../test/testUtils";

const apiMock = vi.hoisted(() => ({
  getAllJobPosts: vi.fn(),
  getJobCategories: vi.fn(),
  getJobPostsBySearch: vi.fn(),
}));

vi.mock("../../helpers/ApiFactory", () => ({
  __esModule: true,
  createApiClient: vi.fn(() => apiMock),
}));

const jobsResponse = {
  items: [
    {
      id: 1,
      title: "Frontend Dev",
      description: "desc",
      company: "ACME",
      location: "Aalborg",
      postedDate: new Date("2024-01-01"),
      category: "Eng",
      jobUrl: "https://example.com",
    },
  ],
  totalCount: 20,
};

describe("JobSearch view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.getAllJobPosts.mockResolvedValue(jobsResponse);
    apiMock.getJobCategories.mockResolvedValue({
      categories: [
        { id: 10, name: "Engineering", numberOfJobs: 3 },
        { id: 20, name: "Marketing", numberOfJobs: 1 },
      ],
    });
    apiMock.getJobPostsBySearch.mockResolvedValue(jobsResponse);
  });

  const renderView = (initialEntry = "/") =>
    renderWithProviders(
      <MemoryRouter initialEntries={[initialEntry]}>
        <JobSearch />
      </MemoryRouter>
    );

  it("loads initial jobs and categories", async () => {
    renderView();

    await waitFor(() => expect(apiMock.getAllJobPosts).toHaveBeenCalledWith({ page: 1, pageSize: 10 }));
    await waitFor(() => expect(apiMock.getJobCategories).toHaveBeenCalled());

    expect(await screen.findByText("Frontend Dev")).toBeInTheDocument();
  });

  it("applies category from query params on first render", async () => {
    renderView("/?category=5");

    await waitFor(() => expect(apiMock.getJobPostsBySearch).toHaveBeenCalled());

    expect(apiMock.getJobPostsBySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 5,
        page: 1,
        pageSize: 10,
      })
    );
  });

  it("performs search with normalized location and resets to page 1", async () => {
    const user = userEvent.setup();

    renderView();

    const locationInput = await screen.findByPlaceholderText("Lokation");
    await user.type(locationInput, "  Aarhus   ");
    await user.click(screen.getByRole("button", { name: /søg/i }));

    await waitFor(() => expect(apiMock.getJobPostsBySearch).toHaveBeenCalled());

    expect(apiMock.getJobPostsBySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "Aarhus",
        page: 1,
        pageSize: 10,
      })
    );
  });
});
