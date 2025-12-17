import React, { useEffect, useState } from "react";
import { JobIndexPostsApi } from "../findjobnu-api";
import { createApiClient } from "../helpers/ApiFactory";
import { useNavigate } from "react-router-dom";
import SkeletonChips from "./SkeletonChips";
import type { CategoryOption } from "./SearchForm";

interface Props {
  // Max number of category buttons to show (default 10)
  limit?: number;
  className?: string;
}

const api = createApiClient(JobIndexPostsApi);

const PopularCategories: React.FC<Props> = ({ limit = 10, className = "" }) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getJobCategories();
        const raw = res?.categories ?? [];
        const list: CategoryOption[] = raw
          .map(c => {
            const id = c.id;
            const name = c.name ?? "";
            const count = c.numberOfJobs ?? 0;
            if (!id || !name) return null;
            return { id, name, label: `${name} (${count})`, count } as CategoryOption;
          })
          .filter((v): v is CategoryOption => v !== null)
          .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
          .slice(0, limit);
        if (isMounted) setCategories(list);
      } catch {
        if (isMounted) setError("Kunne ikke hente kategorier");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [limit]);

  const handleClick = (category: CategoryOption) => {
    navigate(`/jobsearch?category=${encodeURIComponent(String(category.id))}`);
  };

  return (
    <div className={`card bg-base-100 shadow rounded-lg p-6 ${className}`}>
      <h2 className="card-title mb-4">Populære kategorier</h2>
      {error && !loading && (
        <div className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 min-h-12">
        {loading && (
          <SkeletonChips aria-label="Indlæser kategorier..." />
        )}
        {!loading && !error && (
          <>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleClick(cat)}
                className="btn btn-sm btn-outline"
                aria-label={`Søg på kategorien ${cat.name}`}
              >
                <span className="truncate max-w-40">{cat.name}</span>
                <span className="badge badge-secondary ml-1">{cat.count ?? 0}</span>
              </button>
            ))}
            {categories.length === 0 && (
              <span className="text-sm text-gray-500">Ingen kategorier fundet.</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PopularCategories;
