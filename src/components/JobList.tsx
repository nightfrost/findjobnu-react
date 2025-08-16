/* eslint-disable sonarjs/cognitive-complexity */
import React, { useState } from "react";
import type { JobIndexPosts } from "../findjobnu-api/models/JobIndexPosts";
import Paging from "./Paging";
import { ProfileApi } from "../findjobnu-api";
import { handleApiError } from "../helpers/ErrorHelper";
import { useUser } from "../context/UserContext";
import { createApiClient } from "../helpers/ApiFactory";
import JobListSkeleton from "./JobListSkeleton";

interface Props {
  jobs: JobIndexPosts[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const JobList: React.FC<Props> = ({
  jobs,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const [openJobIds, setOpenJobIds] = useState<Set<number>>(new Set());
  const [savingJobIds, setSavingJobIds] = useState<Set<number>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const { user } = useUser();

  const handleSaveJob = async (jobId: number) => {
    const userId = user?.userId;
    const accessToken = user?.accessToken;
    const savedJobsArray = localStorage.getItem("savedJobsArray");

    if (!userId || !jobId || !accessToken) return;

    const api = createApiClient(ProfileApi, accessToken);

    if (savedJobsArray) {
      const savedJobs = new Set(savedJobsArray.split(",").map(Number));
      if (savedJobs.has(jobId)) {
        return; // Already saved, no need to proceed
      }
    }

    setSavingJobIds(prev => new Set(prev).add(jobId));
    try {
      await api.saveJobForUser({ userId: String(userId), jobId: String(jobId) });
      setSavedJobIds(prev => new Set(prev).add(jobId));

      // Also update localStorage immediately
      const currentSavedJobs = localStorage.getItem("savedJobsArray");
      if (currentSavedJobs) {
        const savedJobsArray = currentSavedJobs.split(",");
        if (!savedJobsArray.includes(String(jobId))) {
          savedJobsArray.push(String(jobId));
          localStorage.setItem("savedJobsArray", savedJobsArray.join(","));
        }
      } else {
        localStorage.setItem("savedJobsArray", String(jobId));
      }
    } catch (e) {
      handleApiError(e).then(error => {
        console.error("Error saving job:", error.message);
        window.location.reload();
      });
    } finally {
      setSavingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      try {
        // Attempt to refresh saved jobs after saving
        const savedJobsResponse = await api.getSavedJobsByUserId({ userId: userId ?? "" });
        localStorage.setItem("savedJobsArray", savedJobsResponse.items?.map(item => item.jobID?.toString()).join(",") ?? "");
      } catch (e) {
        console.error("Error fetching saved jobs after saving:", e);
      }
    }
  };

  const handleRemoveSavedJob = async (jobId: number) => {
    const userId = user?.userId;
    const accessToken = user?.accessToken;

    if (!userId || !jobId || !accessToken) return;

    const api = createApiClient(ProfileApi, accessToken);

    setSavingJobIds(prev => new Set(prev).add(jobId));
    try {
      await api.removeSavedJobForUser({ userId: String(userId), jobId: String(jobId) });
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });

      // Also update localStorage immediately
      const currentSavedJobs = localStorage.getItem("savedJobsArray");
      if (currentSavedJobs) {
        const savedJobsArray = currentSavedJobs.split(",").map(Number);
        const updatedSavedJobs = savedJobsArray.filter(id => id !== jobId);
        localStorage.setItem("savedJobsArray", updatedSavedJobs.join(","));
      }
    } catch (e) {
      handleApiError(e).then(error => {
        console.error("Error removing saved job:", error.message);
        window.location.reload();
      });
    } finally {
      setSavingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      try {
        // Attempt to refresh saved jobs after removing
        const savedJobsResponse = await api.getSavedJobsByUserId({ userId: userId ?? "" });
        localStorage.setItem("savedJobsArray", savedJobsResponse.items?.map(item => item.jobID?.toString()).join(",") ?? "");
      } catch (e) {
        console.error("Error fetching saved jobs after removing:", e);
      }
    }
  };



  const handleToggleDescription = (jobID?: number | null) => {
    if (jobID == null) return;
    setOpenJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobID)) {
        newSet.delete(jobID);
      } else {
        newSet.add(jobID);
      }
      return newSet;
    });
  };

  if (loading) return <JobListSkeleton count={pageSize} />;
  if (!jobs.length) return <div className="text-center py-8">Ingen job fundet.</div>;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="grid gap-3">
        {jobs.map((job, idx) => {
          const isOpen = job.jobID != null && openJobIds.has(job.jobID);
          const isSaving = job.jobID != null && savingJobIds.has(job.jobID);
          const isSaved = job.jobID != null && savedJobIds.has(job.jobID);
          const isLoggedIn = user?.userId != null && user?.accessToken != null;
          const isAlreadySaved = localStorage.getItem("savedJobsArray")?.split(",").includes(String(job.jobID));
          const isJobSaved = isSaved || isAlreadySaved;
          // Format published date (if present) using Danish locale; fallback to ISO date if locale unsupported
          let publishedLabel: string | null = null;
          if (job.published) {
            const dateObj = job.published instanceof Date ? job.published : new Date(job.published);
            publishedLabel = dateObj.toLocaleDateString('da-DK', { year: 'numeric', month: 'short', day: '2-digit' });
          }
          // Derive button label without nested ternaries
          let saveButtonText = 'Gem';
          if (isJobSaved) {
            saveButtonText = 'Fjern';
          } else if (isSaving) {
            saveButtonText = 'Gemmer...';
          }

          return (
            <React.Fragment key={job.jobID ?? idx}>
              <div className="card bg-base-100 shadow rounded-lg p-4">
                <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="card-title ">
                    <span>{job.jobTitle}</span>
                  </h2>
                  {publishedLabel && (
                    <span className="text-sm text-gray-500 text-right ml-auto">
                      Publiceret: {publishedLabel}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {job.companyName} &middot; {job.jobLocation}
                </p>
                {job.bannerPicture && (
                  <div className="w-full max-w-3xl mx-auto my-2 rounded overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${job.bannerPicture}`}
                      alt=""
                      width={1200}
                      height={400}
                      className="w-full h-auto object-cover block"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="mt-4">
                  {!isOpen ? (
                    <>
                      <p>
                        {job.jobDescription && job.jobDescription.trim() !== ""
                          ? <>
                            {job.jobDescription.slice(0, 350)}
                            {job.jobDescription.length > 350 && "..."}
                          </>
                          : <i>Klik på 'Ansøg' for at læse mere om stillingen...</i>}
                      </p>
                      {job.jobDescription && job.jobDescription.trim() !== "" && (
                        <button
                          className="btn btn-xs btn-outline mt-2"
                          onClick={() => handleToggleDescription(job.jobID)}
                        >
                          Vis mere
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-2 whitespace-pre-line">{job.jobDescription}</p>
                      {job.footerPicture && (
                        <div className="w-full max-w-3xl mx-auto my-2 rounded overflow-hidden">
                          <img
                            src={`data:image/jpeg;base64,${job.footerPicture}`}
                            alt=""
                            width={1200}
                            height={400}
                            className="w-full h-auto object-cover block"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <button
                        className="btn btn-xs btn-outline mt-2"
                        onClick={() => handleToggleDescription(job.jobID)}
                      >
                        Skjul beskrivelse
                      </button>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <a
                    href={job.jobUrl ?? undefined}
                    className="btn btn-s btn-success"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ansøg
                  </a>
                  <button
                    className="btn btn-outline btn-s btn-error"
                    disabled={isSaving || !isLoggedIn}
                    onClick={isJobSaved ? () => handleRemoveSavedJob(job.jobID!) : () => handleSaveJob(job.jobID!)}
                  >
                    {isJobSaved ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                      </svg>
                    )}
                    {saveButtonText}
                  </button>
                </div>
              </div>
              </div>
              {idx < jobs.length - 1 && <div className="" />}
            </React.Fragment>
          );
        })}
      </div>
      <Paging
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default JobList;