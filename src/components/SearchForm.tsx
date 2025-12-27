import React, { useState, useRef } from "react";
import type { CityResponse as City } from "../findjobnu-api/models";
import LocationTypeahead from "./LocationTypeahead";
import { DANISH_DATE_PATTERN, isValidDanishDateString, toApiDateString } from "../helpers/date";

type SearchParams = {
  searchTerm?: string;
  location?: string;
  locationSlug?: string;
  categoryId?: number;
  postedAfter?: string;
  postedBefore?: string;
};

export type CategoryOption = {
  id?: number;
  name: string;
  label: string;
  count?: number;
};

type CategoryInput = CategoryOption | string;

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: CategoryInput[];
  // Optional raw category (id or name) from query param to preselect
  queryCategory?: string;
}

const SearchForm: React.FC<Props> = ({ onSearch, categories, queryCategory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const setSelectedCity = useState<City | null>(null)[1];
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categorySuggestions, setCategorySuggestions] = useState<CategoryOption[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const categoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [postedAfter, setPostedAfter] = useState("");
  const [postedBefore, setPostedBefore] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const MAX_SUGGESTIONS = 8;

  const normalizeCategoryValue = (value: string) => value.replace(/\s+\(\d+\)\s*$/, "").trim();

  const normalizedCategories = React.useMemo<CategoryOption[]>(() => {
    return categories.map(c => {
      if (typeof c === "string") {
        const countMatch = c.match(/\((\d+)\)\s*$/);
        const count = countMatch ? Number(countMatch[1]) : undefined;
        const name = normalizeCategoryValue(c);
        return { id: undefined, name, label: c, count };
      }
      return c;
    });
  }, [categories]);

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

  // Sync incoming query category into the local category state (match by id or name)
  React.useEffect(() => {
    if (!queryCategory) return;
    if (categoryInput !== "") return;

    const numeric = Number(queryCategory);
    const match = Number.isFinite(numeric)
      ? normalizedCategories.find(c => c.id === numeric)
      : normalizedCategories.find(c => c.name === queryCategory || c.label === queryCategory);
    if (match) {
      setCategoryInput(match.label);
      setSelectedCategoryId(match.id ?? null);
    }
  }, [queryCategory, normalizedCategories, categoryInput]);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setSelectedCity(null);
  };

  const handleLocationSelect = (city: City) => {
    setSelectedCity(city);
    setLocation(city.name ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    setSubmitted(true);
    const normalizedCategory = normalizeCategoryValue(categoryInput);
    const matchedCategoryId = selectedCategoryId
      ?? normalizedCategories.find(c => c.name === normalizedCategory || c.label === normalizedCategory)?.id
      ?? undefined;
    const locationValue = location.trim();
    const postedAfterApi = postedAfter ? toApiDateString(postedAfter) ?? undefined : undefined;
    const postedBeforeApi = postedBefore ? toApiDateString(postedBefore) ?? undefined : undefined;

    onSearch({
      searchTerm,
      location: locationValue.length ? locationValue : undefined,
      categoryId: matchedCategoryId,
      postedAfter: postedAfterApi,
      postedBefore: postedBeforeApi,
    });
    setShowCategorySuggestions(false);
  };

  const searchValid = !searchTerm || searchTerm.trim().length >= 2;
  const locationValid = !location || location.trim().length >= 2;
  const postedAfterValid = !postedAfter || isValidDanishDateString(postedAfter);
  const postedBeforeValid = !postedBefore || isValidDanishDateString(postedBefore);
  const categoryValid = true; // always valid when filled

  const successClass = (base: string, condition: boolean) =>
    condition && submitted ? `${base} input-success` : base;

  const openAllCategories = () => {
    setCategorySuggestions(normalizedCategories);
    setShowCategorySuggestions(true);
  };

  const handleCategoryFocus = () => {
    if (categoryInput === "") {
      openAllCategories();
    } else {
      setShowCategorySuggestions(true);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryInput(value);
    setSelectedCategoryId(null);
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    categoryTimeoutRef.current = setTimeout(() => {
      const filtered = normalizedCategories
        .filter(c => c.name.toLowerCase().includes(value.toLowerCase()) || c.label.toLowerCase().includes(value.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS);
      setCategorySuggestions(filtered);
      setShowCategorySuggestions(true);
      setActiveCategoryIndex(-1);
    }, 200);
  };

  const handleCategorySuggestionClick = (option: CategoryOption) => {
    setCategoryInput(option.label);
    setSelectedCategoryId(option.id ?? null);
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
        className={successClass("input input-bordered shadow w-full", searchValid && !!searchTerm)}
        placeholder="Søgeord"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        minLength={2}
        pattern={searchTerm ? "^.{2,}$" : undefined}
        aria-invalid={Boolean(searchTerm) && searchTerm.length < 2}
      />
      </div>
      <div className={`relative ${inputWidthClass}`}>
        <LocationTypeahead
          value={location}
          onChange={handleLocationChange}
          onSelect={handleLocationSelect}
          placeholder="Lokation"
          className={successClass("select select-bordered shadow", locationValid && !!location)}
          inputProps={{
            "aria-label": "Lokation",
            minLength: 2,
            pattern: location ? "^.{2,}$" : undefined,
            "aria-invalid": Boolean(location) && location.length < 2,
          }}
          useValidator={false}
        />
      </div>
      <fieldset
        className={`relative border-0 p-0 m-0 ${inputWidthClass}`}
        onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 100)}
      >
        <legend className="sr-only">Kategori</legend>
        <input
          className={successClass("select select-bordered shadow w-full", categoryValid && !!categoryInput)}
          placeholder="Kategori"
          value={categoryInput}
          onChange={handleCategoryChange}
          onFocus={handleCategoryFocus}
          autoComplete="off"
          aria-label="Kategori"
          onKeyDown={handleCategoryKeyDown}
          // Category always validates if present; no pattern needed
        />
        {showCategorySuggestions && categorySuggestions.length > 0 && (
          <ul className="menu-vertical absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-40 min-h-10 overflow-y-auto shadow-lg rounded-box p-0">
            {categorySuggestions.map((cat, idx) => (
              <li key={cat.id ?? `${cat.name}-${idx}`}>
                <button
                  type="button"
                  className={`menu-item text px-3 py-2 w-full text-left ${idx === activeCategoryIndex ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                  onMouseDown={(e) => { e.preventDefault(); handleCategorySuggestionClick(cat); }}
                  onClick={() => handleCategorySuggestionClick(cat)}
                  aria-label={`Vælg kategori ${cat.name}`}
                >
                  {highlightMatch(cat.label, categoryInput)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <div className={`flex flex-col gap-2 ${inputWidthClass}`}>
        <label className="text-sm font-medium" htmlFor="postedAfter">Opslag efter</label>
        <input
          id="postedAfter"
          type="text"
          inputMode="numeric"
          className={successClass("input input-bordered shadow w-full", postedAfterValid && !!postedAfter)}
          value={postedAfter}
          onChange={e => setPostedAfter(e.target.value)}
          placeholder="dd/mm/yyyy"
          pattern={DANISH_DATE_PATTERN.source}
          aria-label="Opslag efter dato"
          aria-invalid={Boolean(postedAfter) && !postedAfterValid}
        />
        <label className="text-sm font-medium" htmlFor="postedBefore">Opslag før</label>
        <input
          id="postedBefore"
          type="text"
          inputMode="numeric"
          className={successClass("input input-bordered shadow w-full", postedBeforeValid && !!postedBefore)}
          value={postedBefore}
          onChange={e => setPostedBefore(e.target.value)}
          placeholder="dd/mm/yyyy"
          pattern={DANISH_DATE_PATTERN.source}
          aria-label="Opslag før dato"
          aria-invalid={Boolean(postedBefore) && !postedBeforeValid}
        />
      </div>
      <button className={`btn btn-primary shadow ${inputWidthClass}`} type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        Søg
      </button>
    </form>
  );
};

export default SearchForm;