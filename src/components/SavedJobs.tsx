import React, { useEffect, useState } from "react";
import { UserProfileApi, JobIndexPostsApi, Configuration } from "../findjobnu-api";
import type { JobIndexPosts } from "../findjobnu-api/models/JobIndexPosts";
import JobList from "./JobList";
import { handleApiError } from "../helpers/ErrorHelper";

interface Props {
  userId: string;
}

const SavedJobs: React.FC<Props> = ({ userId }) => {
  const [jobs, setJobs] = useState<JobIndexPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("accessToken");
  const jobApi = new JobIndexPostsApi(
    new Configuration({
      basePath: "https://findjob.nu",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  );

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobResults = await jobApi.getSavedJobPostsByUser();
        setJobs(jobResults.filter(Boolean) as JobIndexPosts[]);
      } catch (e) {
        handleApiError(e).then((errorMessage) => {
          setError(errorMessage.message);
        });
      }
      setLoading(false);
    };
    fetchSavedJobs();
  }, [userId]);

  // Paging is optional for saved jobs, but you can add it if needed
  return (
    <div className="mt-8">
      <h2 className="card-title mb-4">Gemte Jobs</h2>
      <JobList
        jobs={jobs}
        loading={loading}
        currentPage={1}
        pageSize={jobs.length || 1}
        totalCount={jobs.length}
        onPageChange={() => {}}
      />
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
    </div>
  );
};

export default SavedJobs;