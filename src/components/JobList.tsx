import React, { useState, useEffect } from "react";
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
  const [detailsMap, setDetailsMap] = useState<Map<number, FindjobnuServiceDTOsResponsesJobIndexPostResponse>>(new Map());
  const { user } = useUser();

  const handleSaveJob = async (jobId: number) => {
    const userId = user?.userId;
    const accessToken = user?.accessToken;
    const savedJobsArray = localStorage.getItem("savedJobsArray");
    if (!userId || !jobId || !accessToken) return;
    const api = createApiClient(ProfileApi, accessToken);
    if (savedJobsArray) {
      const savedJobs = new Set(savedJobsArray.split(",").map(Number));
      if (savedJobs.has(jobId)) return;
    }
    setSavingJobIds(prev => new Set(prev).add(jobId));
    try {
      await api.saveJobForUser({ userId: String(userId), jobId: String(jobId) });
      setSavedJobIds(prev => new Set(prev).add(jobId));
      const currentSavedJobs = localStorage.getItem("savedJobsArray");
      if (currentSavedJobs) {
        const arr = currentSavedJobs.split(",");
        if (!arr.includes(String(jobId))) {
          arr.push(String(jobId));
          localStorage.setItem("savedJobsArray", arr.join(","));
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
        const next = new Set(prev); next.delete(jobId); return next;
      });
      try {
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
      setSavedJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
      const currentSavedJobs = localStorage.getItem("savedJobsArray");
      if (currentSavedJobs) {
        const updated = currentSavedJobs.split(",").map(Number).filter(id => id !== jobId);
        localStorage.setItem("savedJobsArray", updated.join(","));
      }
    } catch (e) {
      handleApiError(e).then(error => {
        console.error("Error removing saved job:", error.message);
        globalThis.location.reload();
      });
    } finally {
      setSavingJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
      try {
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

  const truncateWords = (text: string, limit: number) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return { snippet: text.trim(), truncated: false };
    return { snippet: words.slice(0, limit).join(" ") + "…", truncated: true };
  };

  const handleToggleDescription = async (jobID?: number | null) => {
    if (jobID == null) return;
    const willOpen = !openJobIds.has(jobID);
    setOpenJobIds(prev => { const next = new Set(prev); next.has(jobID) ? next.delete(jobID) : next.add(jobID); return next; });
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

  useEffect(() => {
    const saved = localStorage.getItem("savedJobsArray");
    if (saved) {
      const ids = saved.split(",").map(Number).filter(n => !Number.isNaN(n));
      setSavedJobIds(new Set(ids));
    }
  }, []);

  const renderJobCard = (job: FindjobnuServiceDTOsResponsesJobIndexPostResponse, idx: number) => {
    const jobId = job.id;
    const hasValidId = typeof jobId === "number";
    const isOpen = hasValidId && openJobIds.has(jobId);
    const isSaving = hasValidId && savingJobIds.has(jobId);
    const isSaved = hasValidId && savedJobIds.has(jobId);
    const freshDetails = hasValidId ? detailsMap.get(jobId) : undefined;
    const descriptionSource = freshDetails?.description ?? job.description ?? null;
    const canSave = Boolean(user?.userId && user?.accessToken && hasValidId);

    let descriptionBlock: React.ReactNode;
    if (!descriptionSource || descriptionSource.trim() === "") {
      descriptionBlock = <p className="text-sm italic text-gray-600">Ingen beskrivelse tilgængelig.</p>;
    } else if (isOpen) {
      descriptionBlock = (
        <>
          <p className="text-sm text-gray-800 whitespace-pre-line">{descriptionSource}</p>
          <button type="button" onClick={() => handleToggleDescription(job.id)} className="mt-2 text-blue-600 hover:underline text-sm">
            Vis mindre
          </button>
        </>
      );
    } else {
      const { snippet, truncated } = truncateWords(descriptionSource, 100);
      descriptionBlock = (
        <>
          <p className="text-sm text-gray-800 whitespace-pre-line">{snippet}</p>
          {truncated && (
            <button type="button" onClick={() => handleToggleDescription(job.id)} className="mt-2 text-blue-600 hover:underline text-sm">
              Læs mere
            </button>
          )}
        </>
      );
    }

    return (
      <div key={jobId ?? idx} className="p-4 rounded border bg-white shadow-sm space-y-2" data-testid="job-card">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 leading-snug">{job.title ?? "(Ingen titel)"}</h2>
            {(job.company || job.location) ? (
              <p className="mt-1 text-sm text-gray-700">
                {job.company && <span className="font-medium">{job.company}</span>}
                {job.company && job.location && <span> · </span>}
                {job.location && <span>{job.location}</span>}
              </p>
            ) : (
              <p className="mt-1 text-sm italic text-gray-500">Ingen virksomhedsoplysninger.</p>
            )}
          </div>
          <div className="text-right min-w-[120px]">
            {job.postedDate && <p className="text-xs text-gray-500">Publiceret {new Date(job.postedDate).toLocaleDateString()}</p>}
            {job.category && <p className="text-xs text-gray-600 mt-1">{job.category}</p>}
          </div>
        </div>
        <div>{descriptionBlock}</div>
        <div className="flex flex-wrap gap-3 pt-2">
          {job.jobUrl && (
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">
              Gå til opslag
            </a>
          )}
          {canSave && !isSaved && jobId && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveJob(jobId)}
              className="text-sm px-3 py-1 rounded border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              {isSaving ? "Gemmer…" : "Gem job"}
            </button>
          )}
          {canSave && isSaved && hasValidId && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRemoveSavedJob(jobId)}
              className="text-sm px-3 py-1 rounded border border-red-600 text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {isSaving ? "Fjerner…" : "Fjern gemt"}
            </button>
          )}
          {!canSave && (
            <button
              type="button"
              disabled
              className="text-sm px-3 py-1 rounded border border-gray-300 text-gray-400 cursor-not-allowed"
              title="Log ind for at gemme job"
            >
              Gem job
            </button>
          )}
          {descriptionSource && descriptionSource.trim() !== "" && !isOpen && (
            <button type="button" onClick={() => handleToggleDescription(job.id)} className="text-sm px-3 py-1 rounded border border-gray-400 text-gray-700 hover:bg-gray-100">
              Læs mere
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <JobListSkeleton count={pageSize} />;
  if (!jobs.length) return <div className="text-center py-8">Ingen job fundet.</div>;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="grid gap-3">
        {jobs.map((job, idx) => renderJobCard(job, idx))}
      </div>
      <Paging currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
};

export default JobList;