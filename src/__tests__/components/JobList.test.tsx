import { describe, it, expect } from "vitest";
import JobList from "../../components/JobList";
import { renderWithProviders, screen } from "../../test/test-utils";

const base64Image =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAKAAoDAREAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAUGB//EABgQAQADAQAAAAAAAAAAAAAAAAABAgME/8QAFQEBAQAAAAAAAAAAAAAAAAAABgf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwB4o+KP/9k=";

describe("JobList", () => {
  it("renders base64 images as data URIs", () => {
    const job = {
      id: 1,
      title: "Frontend Developer",
      bannerPicture: base64Image,
      footerPicture: base64Image,
      description: "Kort beskrivelse",
      company: "ACME",
      location: "København",
      postedDate: new Date("2024-01-01"),
      category: "Engineering",
      jobUrl: "https://example.com",
    };

    renderWithProviders(
      <JobList
        jobs={[job]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />,
      {
        userContext: {
          user: { userId: "user-1", accessToken: "token" },
        },
      }
    );

    const banner = screen.getByAltText("Banner for jobopslag");
    const footer = screen.getByAltText("Footer grafik for jobopslag");

    expect(banner).toHaveAttribute("src", expect.stringMatching(/^data:image\/(jpeg|png);base64,/));
    expect(footer).toHaveAttribute("src", expect.stringMatching(/^data:image\/(jpeg|png);base64,/));
  });

  it("uses provided mime types for base64 images", () => {
    const job = {
      id: 2,
      title: "Fullstack Developer",
      bannerPicture: base64Image,
      bannerMimeType: "image/webp",
      footerPicture: base64Image,
      footerMimeType: "image/webp",
      description: "Beskrivelse",
      company: "Tech Corp",
      location: "Aarhus",
      postedDate: new Date("2024-02-01"),
      category: "Engineering",
    };

    renderWithProviders(
      <JobList
        jobs={[job]}
        loading={false}
        currentPage={1}
        pageSize={10}
        totalCount={1}
        onPageChange={() => {}}
      />,
      {
        userContext: {
          user: { userId: "user-1", accessToken: "token" },
        },
      }
    );

    const banner = screen.getByAltText("Banner for jobopslag");
    const footer = screen.getByAltText("Footer grafik for jobopslag");

    expect(banner).toHaveAttribute("src", expect.stringMatching(/^data:image\/webp;base64,/));
    expect(footer).toHaveAttribute("src", expect.stringMatching(/^data:image\/webp;base64,/));
  });
});
