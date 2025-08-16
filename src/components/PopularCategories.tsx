import React, { useEffect, useState } from "react";
import { JobIndexPostsApi } from "../findjobnu-api";
import { createApiClient } from "../helpers/ApiFactory";
import { useNavigate } from "react-router-dom";
import SkeletonChips from "./SkeletonChips";

interface CategoryEntry {
  name: string;
  count: number;
}

interface Props {
  // Max number of category buttons to show (default 10)
  limit?: number;
  className?: string;
}

const api = createApiClient(JobIndexPostsApi);

const PopularCategories: React.FC<Props> = ({ limit = 10, className = "" }) => {
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
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
        const mapping = res?.categoryAndAmountOfJobs || {};
        const list: CategoryEntry[] = Object.entries(mapping)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
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

  const handleClick = (category: string) => {
    navigate(`/jobsearch?category=${encodeURIComponent(category)}`);
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
                key={cat.name}
                type="button"
                onClick={() => handleClick(cat.name)}
                className="btn btn-sm btn-outline"
                aria-label={`Søg på kategorien ${cat.name}`}
              >
                <span className="truncate max-w-40">{cat.name}</span>
                <span className="badge badge-secondary ml-1">{cat.count}</span>
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
