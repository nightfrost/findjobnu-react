import React, { useState, useRef } from "react";
import { CitiesApi, Configuration, type Cities } from "../findjobnu-api/";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

type SearchParams = {
  searchTerm?: string;
  location?: string;
  category?: string;
};

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: string[];
}

const citiesApi = new CitiesApi(new Configuration({ basePath: "https://findjob.nu" }));

const SearchForm: React.FC<Props> = ({ onSearch, categories }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Cities[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLocationFocus = async () => {
    if (!location) {
      try {
        const results = await citiesApi.getAllCities();
        setCitySuggestions(results ?? []);
        setShowSuggestions(true);
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
          setCitySuggestions(results ?? []);
          setShowSuggestions(true);
        } catch {
          setCitySuggestions([]);
        }
      }, 300);
    } else {
      (async () => {
        try {
          const results = await citiesApi.getAllCities();
          setCitySuggestions(results ?? []);
          setShowSuggestions(true);
        } catch {
          setCitySuggestions([]);
        }
      })();
    }
  };

  const handleSuggestionClick = (city: Cities) => {
    setLocation(city.cityName ?? "");
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ searchTerm, location, category });
    setShowSuggestions(false);
  };

  return (
    <form className="flex flex-col md:flex-row gap-2 mb-6 relative" onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <input
        className="input input-bordered w-full flex-1"
        placeholder="Søgeord"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      </div>
      <div
        className="relative flex-1"
        tabIndex={-1}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onFocus={() => showSuggestions && setShowSuggestions(true)}
      >
        <input
          className="select select-bordered w-full"
          placeholder="Lokation"
          value={location}
          onChange={handleLocationChange}
          onFocus={handleLocationFocus}
          autoComplete="off"
        />
        {showSuggestions && citySuggestions.length > 0 && (
          <ul className="menu-vertical absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-40 overflow-y-auto shadow-lg rounded-box p-0">
            {citySuggestions.map(city => (
              <li key={city.id}>
                <button
                  type="button"
                  className="menu-item text-white px-3 py-2 hover:bg-base-200 w-full text-left"
                  onClick={() => handleSuggestionClick(city)}
                >
                  {city.cityName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative flex-1">
        <select
        id="category-select"
        className="select select-bordered w-full flex-1"
        value={category}
        onChange={e => setCategory(e.target.value)}
        aria-label="Vælg kategori"
      >
        <option value="">Vælg kategori</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      </div>
      
      <button className="btn btn-primary" type="submit">
        <MagnifyingGlassCircleIcon className="h-5 w-5" />
        Søg
      </button>
    </form>
  );
};

export default SearchForm;