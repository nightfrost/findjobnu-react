import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { JobIndexPosts } from "../findjobnu-api/models/JobIndexPosts";
import JobList from "./JobList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient } from "../helpers/ApiFactory";

interface Props {
  userId: string;
}

const PAGE_SIZE = 10;

const RecommendedJobs: React.FC<Props> = ({ userId }) => {
  const [jobs, setJobs] = useState<JobIndexPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { user } = useUser();
  const token = user?.accessToken;

  useEffect(() => {
    const jobApi = createApiClient(JobIndexPostsApi, token);
    const fetchRecommended = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await jobApi.getRecommendedJobsForUser({ page: currentPage });
        setJobs(response?.items?.filter(Boolean) ?? []);
        setTotalCount(response?.totalCount ?? 0);
      } catch (e) {
        handleApiError(e).then((errorMessage) => {
          setError(errorMessage.message);
        });
      }
      setLoading(false);
    };
    fetchRecommended();
  }, [userId, currentPage, token]);

  if (jobs.length === 0 && !loading) {
    return <div className="text-center py-8">Ingen anbefalede jobs fundet.</div>;
  }

  return (
    <div className="mt-8">
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
  );
};

export default RecommendedJobs;
