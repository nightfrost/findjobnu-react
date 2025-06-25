import React, { useState } from "react";

type SearchParams = {
  searchTerm?: string;
  location?: string;
  category?: string;
};

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: string[];
}

const SearchForm: React.FC<Props> = ({ onSearch, categories }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ searchTerm, location, category });
  };

  return (
    <form className="flex flex-col md:flex-row gap-2 mb-6" onSubmit={handleSubmit}>
      <input
        className="input input-bordered flex-1"
        placeholder="Søgeord"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <input
        className="input input-bordered flex-1"
        placeholder="Lokation"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />
      <select
        id="category-select"
        className="select select-bordered flex-1"
        value={category}
        onChange={e => setCategory(e.target.value)}
        aria-label="Vælg kategori"
      >
        <option value="">Vælg kategori</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <button className="btn btn-primary" type="submit">
        Search
      </button>
    </form>
  );
};

export default SearchForm;