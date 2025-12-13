import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import SearchForm from "../../components/SearchForm";
import { renderWithProviders, screen } from "../../test/test-utils";

describe("SearchForm", () => {
  it("submits the entered values", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <SearchForm
        onSearch={onSearch}
        categories={["Engineering (3)", "Marketing (2)"]}
      />
    );

    await user.type(screen.getByPlaceholderText("Søgeord"), "Frontend");
    await user.type(screen.getByPlaceholderText("Kategori"), "Engineering (3)");

    await user.click(screen.getByRole("button", { name: /søg/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith({
      searchTerm: "Frontend",
      location: "",
      category: "Engineering",
    });
  });
});
