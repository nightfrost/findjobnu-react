import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import Paging from "./Paging";
import { ProfileApi, JobIndexPostsApi } from "../findjobnu-api";
import { handleApiError } from "../helpers/ErrorHelper";
import { useUser } from "../context/UserContext.shared";
import { createApiClient, getApiBaseUrl } from "../helpers/ApiFactory";
import { sanitizeExternalUrl } from "../helpers/url";
import JobListSkeleton from "./JobListSkeleton";

interface Props {
  jobs: JobIndexPostResponse[];
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
  const [detailsMap, setDetailsMap] = useState<Map<number, JobIndexPostResponse>>(new Map());
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
    setOpenJobIds(prev => {
      const next = new Set(prev);
      if (next.has(jobID)) {
        next.delete(jobID);
      } else {
        next.add(jobID);
      }
      return next;
    });
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

  const normalizeFormat = (fmt?: string | null): string | undefined => {
    if (!fmt) return undefined;
    const cleaned = fmt.trim().replace(/^\./, "").toLowerCase();
    return cleaned.length > 0 ? cleaned : undefined;
  };

  const mimeFromFormat = (fmt?: string | null): string | undefined => {
    switch (normalizeFormat(fmt)) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "bmp":
        return "image/bmp";
      case "webp":
        return "image/webp";
      case "svg":
      case "svg+xml":
        return "image/svg+xml";
      default:
        return undefined;
    }
  };

  const inferMimeFromContent = (compact: string): string => {
    if (compact.startsWith("iVBOR")) return "image/png";
    if (compact.startsWith("R0lGOD")) return "image/gif";
    if (compact.startsWith("Qk")) return "image/bmp";
    if (compact.startsWith("UklGR")) return "image/webp";
    return "image/jpeg";
  };

  const composeDataUri = (compact: string, mimeType?: string | null, format?: string | null): string => {
    const declared = mimeType?.trim();
    if (declared) {
      return `data:${declared};base64,${compact}`;
    }

    const formatMime = mimeFromFormat(format);
    if (formatMime) {
      return `data:${formatMime};base64,${compact}`;
    }

    return `data:${inferMimeFromContent(compact)};base64,${compact}`;
  };

  const resolvePictureSource = (
    raw?: string | null,
    mimeType?: string | null,
    format?: string | null
  ): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;
    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
      return trimmed;
    }

    const compact = trimmed.split(/\s+/).join("");
    const looksBase64 = compact.length > 48 && compact.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(compact);
    if (looksBase64) {
      return composeDataUri(compact, mimeType, format);
    }

    if (trimmed.startsWith("/")) {
      try {
        return new URL(trimmed, getApiBaseUrl()).toString();
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  };

  const renderJobCard = (job: JobIndexPostResponse, idx: number) => {
    const jobId = job.id;
    const hasValidId = typeof jobId === "number";
    const safeJobId = hasValidId ? jobId : undefined;
    const isOpen = safeJobId != null && openJobIds.has(safeJobId);
    const isSaving = safeJobId != null && savingJobIds.has(safeJobId);
    const isSaved = safeJobId != null && savedJobIds.has(safeJobId);
    const freshDetails = safeJobId != null ? detailsMap.get(safeJobId) : undefined;
    const bannerPicture = resolvePictureSource(
      freshDetails?.bannerPicture ?? job.bannerPicture ?? null,
      freshDetails?.bannerMimeType ?? job.bannerMimeType ?? null,
      freshDetails?.bannerFormat ?? job.bannerFormat ?? null
    );
    const footerPicture = resolvePictureSource(
      freshDetails?.footerPicture ?? job.footerPicture ?? null,
      freshDetails?.footerMimeType ?? job.footerMimeType ?? null,
      freshDetails?.footerFormat ?? job.footerFormat ?? null
    );
    const descriptionSource = freshDetails?.description ?? job.description ?? null;
    const canSave = Boolean(user?.userId && user?.accessToken && safeJobId != null);

    let descriptionBlock: React.ReactNode;
    if (!descriptionSource || descriptionSource.trim() === "") {
      descriptionBlock = <p className="text-sm italic text-gray-600">Ingen beskrivelse tilgængelig.</p>;
    } else if (isOpen) {
      descriptionBlock = (
        <>
          <p className="text-sm text-gray-800 whitespace-pre-line">{descriptionSource}</p>
          <button type="button" onClick={() => handleToggleDescription(safeJobId)} className="mt-2 text-blue-600 hover:underline text-sm">
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
            <button type="button" onClick={() => handleToggleDescription(safeJobId)} className="mt-2 text-blue-600 hover:underline text-sm">
              Læs mere
            </button>
          )}
        </>
      );
    }

    const safeJobUrl = sanitizeExternalUrl(job.jobUrl ?? undefined);

    return (
      <div key={safeJobId ?? idx} className="card bg-base-100 shadow-sm space-y-3 p-4" data-testid="job-card">
        <div className="flex justify-between items-start border-b my-2 p-1">
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
            {job.postedDate && <p className="text-xs text-gray-500">Publiceret {new Date(job.postedDate).toLocaleDateString("da-DK")}</p>}
            {job.category && <p className="text-xs text-gray-600 mt-1">{job.category}</p>}
          </div>
        </div>

        {bannerPicture && (
          <div className="flex justify-center pt-2">
            <img
              src={bannerPicture}
              alt="Banner for jobopslag"
              className="max-w-full h-auto max-h-64 rounded-md"
              loading="lazy"
            />
          </div>
        )}
        {bannerPicture && <div className="divider my-1" />}

        <div className="border border-gray-400 p-2 bg-base-200/40 my-2">{descriptionBlock}</div>

        {footerPicture && <div className="divider my-3" />}
        {footerPicture && (
          <div className="flex justify-center">
            <img
              src={footerPicture}
              alt="Footer grafik for jobopslag"
              className="max-w-full h-auto max-h-48 rounded-md"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {safeJobUrl && (
            <a href={safeJobUrl} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">
              Gå til opslag
            </a>
          )}
          {canSave && !isSaved && safeJobId != null && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveJob(safeJobId)}
              className="text-sm px-3 py-1 rounded border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              {isSaving ? "Gemmer…" : "Gem job"}
            </button>
          )}
          {canSave && isSaved && safeJobId != null && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRemoveSavedJob(safeJobId)}
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
            <button type="button" onClick={() => handleToggleDescription(safeJobId)} className="text-sm px-3 py-1 rounded border border-gray-400 text-gray-700 hover:bg-gray-100">
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          className="grid gap-3"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {jobs.map((job, idx) => renderJobCard(job, idx))}
        </motion.div>
      </AnimatePresence>
      <Paging currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
};

export default JobList;