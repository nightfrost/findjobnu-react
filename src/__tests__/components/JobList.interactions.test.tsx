import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Configuration as ApiConfiguration } from "../../findjobnu-api";
import type { JobIndexPostResponse } from "../../findjobnu-api/models";
import { JobIndexPostsApi, ProfileApi } from "../../findjobnu-api";
import JobList from "../../components/JobList";
import { renderWithProviders, screen, waitFor } from "../../test/testUtils";

const mockProfileApi = {
  saveJobForUser: vi.fn(),
  removeSavedJobForUser: vi.fn(),
  getSavedJobsByUserId: vi.fn(),
};

const mockJobApi = {
  getJobPostsById: vi.fn(),
};

type ApiConstructor = new (config?: ApiConfiguration) => unknown;

vi.mock("../../helpers/ApiFactory", async () => {
  const actual = await vi.importActual<typeof import("../../helpers/ApiFactory")>("../../helpers/ApiFactory");
  function createApiClientMock<T>(Ctor: ApiConstructor, accessToken: string | null = null): T {
    if (Ctor === ProfileApi) return mockProfileApi as T;
    if (Ctor === JobIndexPostsApi) return mockJobApi as T;
    return actual.createApiClient(Ctor as new (config?: ApiConfiguration) => T, accessToken);
  }
  return {
    ...actual,
    createApiClient: vi.fn(createApiClientMock),
  };
});

describe("JobList interactions", () => {
  const longDescription = Array.from({ length: 150 }, (_, i) => `ord${i}`).join(" ");

  const baseJob: JobIndexPostResponse = {
    id: 42,
    title: "Fullstack udvikler",
    description: longDescription,
    company: "Example Co",
    location: "Aarhus",
    postedDate: new Date("2024-02-02"),
    category: "Engineering",
    jobUrl: "https://example.com/job",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileApi.saveJobForUser.mockResolvedValue(undefined);
    mockProfileApi.removeSavedJobForUser.mockResolvedValue(undefined);
    mockProfileApi.getSavedJobsByUserId.mockResolvedValue({ items: [] });
    mockJobApi.getJobPostsById.mockResolvedValue({ ...baseJob });
  });

  it("expands and collapses the description", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <JobList
        jobs={[baseJob]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />
    );

    const snippet = screen.getByText((content: string) => content.endsWith("…"), { selector: "p" });
    expect(snippet.textContent).not.toContain("ord149");

    await user.click(screen.getAllByRole("button", { name: "Læs mere" })[0]);

    await waitFor(() => expect(mockJobApi.getJobPostsById).toHaveBeenCalledWith({ id: baseJob.id }));
    await screen.findByRole("button", { name: "Vis mindre" });
    expect(screen.getByText(/ord149/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Vis mindre" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Vis mindre" })).not.toBeInTheDocument());
    expect(screen.getByText((content: string) => content.endsWith("…"), { selector: "p" })).toBeInTheDocument();
  });

  it("saves a job and flips the CTA", async () => {
    const user = userEvent.setup();
    mockProfileApi.getSavedJobsByUserId.mockResolvedValue({ items: [{ jobID: baseJob.id }] });

    renderWithProviders(
      <JobList
        jobs={[baseJob]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />,
      {
        userContext: {
          user: { userId: "user-1", accessToken: "token-abc" },
        },
      }
    );

    const saveButton = screen.getByRole("button", { name: "Gem job" });
    await user.click(saveButton);

    await waitFor(() => expect(mockProfileApi.saveJobForUser).toHaveBeenCalledWith({ userId: "user-1", jobId: "42" }));
    await waitFor(() => expect(mockProfileApi.getSavedJobsByUserId).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Fjern gemt" })).toBeInTheDocument();
    expect(localStorage.getItem("savedJobsArray")).toBe("42");
  });

  it("removes a saved job", async () => {
    const user = userEvent.setup();
    localStorage.setItem("savedJobsArray", String(baseJob.id));

    renderWithProviders(
      <JobList
        jobs={[baseJob]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />,
      {
        userContext: {
          user: { userId: "user-1", accessToken: "token-abc" },
        },
      }
    );

    mockProfileApi.getSavedJobsByUserId.mockResolvedValue({ items: [] });

    const removeButton = await screen.findByRole("button", { name: "Fjern gemt" });
    await user.click(removeButton);

    await waitFor(() => expect(mockProfileApi.removeSavedJobForUser).toHaveBeenCalledWith({ userId: "user-1", jobId: "42" }));
    await waitFor(() => expect(mockProfileApi.getSavedJobsByUserId).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Gem job" })).toBeInTheDocument();
    expect(localStorage.getItem("savedJobsArray")).toBe("" );
  });
});
