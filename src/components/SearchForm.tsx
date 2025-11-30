import React, { useState, useRef } from "react";
import { CitiesApi } from "../findjobnu-api/";
import type { FindjobnuServiceDTOsResponsesCityResponse as City } from "../findjobnu-api/models/FindjobnuServiceDTOsResponsesCityResponse";
import { createApiClient } from "../helpers/ApiFactory";

type SearchParams = {
  searchTerm?: string;
  location?: string;
  category?: string;
};

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: string[];
  // Optional raw category from query param (without count) to preselect
  queryCategory?: string;
}

const citiesApi = createApiClient(CitiesApi);

const SearchForm: React.FC<Props> = ({ onSearch, categories, queryCategory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeCityIndex, setActiveCityIndex] = useState(-1);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_SUGGESTIONS = 8;

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

  const handleLocationFocus = async () => {
    if (location === "") {
      try {
        const results = await citiesApi.getAllCities();
  setCitySuggestions((results ?? []).slice(0, MAX_SUGGESTIONS));
        setShowSuggestions(true);
  setActiveCityIndex(-1);
      } catch {
        setCitySuggestions([]);
      }
    } else {
      setShowSuggestions(true);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.length > 0) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const results = await citiesApi.getCitiesByQuery({ query: value });
          setCitySuggestions((results ?? []).slice(0, MAX_SUGGESTIONS));
          setShowSuggestions(true);
          setActiveCityIndex(-1);
        } catch {
          setCitySuggestions([]);
        }
      }, 300);
    } else {
      (async () => {
        try {
          const results = await citiesApi.getAllCities();
          setCitySuggestions((results ?? []).slice(0, MAX_SUGGESTIONS));
          setShowSuggestions(true);
          setActiveCityIndex(-1);
        } catch {
          setCitySuggestions([]);
        }
      })();
    }
  };

  const handleSuggestionClick = (city: City) => {
    setLocation(city.cityName ?? "");
    setShowSuggestions(false);
  setActiveCityIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ searchTerm, location, category });
    setShowSuggestions(false);
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

  // Keyboard navigation for location suggestions
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || citySuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCityIndex(i => (i + 1) % citySuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCityIndex(i => (i - 1 + citySuggestions.length) % citySuggestions.length);
    } else if (e.key === 'Enter') {
      if (activeCityIndex >= 0 && activeCityIndex < citySuggestions.length) {
        e.preventDefault();
        handleSuggestionClick(citySuggestions[activeCityIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
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

  return (
    <form className="flex flex-col md:flex-row gap-2 mb-5 relative" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <input
        className="input input-bordered shadow w-full flex-1"
        placeholder="Søgeord"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      </div>
      <fieldset
        className="relative flex-1 border-0 p-0 m-0"
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      >
        <legend className="sr-only">Lokation</legend>
        <input
          className="select select-bordered shadow w-full"
          placeholder="Lokation"
          value={location}
          onChange={handleLocationChange}
          onFocus={handleLocationFocus}
          autoComplete="off"
          aria-label="Lokation"
          onKeyDown={handleLocationKeyDown}
        />
        {showSuggestions && citySuggestions.length > 0 && (
          <ul className="menu-vertical absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-40 min-h-10 overflow-y-auto shadow-lg rounded-box p-0">
            {citySuggestions.map((city, idx) => (
              <li key={city.id}>
                <button
                  type="button"
                  className={`menu-item text px-3 py-2 w-full text-left ${idx === activeCityIndex ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                  onClick={() => handleSuggestionClick(city)}
                  aria-label={`Vælg ${city.cityName}`}
                >
                  {highlightMatch(city.cityName, location)}
                </button>
              </li>
            ))}
          </ul>
        )}
  </fieldset>
      <fieldset
        className="relative flex-1 border-0 p-0 m-0"
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
      
      <button className="btn btn-primary shadow" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        Søg
      </button>
    </form>
  );
};

export default SearchForm;