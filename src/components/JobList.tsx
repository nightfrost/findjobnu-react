import React, { useState } from "react";
import type { FindjobnuServiceDTOsResponsesJobIndexPostResponse } from "../findjobnu-api/models/FindjobnuServiceDTOsResponsesJobIndexPostResponse";
import Paging from "./Paging";
import { ProfileApi, JobIndexPostsApi } from "../findjobnu-api";
import { handleApiError } from "../helpers/ErrorHelper";
import { useUser } from "../context/UserContext.shared";
import { createApiClient } from "../helpers/ApiFactory";
import JobListSkeleton from "./JobListSkeleton";

interface Props {
  jobs: FindjobnuServiceDTOsResponsesJobIndexPostResponse[];
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
        globalThis.location.reload();
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
        localStorage.setItem(
          "savedJobsArray",
          savedJobsResponse.items
            ?.map(item => (typeof item.jobID === "number" ? String(item.jobID) : undefined))
            .filter(Boolean)
            .join(",") ?? ""
        );
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
        globalThis.location.reload();
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
        localStorage.setItem(
          "savedJobsArray",
          savedJobsResponse.items
            ?.map(item => (typeof item.jobID === "number" ? String(item.jobID) : undefined))
            .filter(Boolean)
            .join(",") ?? ""
        );
      } catch (e) {
        console.error("Error fetching saved jobs after removing:", e);
      }
    }
  };



  // Per-job fetched details (always freshly fetched when opening)
  const [detailsMap, setDetailsMap] = useState<Map<number, FindjobnuServiceDTOsResponsesJobIndexPostResponse>>(new Map());

  const handleToggleDescription = async (jobID?: number | null) => {
    if (jobID == null) return;
    const willOpen = !openJobIds.has(jobID);
    setOpenJobIds(prev => {
      const next = new Set(prev);
      next.has(jobID) ? next.delete(jobID) : next.add(jobID);
      return next;
    });
    // Fetch fresh details every time we open (no caching reuse)
    if (willOpen) {
      try {
        const jobApi = createApiClient(JobIndexPostsApi);
        const fresh = await jobApi.getJobPostsById({ id: jobID });
        if (fresh) setDetailsMap(prev => new Map(prev).set(jobID, fresh));
      } catch (e) {
        console.warn("Failed to fetch job details", e);
      }
    }
  };

  if (loading) return <JobListSkeleton count={pageSize} />;
  if (!jobs.length) return <div className="text-center py-8">Ingen job fundet.</div>;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="grid gap-3">
        {jobs.map((job, idx) => {
          const isOpen = typeof job.id === "number" && openJobIds.has(job.id);
          const isSaving = typeof job.id === "number" && savingJobIds.has(job.id);
          const isSaved = typeof job.id === "number" && savedJobIds.has(job.id);
          const isLoggedIn = user?.userId != null && user?.accessToken != null;
          const isAlreadySaved = typeof job.id === "number" && localStorage.getItem("savedJobsArray")?.split(",").includes(String(job.id));
          const isJobSaved = isSaved || isAlreadySaved;
          const freshDetails = typeof job.id === "number" ? detailsMap.get(job.id) : undefined;
          // Format published date (if present) using Danish locale; fallback to ISO date if locale unsupported
          let publishedLabel: string | null = null;
          if (job.postedDate) {
            const dateObj = job.postedDate instanceof Date ? job.postedDate : new Date(job.postedDate as any);
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
            <React.Fragment key={job.id ?? idx}>
              <div className="card bg-base-100 shadow rounded-lg p-4">
                <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="card-title ">
                    <span>{job.title}</span>
                  </h2>
                  {publishedLabel && (
                    <span className="text-sm text-gray-500 text-right ml-auto">
                      Publiceret: {publishedLabel}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {job.company} &middot; {job.location}
                </p>

                <div className="mt-4">
                  <p className="mb-2">
                    <i>Klik på 'Ansøg' for at læse mere om stillingen...</i>
                  </p>
                  <button
                    className="btn btn-xs btn-outline mt-1"
                    onClick={() => handleToggleDescription(job.id as number)}
                  >
                    {isOpen ? "Luk" : "Læs mere"}
                  </button>
                  {isOpen && (
                    <div className="mt-3 border-t pt-3 text-sm space-y-1">
                      <p><span className="font-semibold">Titel:</span> {job.title || "-"}</p>
                      <p><span className="font-semibold">Virksomhed:</span> {job.company || "-"}</p>
                      <p><span className="font-semibold">Lokation:</span> {job.location || "-"}</p>
                      {freshDetails?.category && (
                        <p><span className="font-semibold">Kategori:</span> {freshDetails.category}</p>
                      )}
                      {freshDetails?.description && freshDetails.description.trim().length > 0 && (
                        <div>
                          <p className="font-semibold">Beskrivelse:</p>
                          <p className="whitespace-pre-line">{freshDetails.description}</p>
                        </div>
                      )}
                      {publishedLabel && (
                        <p><span className="font-semibold">Publiceret:</span> {publishedLabel}</p>
                      )}
                      {job.jobUrl && (
                        <p><span className="font-semibold">Link:</span> <a className="link link-primary" href={job.jobUrl} target="_blank" rel="noopener noreferrer">Ansøg / Se opslag</a></p>
                      )}
                      {!freshDetails?.category && !publishedLabel && !job.jobUrl && (
                        <p className="italic text-gray-500">Ingen yderligere detaljer tilgængelige.</p>
                      )}
                      {!freshDetails?.description && (
                        <p className="italic text-gray-500">Ingen jobbeskrivelse tilgængelig.</p>
                      )}
                    </div>
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
                    onClick={isJobSaved ? () => handleRemoveSavedJob(job.id as number) : () => handleSaveJob(job.id as number)}
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