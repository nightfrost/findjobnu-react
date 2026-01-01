import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import JobList from "./JobList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient } from "../helpers/ApiFactory";
import SearchForm, { type CategoryOption } from "./SearchForm";
import { toDateFromInput } from "../helpers/date";

interface Props {
  userId: string;
}

const PAGE_SIZE = 10;

const RecommendedJobs: React.FC<Props> = ({ userId }) => {
  const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [lastSearchParams, setLastSearchParams] = useState<{
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  } | null>(null);

  const { user } = useUser();
  const token = user?.accessToken;

  useEffect(() => {
    const jobApi = createApiClient(JobIndexPostsApi, token);

    const fetchCategories = async () => {
      try {
        const cats = await jobApi.getJobCategories();
        type RawCategory = {
          id?: unknown;
          name?: string;
          category?: string;
          categoryName?: string;
          numberOfJobs?: unknown;
          jobCount?: unknown;
          count?: unknown;
        };
        const rawList = (cats as unknown as { categories?: RawCategory[]; items?: RawCategory[]; data?: RawCategory[]; })?.categories
          ?? (cats as unknown as { items?: RawCategory[]; data?: RawCategory[]; categories?: RawCategory[]; })?.items
          ?? (cats as unknown as { data?: RawCategory[]; categories?: RawCategory[]; items?: RawCategory[]; })?.data
          ?? [];

        const list = (Array.isArray(rawList) ? rawList : [])
          .map((c: RawCategory) => {
            const id = typeof c.id === "number" ? c.id : undefined;
            const name = c.name ?? c.category ?? c.categoryName ?? "";
            const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
            const count = typeof countValue === "number" ? countValue : 0;
            if (!id || !name) return null;
            return { id, name, label: `${name} (${count})`, count } satisfies CategoryOption;
          }) as Array<CategoryOption | null>;

        const filtered = list.filter((v): v is CategoryOption => v !== null);
        setCategories(filtered);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    const jobApi = createApiClient(JobIndexPostsApi, token);
    const fetchRecommended = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchTerm = lastSearchParams?.searchTerm?.trim() || undefined;
        const location = lastSearchParams?.location?.trim();
        const locationNormalized = location ? location : undefined;
        const postedAfter = lastSearchParams?.postedAfter ? toDateFromInput(lastSearchParams.postedAfter) ?? undefined : undefined;
        const postedBefore = lastSearchParams?.postedBefore ? toDateFromInput(lastSearchParams.postedBefore) ?? undefined : undefined;

        const response = await jobApi.getRecommendedJobsForUser({
          searchTerm,
          location: locationNormalized,
          categoryId: lastSearchParams?.categoryId,
          postedAfter,
          postedBefore,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        setJobs(response?.items?.filter(Boolean) ?? []);
        setTotalCount(response?.totalCount ?? 0);
      } catch (e) {
        const handled = await handleApiError(e);
        setError(handled.message);
      }
      setLoading(false);
    };

    fetchRecommended();
  }, [userId, currentPage, token, lastSearchParams]);

  const handleSearch = (params: {
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  }) => {
    setCurrentPage(1);
    setLastSearchParams(params);
  };

  if (jobs.length === 0 && !loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="card-title mb-4">Anbefalede Jobs</h2>
          <div className="text-center py-8">Ingen anbefalede jobs fundet.</div>
        </div>
        <div className="shrink-0 w-full lg:w-fit">
          <div className="card bg-base-100 shadow-sm lg:sticky lg:top-24 w-full">
            <div className="p-4">
              <SearchForm onSearch={handleSearch} categories={categories} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="order-2 lg:order-1 flex-1 min-w-0">
          <h2 className="card-title mb-4">Anbefalede Jobs</h2>
          <JobList
            jobs={jobs}
            loading={loading}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
          />
          {error && <div className="text-center py-8 text-red-500">{error}</div>}
        </div>

        <div className="order-1 lg:order-2 shrink-0 w-full lg:w-fit">
          <div className="card bg-base-100 shadow-sm lg:sticky lg:top-24 w-full">
            <div className="p-4">
              <SearchForm onSearch={handleSearch} categories={categories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedJobs;
