import React, { useEffect, useState } from "react";
import { JobIndexPostsApi, Configuration, type JobIndexPosts } from "../findjobnu-api/";
import SearchForm from "../components/SearchForm";
import JobList from "../components/JobList";
import Footer from "../components/Footer";

const api = new JobIndexPostsApi(
  new Configuration({ basePath: "https://findjob.nu" })
);

const Home: React.FC = () => {
  const [jobs, setJobs] = useState<JobIndexPosts[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [lastSearchParams, setLastSearchParams] = useState<{ searchTerm?: string; location?: string; category?: string } | null>(null);

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
      setCategories(cats ?? []);
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
      const data = await api.getJobPostsBySearch({ ...params, page });
      setJobs(data?.items ?? []);
      setTotalCount(data?.totalCount ?? 0);
      setCurrentPage(page);
      setLastSearchParams(params);
    } finally {
      setLoading(false);
    }
  };

  // For paging buttons
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
  }, []);

  return (
    <div className="container mx-auto px-4">
      <SearchForm
        onSearch={(params) => {
          setCurrentPage(1);
          setLastSearchParams(params);
          handleSearch(params, 1);
        }}
        categories={categories}
      />
      <JobList
        jobs={jobs}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Home;