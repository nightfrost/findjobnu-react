import React, { useEffect, useMemo, useState } from "react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { JobAgentApi, JobIndexPostsApi, ProfileApi } from "../findjobnu-api";
import { JobAgentFrequency } from "../findjobnu-api/models/JobAgentFrequency";
import type { JobAgentDto } from "../findjobnu-api/models/JobAgentDto";
import { createApiClient } from "../helpers/ApiFactory";
import { handleApiError } from "../helpers/ErrorHelper";
import LocationTypeahead from "./LocationTypeahead";

interface Props {
  userId: string;
  accessToken: string;
}

const frequencyOptions = [
  { value: JobAgentFrequency.NUMBER_1, label: "Dagligt" },
  { value: JobAgentFrequency.NUMBER_2, label: "Ugentligt" },
  { value: JobAgentFrequency.NUMBER_3, label: "Månedligt" },
];

type CategoryOption = {
  id: number;
  name: string;
  label: string;
  count: number;
};

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategoryOption[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  const [unsubscribeLink, setUnsubscribeLink] = useState<string | null>(null);

  const statusBadge = useMemo(() => {
    const base = "badge badge-md whitespace-nowrap px-3 py-2 text-xs font-semibold leading-tight";
    if (mode === "setup") return `${base} badge-outline`;
    return enabled ? `${base} badge-success` : `${base} badge-ghost`;
  }, [enabled, mode]);

  const categoryDelimiter = ",";

  const splitTokens = (raw: string) => raw.split(categoryDelimiter).map((t) => t.trim()).filter((t) => t.length > 0);

  const matchCategory = (token: string) => {
    const lower = token.toLowerCase();
    return categoryOptions.find((c) => c.name.toLowerCase() === lower || c.label.toLowerCase() === lower);
  };

  const deriveCategoryIds = (input: string) => {
    return splitTokens(input)
      .map((token) => {
        const match = matchCategory(token);
        if (match?.id) return match.id;
        const numeric = Number(token);
        return Number.isFinite(numeric) ? numeric : null;
      })
      .filter((id): id is number => id != null);
  };

  const formatCategoriesInput = (ids: number[]) => {
    if (!ids.length) return "";
    return ids
      .map((id) => categoryOptions.find((c) => c.id === id)?.name ?? id.toString())
      .join(`${categoryDelimiter} `);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const api = createApiClient(JobIndexPostsApi);
        const cats = await api.getJobCategories();
        type RawCategory = {
          id?: unknown;
          name?: string;
          category?: string;
          categoryName?: string;
          numberOfJobs?: unknown;
          jobCount?: unknown;
          count?: unknown;
        };

        const rawList = (cats as unknown as { categories?: RawCategory[]; items?: RawCategory[]; data?: RawCategory[]; })?.categories
          ?? (cats as unknown as { items?: RawCategory[]; data?: RawCategory[]; categories?: RawCategory[]; })?.items
          ?? (cats as unknown as { data?: RawCategory[]; categories?: RawCategory[]; items?: RawCategory[]; })?.data
          ?? [];

        const list = (Array.isArray(rawList) ? rawList : [])
          .map((c: RawCategory) => {
            const id = typeof c.id === "number" ? c.id : undefined;
            const name = c.name ?? c.category ?? c.categoryName ?? "";
            const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
            const count = typeof countValue === "number" ? countValue : 0;
            if (!id || !name) return null;
            return { id, name, label: `${name} (${count})`, count } satisfies CategoryOption;
          })
          .filter((v): v is CategoryOption => v !== null);

        if (!cancelled) {
          setCategoryOptions(list);
          setCategorySuggestions(list.slice(0, 8));
          if (selectedCategoryIds.length) {
            setCategoriesInput(formatCategoriesInput(selectedCategoryIds));
          }
        }
      } catch {
        if (!cancelled) {
          setCategoryOptions([]);
          setCategorySuggestions([]);
        }
      }
    };

    fetchCategories();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const ids = existing?.preferredCategoryIds ?? [];
      setSelectedCategoryIds(ids);
      setCategoriesInput(ids.length ? ids.join(", ") : "");
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
              setSelectedCategoryIds([]);
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
      const parsedCategoryIds = deriveCategoryIds(categoriesInput);
      const categoryIds = parsedCategoryIds.length ? parsedCategoryIds : selectedCategoryIds;
      const parsedKeywords = keywordsInput.split(",").map((k) => k.trim()).filter(Boolean);

      try {
        await api.createOrUpdateJobAgent({
          profileId,
          jobAgentUpdateRequest: {
            enabled,
            frequency,
            preferredLocations: parsedLocations,
            preferredCategoryIds: categoryIds,
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
      const refreshedIds = refreshed.preferredCategoryIds ?? selectedCategoryIds;
      setSelectedCategoryIds(refreshedIds);
      setCategoriesInput(formatCategoriesInput(refreshedIds));
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
      const refreshedIds = refreshed.preferredCategoryIds ?? [];
      setSelectedCategoryIds(refreshedIds);
      setCategoriesInput(formatCategoriesInput(refreshedIds));
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

  const getLastCategoryToken = (input: string) => {
    const parts = input.split(categoryDelimiter);
    return (parts[parts.length - 1] ?? "").trim();
  };

  const updateCategorySuggestions = (query: string) => {
    if (!categoryOptions.length) {
      setCategorySuggestions([]);
      setShowCategorySuggestions(false);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = categoryOptions
      .filter((opt) => !lower || opt.name.toLowerCase().includes(lower) || opt.label.toLowerCase().includes(lower))
      .slice(0, 8);
    setCategorySuggestions(filtered);
    setShowCategorySuggestions(filtered.length > 0);
    setActiveCategoryIndex(filtered.length ? 0 : -1);
  };

  const handleCategoriesFocus = () => {
    updateCategorySuggestions(getLastCategoryToken(categoriesInput));
  };

  const handleCategoriesChange = (val: string) => {
    setCategoriesInput(val);
    setSelectedCategoryIds(deriveCategoryIds(val));
    setActiveCategoryIndex(-1);
    updateCategorySuggestions(getLastCategoryToken(val));
  };

  const handleCategorySuggestionClick = (option: CategoryOption) => {
    const rawParts = categoriesInput.split(categoryDelimiter);
    if (rawParts.length === 0) rawParts.push("");
    rawParts[rawParts.length - 1] = option.name;
    const normalized = rawParts.map((p) => p.trim()).filter((p) => p.length > 0);
    const nextInput = normalized.join(`${categoryDelimiter} `);
    setCategoriesInput(nextInput);
    const ids = deriveCategoryIds(nextInput);
    setSelectedCategoryIds(ids.length ? ids : [option.id]);
    setShowCategorySuggestions(false);
    setActiveCategoryIndex(-1);
  };

  const handleCategoriesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCategorySuggestions || categorySuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCategoryIndex((i) => (i + 1) % categorySuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCategoryIndex((i) => (i - 1 + categorySuggestions.length) % categorySuggestions.length);
    } else if (e.key === "Enter") {
      if (activeCategoryIndex >= 0 && activeCategoryIndex < categorySuggestions.length) {
        e.preventDefault();
        handleCategorySuggestionClick(categorySuggestions[activeCategoryIndex]);
      }
    } else if (e.key === "Escape") {
      setShowCategorySuggestions(false);
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
              <LocationTypeahead
                value={locationsInput}
                onChange={setLocationsInput}
                placeholder="fx København, Aarhus"
                className="input input-bordered"
                inputProps={{
                  disabled: loading || saving,
                  "aria-label": "Foretrukne lokationer",
                }}
                allowCommaSeparated
              />
            </div>

            <div className="form-control">
              <label className="label flex-col items-start gap-2">
                <span className="label-text">Kategorier (kommasepareret)</span>
              </label>
              <div
                className="relative"
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 100)}
              >
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Start skriv for at vælge – understøtter komma"
                  value={categoriesInput}
                  onChange={(e) => handleCategoriesChange(e.target.value)}
                  onFocus={handleCategoriesFocus}
                  onKeyDown={handleCategoriesKeyDown}
                  disabled={loading || saving}
                  aria-label="Kategorier"
                />
                {showCategorySuggestions && categorySuggestions.length > 0 && (
                  <ul className="absolute left-0 top-full z-30 w-full max-h-48 overflow-y-auto mt-1 p-0 border border-base-300 bg-base-100 rounded-lg shadow-lg">
                    {categorySuggestions.map((cat, idx) => (
                      <li key={cat.id} className="border-b last:border-b-0 border-base-200">
                        <button
                          type="button"
                          className={`w-full text-left px-3 py-2 rounded-none border-0 bg-base-100 ${idx === activeCategoryIndex ? "bg-primary text-primary-content" : "hover:bg-base-200"}`}
                          onMouseDown={(e) => { e.preventDefault(); handleCategorySuggestionClick(cat); }}
                          onClick={() => handleCategorySuggestionClick(cat)}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span>{cat.name}</span>
                            <span className="text-xs opacity-70">{cat.count}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1">Skriv flere kategorier adskilt med komma. Matcher automatisk navne eller ID'er.</span>
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
