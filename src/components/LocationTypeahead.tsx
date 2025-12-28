import React, { useState, useRef } from "react";
import { CityApi } from "../findjobnu-api/";
import type { CityResponse as City } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";

interface LocationTypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (city: City) => void;
  placeholder?: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  useValidator?: boolean;
}

const MAX_SUGGESTIONS = 8;

const LocationTypeahead: React.FC<LocationTypeaheadProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "By",
  className = "",
  inputProps = {},
  useValidator = true,
}) => {
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCityIndex, setActiveCityIndex] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const citiesApi = createApiClient(CityApi);

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

  const handleFocus = async () => {
    if (value === "") {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val.length > 0) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const results = await citiesApi.getCitiesByQuery({ query: val });
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
    onChange(city.name ?? "");
    if (onSelect) onSelect(city);
    setShowSuggestions(false);
    setActiveCityIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || citySuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCityIndex((i) => (i + 1) % citySuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCityIndex((i) => (i - 1 + citySuggestions.length) % citySuggestions.length);
    } else if (e.key === "Enter") {
      if (activeCityIndex >= 0 && activeCityIndex < citySuggestions.length) {
        e.preventDefault();
        handleSuggestionClick(citySuggestions[activeCityIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        id="locationInput"
        className={`input input-bordered ${useValidator ? "validator" : ""} w-full ${className}`.trim()}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        autoComplete="off"
        onKeyDown={handleKeyDown}
        {...inputProps}
      />
      {showSuggestions && citySuggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-20 w-full max-h-40 overflow-y-auto mt-1 p-0 border border-base-300 bg-base-100 rounded-lg shadow-lg">
          {citySuggestions.map((city, idx) => (
            <li key={city.id} className="border-b last:border-b-0 border-base-200">
              <button
                type="button"
                className={`w-full text-left px-3 py-2 rounded-none border-0 bg-base-100 ${idx === activeCityIndex ? "bg-primary text-primary-content" : "hover:bg-base-200"}`}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(city); }}
                onClick={() => handleSuggestionClick(city)}
                aria-label={`Vælg ${city.name ?? ""}`}
              >
                {highlightMatch(city.name, value)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationTypeahead;
