import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { JobIndexPostsApi } from "../findjobnu-api/";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import SearchForm from "../components/SearchForm";
import JobList from "../components/JobList";

// Reuse the API client instantiation
const api = createApiClient(JobIndexPostsApi);

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [lastSearchParams, setLastSearchParams] = useState<{
    searchTerm?: string;
    location?: string;
    category?: string;
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
      const list = (cats?.categories ?? [])
        .map(c => {
          const name = c.name ?? "";
          const count = c.numberOfJobs ?? 0;
          return name ? `${name} (${count})` : null;
        })
        .filter((v): v is string => Boolean(v));
      setCategories(list);
    } catch {
      setCategories([]);
    }
  };

  const handleSearch = async (
    params: { searchTerm?: string; location?: string; category?: string },
    page = 1
  ) => {
    setLoading(true);
    try {
      let category = params.category;
      if (category) {
        category = category.replace(/ \(\d+\)$/i, "");
      }
  // Front-end normalization for location (temporary until backend is case-insensitive)
  const normalizedLocation = params.location?.trim() ? params.location.trim().toLowerCase() : undefined;
  const data = await api.getJobPostsBySearch({ ...params, category, page, location: normalizedLocation });
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
      handleSearch({ category: categoryParam }, 1);
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
          <div className="rounded border bg-white shadow-sm lg:sticky lg:top-24 w-full lg:w-fit">
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
