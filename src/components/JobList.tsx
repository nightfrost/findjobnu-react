/* eslint-disable */
import React, { useState } from "react";
import type { JobIndexPosts } from "../findjobnu-api/models/JobIndexPosts";

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

  function getPageNumbers(current: number, total: number, window: number = 2) {
    const pages = [];
    if (total <= 10) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, current - window);
    let end = Math.min(total - 1, current + window);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);

    return pages;
  }

  return (
    <>
      <div className="grid gap-4">
        {jobs.map(job => {
          const isOpen = job.jobID != null && openJobIds.has(job.jobID);
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
                          : <i>Klik på 'Se mere' for at læse mere om stillingen...</i>}
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

                <a
                  href={job.jobUrl ?? undefined}
                  className="btn btn-s btn-success mt-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Se mere
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {/* Paging controls - move to component and parse needed variables*/}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              «
            </button>
            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
              page === "..." ? (
                <button key={idx} className="join-item btn btn-sm btn-disabled">
                  ...
                </button>
              ) : (
                <button
                  key={page}
                  className={`join-item btn btn-sm${
                    currentPage === page ? " btn-active" : ""
                  }`}
                  onClick={() => onPageChange(Number(page))}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default JobList;