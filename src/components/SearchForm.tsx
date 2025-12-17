import React, { useState, useRef } from "react";
import type { CityResponse as City } from "../findjobnu-api/models";
import LocationTypeahead from "./LocationTypeahead";

type SearchParams = {
  searchTerm?: string;
  location?: string;
  locationSlug?: string;
  category?: string;
};

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: string[];
  // Optional raw category from query param (without count) to preselect
  queryCategory?: string;
}

const SearchForm: React.FC<Props> = ({ onSearch, categories, queryCategory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [category, setCategory] = useState("");
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const categoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_SUGGESTIONS = 8;

  const normalizeCategoryValue = (value: string) => value.replace(/\s+\(\d+\)\s*$/, "").trim();

  const highlightMatch = (text: string | undefined | null, query: string) => {
    if (!text) return null;
    if (!query) return text;
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/30 px-0 py-0 rounded-none">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  // Sync incoming query category into the local category state (find matching formatted label)
  React.useEffect(() => {
    if (queryCategory && category === "") {
      const match = categories.find(c => c.replace(/ \(\d+\)$/i, "") === queryCategory);
      if (match) {
        setCategory(match);
      }
    }
  }, [queryCategory, categories, category]);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setSelectedCity(null);
  };

  const handleLocationSelect = (city: City) => {
    setSelectedCity(city);
    setLocation(city.name ?? city.slug ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCategory = normalizeCategoryValue(category);
    const categoryParam = normalizedCategory.length > 0 ? normalizedCategory : undefined;
    const locationValue = location.trim();
    onSearch({
      searchTerm,
      location: locationValue.length ? locationValue : undefined,
      locationSlug: selectedCity?.slug ?? undefined,
      category: categoryParam,
    });
    setShowCategorySuggestions(false);
  };

  const openAllCategories = () => {
    setCategorySuggestions(categories);
    setShowCategorySuggestions(true);
  };

  const handleCategoryFocus = () => {
    if (category === "") {
      openAllCategories();
    } else {
      setShowCategorySuggestions(true);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategory(value);
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    categoryTimeoutRef.current = setTimeout(() => {
      const filtered = categories
        .filter(c => c.toLowerCase().includes(value.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS);
      setCategorySuggestions(filtered);
      setShowCategorySuggestions(true);
      setActiveCategoryIndex(-1);
    }, 200);
  };

  const handleCategorySuggestionClick = (value: string) => {
    setCategory(value);
    setShowCategorySuggestions(false);
    setActiveCategoryIndex(-1);
  };

  // Keyboard navigation for category suggestions
  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCategorySuggestions || categorySuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCategoryIndex(i => (i + 1) % categorySuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCategoryIndex(i => (i - 1 + categorySuggestions.length) % categorySuggestions.length);
    } else if (e.key === 'Enter') {
      if (activeCategoryIndex >= 0 && activeCategoryIndex < categorySuggestions.length) {
        e.preventDefault();
        handleCategorySuggestionClick(categorySuggestions[activeCategoryIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowCategorySuggestions(false);
    }
  };

  const inputWidthClass = "w-full lg:w-64";

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className={`relative ${inputWidthClass}`}>
        <input
        className="input input-bordered shadow w-full"
        placeholder="Søgeord"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      </div>
      <div className={`relative ${inputWidthClass}`}>
        <LocationTypeahead
          value={location}
          onChange={handleLocationChange}
          onSelect={handleLocationSelect}
          placeholder="Lokation"
          className="select select-bordered shadow"
          inputProps={{
            "aria-label": "Lokation",
          }}
        />
      </div>
      <fieldset
        className={`relative border-0 p-0 m-0 ${inputWidthClass}`}
        onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 100)}
      >
        <legend className="sr-only">Kategori</legend>
        <input
          className="select select-bordered shadow w-full"
          placeholder="Kategori"
          value={category}
          onChange={handleCategoryChange}
          onFocus={handleCategoryFocus}
          autoComplete="off"
          aria-label="Kategori"
          onKeyDown={handleCategoryKeyDown}
        />
        {showCategorySuggestions && categorySuggestions.length > 0 && (
          <ul className="menu-vertical absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-40 min-h-10 overflow-y-auto shadow-lg rounded-box p-0">
            {categorySuggestions.map((cat, idx) => (
              <li key={cat}>
                <button
                  type="button"
                  className={`menu-item text px-3 py-2 w-full text-left ${idx === activeCategoryIndex ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                  onClick={() => handleCategorySuggestionClick(cat)}
                  aria-label={`Vælg kategori ${cat}`}
                >
                  {highlightMatch(cat, category)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <button className={`btn btn-primary shadow ${inputWidthClass}`} type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        Søg
      </button>
    </form>
  );
};

export default SearchForm;