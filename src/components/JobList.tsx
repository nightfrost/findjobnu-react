/* eslint-disable */
import React, { useState } from "react";
import type { JobIndexPosts } from "../findjobnu-api/models/JobIndexPosts";
import Paging from "./Paging";
import { UserProfileApi } from "../findjobnu-api/apis/UserProfileApi";
import { Configuration } from "../findjobnu-api";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { handleApiError } from "../helpers/ErrorHelper";

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

  const handleSaveJob = async (jobId: number) => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    const savedJobsArray = localStorage.getItem("savedJobsArray");
    
    if (!userId || !jobId || !accessToken) return;

    const api = new UserProfileApi(
      new Configuration({
        basePath: "https://findjob.nu",
        accessToken: accessToken ?? undefined,
        headers: {
                Authorization: `Bearer ${accessToken}`
              }
      })
    );

    if (savedJobsArray) {
      const savedJobs = new Set(savedJobsArray.split(",").map(Number));
      if (savedJobs.has(jobId)) {
        return; // Already saved, no need to proceed
      }
    }

    setSavingJobIds(prev => new Set(prev).add(jobId));
    try {
      await api.saveJob({ userId: String(userId), jobId: String(jobId) });
      setSavedJobIds(prev => new Set(prev).add(jobId));
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
        const savedJobsResponse = await api.getSavedJob({ userId: userId ?? "" });
        localStorage.setItem("savedJobsArray", savedJobsResponse.join(","));
      } catch (e) {
        console.error("Error fetching saved jobs after saving:", e);
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

  if (loading) return <div className="text-center py-8">Indlæser...</div>;
  if (!jobs.length) return <div className="text-center py-8">Ingen job fundet.</div>;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="grid gap-4">
        {jobs.map(job => {
          const isOpen = job.jobID != null && openJobIds.has(job.jobID);
          const isSaving = job.jobID != null && savingJobIds.has(job.jobID);
          const isSaved = job.jobID != null && savedJobIds.has(job.jobID);
          const isLoggedIn = localStorage.getItem("userId") != null && localStorage.getItem("accessToken") != null;
          const isAlreadySaved = localStorage.getItem("savedJobsArray")?.split(",").includes(String(job.jobID));

          return (
            <div key={job.jobID} className="card bg-base-100 shadow p-4">
              <div>
                <h2 className="card-title">{job.jobTitle}</h2>
                <p className="text-sm text-gray-500">
                  {job.companyName} &middot; {job.jobLocation}
                </p>
                {job.bannerPicture && (
                  <img
                    src={`data:image/jpeg;base64,${job.bannerPicture}`}
                    alt=""
                    className="w-170 object-cover rounded my-2 center mx-auto"
                  />
                )}

                <div className="mt-8">
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
                        <img
                          src={`data:image/jpeg;base64,${job.footerPicture}`}
                          alt=""
                          className="w-170 object-cover rounded my-2 center mx-auto"
                        />
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
                    className="btn btn-s btn-outline btn-secondary"
                    disabled={isSaving || isSaved || !isLoggedIn || isAlreadySaved}
                    onClick={() => handleSaveJob(job.jobID!)}
                  >
                    <BookmarkIcon className="h-5 w-5"/>
                    {isSaved || isAlreadySaved ? "Gemt!" : isSaving ? "Gemmer..." : "Gem"}
                  </button>
                </div>
              </div>
            </div>
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