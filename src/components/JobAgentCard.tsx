import React, { useEffect, useMemo, useState } from "react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { JobAgentApi, ProfileApi } from "../findjobnu-api";
import { JobAgentFrequency } from "../findjobnu-api/models/JobAgentFrequency";
import type { JobAgentDto } from "../findjobnu-api/models/JobAgentDto";
import { createApiClient } from "../helpers/ApiFactory";
import { handleApiError } from "../helpers/ErrorHelper";

interface Props {
  userId: string;
  accessToken: string;
}

const frequencyOptions = [
  { value: JobAgentFrequency.NUMBER_1, label: "Dagligt" },
  { value: JobAgentFrequency.NUMBER_2, label: "Ugentligt" },
  { value: JobAgentFrequency.NUMBER_3, label: "Månedligt" },
];

const JobAgentCard: React.FC<Props> = ({ userId, accessToken }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [jobAgent, setJobAgent] = useState<JobAgentDto | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<JobAgentFrequency>(JobAgentFrequency.NUMBER_2);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [nextSendAt, setNextSendAt] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"setup" | "manage">("setup");
  const [locationsInput, setLocationsInput] = useState<string>("");
  const [categoriesInput, setCategoriesInput] = useState<string>("");
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  const [unsubscribeLink, setUnsubscribeLink] = useState<string | null>(null);

  const statusBadge = useMemo(() => {
    const base = "badge badge-sm";
    if (mode === "setup") return `${base} badge-outline`;
    return enabled ? `${base} badge-success` : `${base} badge-ghost`;
  }, [enabled, mode]);

  useEffect(() => {
    let cancelled = false;

    const loadJobAgent = async (profileIdValue: number, api: JobAgentApi) => {
      const existing = await api.getJobAgent({ profileId: profileIdValue });
      let link: string | null = null;
      try {
        link = await api.getJobAgentUnsubscribeLink({ profileId: profileIdValue });
      } catch {
        link = null;
      }

      if (cancelled) return;
      setMode("manage");
      setJobAgent(existing);
      setEnabled(existing?.enabled ?? true);
      setFrequency((existing?.frequency as JobAgentFrequency | undefined) ?? JobAgentFrequency.NUMBER_2);
      setLastSentAt(existing?.lastSentAt ? new Date(existing.lastSentAt) : null);
      setNextSendAt(existing?.nextSendAt ? new Date(existing.nextSendAt) : null);
      setLocationsInput((existing?.preferredLocations ?? []).join(", "));
      setCategoriesInput((existing?.preferredCategoryIds ?? []).join(", "));
      setKeywordsInput((existing?.includeKeywords ?? []).join(", "));
      setUnsubscribeLink(link ?? null);
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const profileApi = createApiClient(ProfileApi, accessToken);
        const jobAgentApi = createApiClient(JobAgentApi, accessToken);

        const profile = await profileApi.getProfileByUserId({ userId });
        if (!profile?.id) {
          throw new Error("Profilen mangler et id");
        }
        if (cancelled) return;
        setProfileId(profile.id);

        try {
          await loadJobAgent(profile.id, jobAgentApi);
        } catch (err) {
          const handled = await handleApiError(err);
          if (handled.type === "not_found") {
            if (!cancelled) {
              setMode("setup");
              setJobAgent(null);
              setEnabled(true);
              setFrequency(JobAgentFrequency.NUMBER_2);
              setLastSentAt(null);
              setNextSendAt(null);
              setLocationsInput("");
              setCategoriesInput("");
              setKeywordsInput("");
              setUnsubscribeLink(null);
            }
            return;
          }
          throw err;
        }
      } catch (err) {
        if (!cancelled) {
          const handled = await handleApiError(err);
          setError(handled.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, accessToken]);

  const handleSave = async () => {
    if (!profileId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const api = createApiClient(JobAgentApi, accessToken);
      const parsedLocations = locationsInput.split(",").map((l) => l.trim()).filter(Boolean);
      const parsedCategoryIds = categoriesInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      const parsedKeywords = keywordsInput.split(",").map((k) => k.trim()).filter(Boolean);

      try {
        await api.createOrUpdateJobAgent({
          profileId,
          jobAgentUpdateRequest: {
            enabled,
            frequency,
            preferredLocations: parsedLocations,
            preferredCategoryIds: parsedCategoryIds,
            includeKeywords: parsedKeywords,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const emptyBody = typeof message === "string" && message.toLowerCase().includes("unexpected end of json");
        if (!emptyBody) {
          throw err;
        }
      }

      const refreshed = await api.getJobAgent({ profileId });
      let link: string | null = null;
      try {
        link = await api.getJobAgentUnsubscribeLink({ profileId });
      } catch {
        link = null;
      }

      setJobAgent(refreshed);
      setEnabled(refreshed.enabled ?? enabled);
      setFrequency((refreshed.frequency as JobAgentFrequency | undefined) ?? frequency);
      setLastSentAt(refreshed.lastSentAt ? new Date(refreshed.lastSentAt) : null);
      setNextSendAt(refreshed.nextSendAt ? new Date(refreshed.nextSendAt) : null);
      setLocationsInput((refreshed.preferredLocations ?? []).join(", "));
      setCategoriesInput((refreshed.preferredCategoryIds ?? []).join(", "));
      setKeywordsInput((refreshed.includeKeywords ?? []).join(", "));
      setUnsubscribeLink(link ?? null);
      setMode("manage");
      setMessage("Jobagent gemt");
    } catch (err) {
      const handled = await handleApiError(err);
      setError(handled.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInitial = async () => {
    if (!profileId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const api = createApiClient(JobAgentApi, accessToken);
      try {
        await api.createOrUpdateJobAgent({
          profileId,
          jobAgentUpdateRequest: {
            enabled: true,
            frequency: JobAgentFrequency.NUMBER_2,
            preferredLocations: [],
            preferredCategoryIds: [],
            includeKeywords: [],
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const emptyBody = typeof message === "string" && message.toLowerCase().includes("unexpected end of json");
        if (!emptyBody) {
          throw err;
        }
      }

      const refreshed = await api.getJobAgent({ profileId });
      let link: string | null = null;
      try {
        link = await api.getJobAgentUnsubscribeLink({ profileId });
      } catch {
        link = null;
      }

      setJobAgent(refreshed);
      setEnabled(refreshed.enabled ?? true);
      setFrequency((refreshed.frequency as JobAgentFrequency | undefined) ?? JobAgentFrequency.NUMBER_2);
      setLastSentAt(refreshed.lastSentAt ?? null);
      setNextSendAt(refreshed.nextSendAt ?? null);
      setLocationsInput((refreshed.preferredLocations ?? []).join(", "));
      setCategoriesInput((refreshed.preferredCategoryIds ?? []).join(", "));
      setKeywordsInput((refreshed.includeKeywords ?? []).join(", "));
      setUnsubscribeLink(link ?? null);
      setMode("manage");
      setMessage("Jobagent oprettet");
    } catch (err) {
      const handled = await handleApiError(err);
      setError(handled.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (value: Date | null | undefined) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };

  return (
    <div className="card bg-base-100 shadow rounded-lg p-6 w-full h-fit">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="card-title flex items-center gap-2">
            <span>{mode === "setup" ? "Opsæt jobagent?" : "Jobagent"}</span>
            <BriefcaseIcon className="w-6 h-6 text-primary" aria-hidden="true" />
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "setup"
              ? "Ved oprettelse af JobAgent tilsender vi dig daglig, ugentligt eller månedligt, job anbefalinger der matcher din profil her på siden."
              : "Få automatiske jobforslag på mail."}
          </p>
        </div>
        <span className={statusBadge}>{mode === "setup" ? "Ikke oprettet" : enabled ? "Aktiv" : "Inaktiv"}</span>
      </div>

      {error && <div className="alert alert-error shadow-sm mb-3 text-sm">{error}</div>}
      {message && <div className="alert alert-success shadow-sm mb-3 text-sm">{message}</div>}

      {mode === "setup" ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateInitial}
            disabled={loading || saving || !profileId}
          >
            {saving ? "Opretter..." : "Opret"}
          </button>
          {loading && <div className="text-sm text-gray-500">Henter data...</div>}
        </div>
      ) : (
        <>
          <div className="form-control">
            <label className="label flex-col items-start gap-2">
              <span className="label-text">Aktiver jobagent</span>
              <input
                type="checkbox"
                className="toggle toggle-primary self-start"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                disabled={loading || saving}
              />
            </label>
          </div>

          <div className="form-control mt-3">
            <label className="label flex-col items-start gap-2">
              <span className="label-text">Hyppighed</span>
            
            <select
              className="select select-bordered"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value) as JobAgentFrequency)}
              disabled={loading || saving}
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="form-control">
              <label className="label flex-col items-start gap-2">
                <span className="label-text">Foretrukne lokationer (kommasepareret)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="fx København, Aarhus"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="form-control">
              <label className="label flex-col items-start gap-2">
                <span className="label-text">Kategori-ID'er (kommasepareret)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="fx 12, 34"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                disabled={loading || saving}
              />
              <span className="text-xs text-gray-500 mt-1">Bruger backend kategori-ID'er (tal).</span>
            </div>

            <div className="form-control">
              <label className="label flex-col items-start gap-2">
                <span className="label-text">Søgeord der skal med (kommasepareret)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="fx React, .NET, marketing"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-4 space-y-1">
            <p>Sidst sendt: {formatDateTime(lastSentAt ?? jobAgent?.lastSentAt ?? null)}</p>
            <p>Næste udsendelse: {formatDateTime(nextSendAt ?? jobAgent?.nextSendAt ?? null)}</p>
            {enabled && unsubscribeLink && (
              <div className="pt-2">
                <a
                  className="btn btn-outline btn-error btn-sm"
                  href={unsubscribeLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Afmeld jobagent
                </a>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary mt-5"
            onClick={handleSave}
            disabled={loading || saving || !profileId}
          >
            {saving ? "Gemmer..." : "Gem jobagent"}
          </button>

          {loading && (
            <div className="mt-3 text-sm text-gray-500">Henter jobagent...</div>
          )}
        </>
      )}
    </div>
  );
};

export default JobAgentCard;
