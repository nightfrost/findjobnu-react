import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { JobIndexPostsApi } from "../findjobnu-api/";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import SearchForm, { type CategoryOption } from "../components/SearchForm";
import JobList from "../components/JobList";

// Reuse the API client instantiation
const api = createApiClient(JobIndexPostsApi);

const normalizeLocation = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [lastSearchParams, setLastSearchParams] = useState<{
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  } | null>(null);
  const [searchParams] = useSearchParams();

  const fetchAllJobs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.getAllJobPosts({ page, pageSize });
      setJobs(data?.items ?? []);
      setTotalCount(data?.totalCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await api.getJobCategories();
      const rawList = (cats as unknown as { categories?: RawCategory[]; items?: RawCategory[]; data?: RawCategory[]; })?.categories
        ?? (cats as unknown as { items?: RawCategory[]; data?: RawCategory[]; categories?: RawCategory[]; })?.items
        ?? (cats as unknown as { data?: RawCategory[]; categories?: RawCategory[]; items?: RawCategory[]; })?.data
        ?? [];
      type RawCategory = {
        id?: unknown;
        name?: string;
        category?: string;
        categoryName?: string;
        numberOfJobs?: unknown;
        jobCount?: unknown;
        count?: unknown;
      };

      const list = (Array.isArray(rawList) ? rawList : [])
        .map((c: RawCategory) => {
          const id = typeof c.id === "number" ? c.id : undefined;
          const name = c.name ?? c.category ?? c.categoryName ?? "";
          const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
          const count = typeof countValue === "number" ? countValue : 0;
          if (!id || !name) return null;
          return {
            id,
            name,
            label: `${name} (${count})`,
            count,
          } satisfies CategoryOption;
        }) as Array<CategoryOption | null>;

      const filtered = list.filter((v): v is CategoryOption => v !== null);
      setCategories(filtered);
    } catch {
      setCategories([]);
    }
  };

  const handleSearch = async (
    params: { searchTerm?: string; location?: string; locationSlug?: string; categoryId?: number; postedAfter?: string; postedBefore?: string },
    page = 1
  ) => {
    setLoading(true);
    try {
      const locationFromInput = params.location?.trim();
      const locationNormalized = normalizeLocation(locationFromInput);
      const postedAfter = params.postedAfter ? new Date(params.postedAfter) : undefined;
      const postedBefore = params.postedBefore ? new Date(params.postedBefore) : undefined;
      const data = await api.getJobPostsBySearch({
        ...params,
        category: params.categoryId != null ? String(params.categoryId) : undefined,
        page,
        location: locationNormalized,
        pageSize,
        postedAfter,
        postedBefore,
      });
      setJobs(data?.items ?? []);
      setTotalCount(data?.totalCount ?? 0);
      setCurrentPage(page);
      setLastSearchParams(params);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (lastSearchParams) {
      handleSearch(lastSearchParams, page);
    } else {
      fetchAllJobs(page);
    }
  };

  useEffect(() => {
    fetchAllJobs();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && !lastSearchParams) {
      const asNumber = Number(categoryParam);
      const categoryId = Number.isFinite(asNumber) ? asNumber : undefined;
      handleSearch({ categoryId }, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="order-2 lg:order-1 flex-1 min-w-0">
          <JobList
            jobs={jobs}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="order-1 lg:order-2 shrink-0">
              <div className="rounded-box border bg-base-100 shadow-sm lg:sticky lg:top-24 w-full lg:w-fit">
            <div className="p-4">
              <SearchForm
                onSearch={(params) => {
                  setCurrentPage(1);
                  setLastSearchParams(params);
                  handleSearch(params, 1);
                }}
                categories={categories}
                queryCategory={searchParams.get("category") ?? undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
