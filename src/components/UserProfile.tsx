// Helper to convert ProfileDto to Profile (for editing/updating)
import type { FindjobnuServiceDTOsProfileDto } from "../findjobnu-api/models/FindjobnuServiceDTOsProfileDto";
function mapProfileDtoToProfile(dto: FindjobnuServiceDTOsProfileDto): Profile {
  return {
    id: dto.id,
    userId: dto.userId ?? '',
    lastUpdatedAt: dto.lastUpdatedAt,
    createdAt: dto.createdAt,
    savedJobPosts: dto.savedJobPosts ?? [],
    keywords: dto.keywords ?? [],
  basicInfo: dto.basicInfo as unknown as import("../findjobnu-api/models/BasicInfo").BasicInfo,
  experiences: dto.experiences as unknown as import("../findjobnu-api/models/Experience").Experience[],
  educations: dto.educations as unknown as import("../findjobnu-api/models/Education").Education[],
  interests: dto.interests as unknown as import("../findjobnu-api/models/Interest").Interest[],
  accomplishments: dto.accomplishments as unknown as import("../findjobnu-api/models/Accomplishment").Accomplishment[],
  contacts: dto.contacts as unknown as import("../findjobnu-api/models/Contact").Contact[],
  skills: dto.skills as unknown as import("../findjobnu-api/models/Skill").Skill[],
  };
}
import React, { useEffect, useRef, useState } from "react";
import ProfileSkeleton from "./ProfileSkeleton";
import LocationTypeahead from "./LocationTypeahead";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import { ProfileApi } from "../findjobnu-api";
import type { Profile } from "../findjobnu-api/models/Profile";
// using new DTO type for fetched profile
import type { Experience } from "../findjobnu-api/models/Experience";
import type { Education } from "../findjobnu-api/models/Education";
import type { Skill } from "../findjobnu-api/models/Skill";
import WorkExperienceList from "./WorkExperienceList";
import EducationList from "./EducationList";
import SkillList from "./SkillList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient, createProfileSimple } from "../helpers/ApiFactory";

interface Props { userId: string; }

type EditingCard = 'basic' | 'about' | 'experiences' | 'educations' | 'skills' | null;

const UserProfileComponent: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<FindjobnuServiceDTOsProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateOfBirthInput, setDateOfBirthInput] = useState<string>("");
  // Which card is currently being edited (null = none)
  const [editingCard, setEditingCard] = useState<EditingCard>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  // Toast confirmation handling
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      globalThis.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastTimerRef.current = globalThis.setTimeout(() => setToast(null), 3000);
  };
  // LocationTypeahead handles suggestions
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayRef = useRef<Pikaday | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const token = user?.accessToken;

  // Date picker setup
  useEffect(() => {
    if (editingCard === 'basic' && dateInputRef.current) {
      pikadayRef.current ??= new Pikaday({
        field: dateInputRef.current,
        format: "YYYY-MM-DD",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()]
      });
      if (dateOfBirthInput) {
        const [y, m, d] = dateOfBirthInput.split('-').map(Number);
        pikadayRef.current.setDate(new Date(y, m - 1, d), true);
      }
    }
    return () => { if (pikadayRef.current) { pikadayRef.current.destroy(); pikadayRef.current = null; } };
  }, [editingCard, dateOfBirthInput]);

  // Fetch profile
  useEffect(() => {
    const api = createApiClient(ProfileApi, token);
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data: FindjobnuServiceDTOsProfileDto = await api.getProfileByUserId({ userId });
        if (cancelled) return;
        const mapped = mapProfileDtoToProfile(data);
        setProfile(data); setForm(mapped);
        if (data.basicInfo?.dateOfBirth instanceof Date && !Number.isNaN(data.basicInfo.dateOfBirth.getTime())) {
          const d = data.basicInfo.dateOfBirth;
          setDateOfBirthInput(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`);
        }
  setLocation(data.basicInfo?.location ?? "");
  setKeywordsInput((mapped.keywords || []).join(", "));
      } catch (e) {
        const err = await handleApiError(e);
        if (err.type !== "not_found") setError(err.message);
        setProfile(null); setForm(null);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId, token]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    setForm({ ...form, basicInfo: { ...form.basicInfo, [e.target.name]: e.target.value } });
  };

  // LocationTypeahead handles focus, change, and suggestion click

  const handleSave = async () => {
    if (!form?.id) return;
    // Trigger HTML5 validation for inputs using DaisyUI Validator
    if (containerRef.current) {
      const fields = containerRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input.validator, textarea.validator, select.validator"
      );
      for (const field of Array.from(fields)) {
        if (!field.checkValidity()) {
          field.reportValidity();
          setError("Ret venligst valideringsfejlene.");
          return;
        }
      }
    }
    const api = createApiClient(ProfileApi, token);
    setLoading(true); setError(null);
    try {
      const norm = (v?: string | null): string | null => {
        if (v == null) return null;
        const t = v.trim();
        if (t === "") return null;
        // If ISO datetime is provided, trim to date
        const d = t.length >= 10 ? t.substring(0, 10) : t;
        return d;
      };
      const parsedKeywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      const toSave: Profile = {
        ...form,
        keywords: parsedKeywords,
        experiences: (form.experiences || []).map(e => ({
          ...e,
          fromDate: norm(e.fromDate),
          toDate: norm(e.toDate),
        })),
        educations: (form.educations || []).map(ed => ({
          ...ed,
          fromDate: norm(ed.fromDate),
          toDate: norm(ed.toDate),
        })),
        basicInfo: { ...form.basicInfo, dateOfBirth: dateOfBirthInput ? new Date(dateOfBirthInput) : null, location }
      }; // Profile is used for saving

      // Map to new comprehensive UpdateRequest DTO
      await api.updateProfile({
        id: form.id,
        findjobnuServiceDTOsRequestsProfileUpdateRequest: {
          userId: form.userId,
          firstName: form.basicInfo?.firstName ?? "",
          lastName: form.basicInfo?.lastName ?? "",
          dateOfBirth: toSave.basicInfo?.dateOfBirth ?? undefined,
          phoneNumber: toSave.basicInfo?.phoneNumber ?? undefined,
          about: toSave.basicInfo?.about ?? undefined,
          location: toSave.basicInfo?.location ?? undefined,
          company: toSave.basicInfo?.company ?? undefined,
          jobTitle: toSave.basicInfo?.jobTitle ?? undefined,
          linkedinUrl: toSave.basicInfo?.linkedinUrl ?? undefined,
          openToWork: toSave.basicInfo?.openToWork ?? undefined,
          experiences: (toSave.experiences || []).map(e => ({
            positionTitle: e.positionTitle ?? undefined,
            company: e.company ?? undefined,
            fromDate: e.fromDate ?? undefined,
            toDate: e.toDate ?? undefined,
            duration: e.duration ?? undefined,
            location: e.location ?? undefined,
            description: e.description ?? undefined,
            linkedinUrl: e.linkedinUrl ?? undefined,
          })),
          educations: (toSave.educations || []).map(ed => ({
            institution: ed.institution ?? undefined,
            degree: ed.degree ?? undefined,
            fromDate: ed.fromDate ?? undefined,
            toDate: ed.toDate ?? undefined,
            description: ed.description ?? undefined,
            linkedinUrl: ed.linkedinUrl ?? undefined,
          })),
          interests: ((toSave.interests || []).map(i => ({ name: (i as any).name ?? undefined })) as unknown) as any,
          accomplishments: ((toSave.accomplishments || []).map(a => ({ title: (a as any).title ?? undefined, description: (a as any).description ?? undefined })) as unknown) as any,
          contacts: ((toSave.contacts || []).map(c => ({ type: (c as any).type ?? undefined, value: (c as any).value ?? undefined })) as unknown) as any,
          skills: ((toSave.skills || []).map(s => ({
            name: s.name ?? "",
            proficiency: { value: Number(s.proficiency ?? 0) }
          })) as unknown) as any,
          keywords: toSave.keywords ?? [],
          savedJobPosts: toSave.savedJobPosts ?? [],
        }
      });
      const refreshed = await api.getProfileByUserId({ userId });
      setProfile(refreshed);
      setForm(toSave);
      setEditingCard(null);
  showToast('Profil gemt');
    } catch (e) { const err = await handleApiError(e); setError(err.message); }
    finally { setLoading(false); }
  };

  const handleCreateProfile = async () => {
    const api = createApiClient(ProfileApi, token);
    setLoading(true); setError(null);
    try {
      const newProfile: Profile = {
        userId,
        basicInfo: { firstName: "", lastName: "", phoneNumber: "", dateOfBirth: null, location: "" },
        savedJobPosts: [], keywords: [], experiences: [], educations: [], interests: [], accomplishments: [], contacts: [], skills: []
      } as Profile;
  await createProfileSimple(api, {
    userId,
    fullName: `${newProfile.basicInfo?.firstName ?? ""} ${newProfile.basicInfo?.lastName ?? ""}`.trim(),
    email: undefined,
    phone: newProfile.basicInfo?.phoneNumber ?? undefined,
    summary: newProfile.basicInfo?.about ?? undefined,
  });
  const fresh = await api.getProfileByUserId({ userId });
  setProfile(fresh);
  setForm(mapProfileDtoToProfile(fresh));
  setEditingCard('basic');
  setKeywordsInput("");
  showToast('Profil oprettet');
    } catch (e) { const err = await handleApiError(e); setError(err.message); }
    finally { setLoading(false); }
  };

  // (removed unused dobDisplay)

  const renderExperiencesSection = () => {
  if (editingCard === 'experiences') {
      return (
        <WorkExperienceList
          experiences={form?.experiences || []}
          onAdd={(exp: Experience) => form && setForm({ ...form, experiences: [...(form.experiences || []), exp] })}
          onUpdate={(exp: Experience) => form && setForm({ ...form, experiences: (form.experiences || []).map(e => e.id === exp.id ? exp : e) })}
          onDelete={(id: number) => form && setForm({ ...form, experiences: (form.experiences || []).filter(e => e.id !== id) })}
          readOnly={false}
        />
      );
    }
    if (!form?.experiences || form.experiences.length === 0) {
      return <div className="mt-1 text-gray-400">Ikke angivet</div>;
    }
    return (
      <WorkExperienceList
        experiences={form.experiences || []}
        onAdd={() => { }}
        onUpdate={() => { }}
        onDelete={() => { }}
        readOnly={true}
      />
    );
  };

  const renderEducationsSection = () => {
  if (editingCard === 'educations') {
      return (
        <EducationList
          educations={form?.educations || []}
          onAdd={(edu: Education) => form && setForm({ ...form, educations: [...(form.educations || []), edu] })}
          onUpdate={(edu: Education) => form && setForm({ ...form, educations: (form.educations || []).map(e => e.id === edu.id ? edu : e) })}
          onDelete={(id: number) => form && setForm({ ...form, educations: (form.educations || []).filter(e => e.id !== id) })}
          readOnly={false}
        />
      );
    }
    if (!form?.educations || form.educations.length === 0) {
      return <div className="mt-1 text-gray-400">Ikke angivet</div>;
    }
    return (
      <EducationList
        educations={form.educations || []}
        onAdd={() => { }}
        onUpdate={() => { }}
        onDelete={() => { }}
        readOnly={true}
      />
    );
  };

  const renderSkillsSection = () => {
  if (editingCard === 'skills') {
      return (
        <SkillList
          skills={form?.skills || []}
          onAdd={(skill: Skill) => form && setForm({ ...form, skills: [...(form.skills || []), skill] })}
          onUpdate={(skill: Skill) => form && setForm({ ...form, skills: (form.skills || []).map(s => s.id === skill.id ? skill : s) })}
          onDelete={(id: number) => form && setForm({ ...form, skills: (form.skills || []).filter(s => s.id !== id) })}
          readOnly={false}
        />
      );
    }
    if (!form?.skills || form.skills.length === 0) {
      return <div className="mt-1 text-gray-400">Ikke angivet</div>;
    }
    return (
      <SkillList
        skills={form.skills || []}
        onAdd={() => { }}
        onUpdate={() => { }}
        onDelete={() => { }}
        readOnly={true}
      />
    );
  };

  if (loading) return <ProfileSkeleton />;

  if (error || profile === null) {
    return (
  <div className="card bg-base-100 shadow rounded-lg p-6 w-full h-fit">
        <div className="text-center py-8">
          Ingen profil fundet.<br />
          <button className="btn btn-primary mt-4" onClick={handleCreateProfile}>Opret profil</button>
        </div>
      </div>
    );
  }

  return (
  <div className="w-full h-fit" ref={containerRef}>
      {/* Card 1: Basisoplysninger */}
  <div className="card bg-base-100 shadow rounded-lg p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title">Basisoplysninger{" "}
            <button
              type="button"
              className="tooltip tooltip-left"
              data-tip="Vi bruger dine informationer til at finde relevante job annoncer i bla. 'Anbefalede job'. Vi videregiver aldrig dine oplysninger til tredjeparter."
              aria-label="Hjælp til Min Profil"
            >
              <QuestionMarkCircleIcon
                className="w-5 h-5 text-base-content/60 hover:text-base-content"
                aria-label="Hjælp"
              />
            </button>
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="tooltip tooltip-bottom"
              data-tip="Rediger Basisoplysninger"
              aria-label="Rediger Basisoplysninger"
              onClick={() => {
                // Open this card for editing, close others and reset form state from profile to avoid cross-card stale edits
                setEditingCard(prev => prev === 'basic' ? null : 'basic');
                if (profile) {
                  const mapped = mapProfileDtoToProfile(profile);
                  setForm(mapped);
                  setLocation(profile.basicInfo?.location ?? "");
                  const dob = profile.basicInfo?.dateOfBirth as unknown as Date | undefined;
                  setDateOfBirthInput(dob instanceof Date && !Number.isNaN(dob.getTime())
                    ? `${dob.getFullYear()}-${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob.getDate().toString().padStart(2, '0')}`
                    : "");
                  setKeywordsInput((mapped.keywords || []).join(', '));
                }
              }}
            >
              {/* Pencil Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 hover:text-warning">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="firstName">Fornavn</label>
            {editingCard === 'basic' ? (
              <>
                <input
                  className="input input-bordered validator w-full"
                  id="firstName"
                  name="firstName"
                  value={form?.basicInfo?.firstName ?? ""}
                  onChange={handleBasicInfoChange}
                  placeholder="Indtast fornavn"
                  required
                  minLength={2}
                  pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
                  title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
                />
                <p className="validator-hint">
                  Mindst 2 bogstaver. Tilladte tegn: bogstaver, mellemrum, bindestreg og apostrof.
                </p>
              </>
            ) : (
              <div>{profile?.basicInfo?.firstName?.trim() ? profile.basicInfo.firstName : <span className="text-gray-400">Ikke angivet</span>}</div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="lastName">Efternavn</label>
            {editingCard === 'basic' ? (
              <>
                <input
                  className="input input-bordered validator w-full"
                  id="lastName"
                  name="lastName"
                  value={form?.basicInfo?.lastName ?? ""}
                  onChange={handleBasicInfoChange}
                  placeholder="Indtast efternavn"
                  required
                  minLength={2}
                  pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
                  title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
                />
                <p className="validator-hint">
                  Mindst 2 bogstaver. Tilladte tegn: bogstaver, mellemrum, bindestreg og apostrof.
                </p>
              </>
            ) : (
              <div>{profile?.basicInfo?.lastName?.trim() ? profile.basicInfo.lastName : <span className="text-gray-400">Ikke angivet</span>}</div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="location">By</label>
            {editingCard === 'basic' ? (
              <LocationTypeahead
                value={location}
                onChange={val => {
                  setLocation(val);
                  if (form) setForm(f => f ? { ...f, basicInfo: { ...f.basicInfo, location: val } } : f);
                }}
                inputProps={{
                  name: "location",
                  id: "location",
                  pattern: "^[A-Za-zÀ-ÿ' .-]{2,}$",
                  title: "Brug mindst 2 tegn. Tilladte tegn: bogstaver, mellemrum, punktum, bindestreg og apostrof.",
                  className: "input validator w-full"
                }}
              />
            ) : <div>{profile?.basicInfo?.location?.trim() ? profile.basicInfo.location : <span className="text-gray-400">Ikke angivet</span>}</div>}
          </div>
          <div>
            <label className="label" htmlFor="jobTitle">Jobtitel</label>
            {editingCard === 'basic' ? (
              <>
                <input
                  className="input input-bordered validator w-full"
                  id="jobTitle"
                  name="jobTitle"
                  value={form?.basicInfo?.jobTitle ?? ""}
                  onChange={handleBasicInfoChange}
                  placeholder="Jobtitel"
                  pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$"
                  title="Mindst 2 tegn. Tilladte tegn: bogstaver, tal, mellemrum, punktum, komma, bindestreg og apostrof."
                />
                <div className="validator-hint">Mindst 2 tegn, fx "Softwareudvikler"</div>
              </>
            ) : (
              <div>{profile?.basicInfo?.jobTitle?.trim() ? profile.basicInfo.jobTitle : <span className="text-gray-400">Ikke angivet</span>}</div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="company">Virksomhed</label>
            {editingCard === 'basic' ? (
              <>
                <input
                  className="input input-bordered validator w-full"
                  id="company"
                  name="company"
                  value={form?.basicInfo?.company ?? ""}
                  onChange={handleBasicInfoChange}
                  placeholder="Virksomhed"
                  pattern="^[A-Za-zÀ-ÿ0-9' .,-]{2,}$"
                  title="Mindst 2 tegn. Tilladte tegn: bogstaver, tal, mellemrum, punktum, komma, bindestreg og apostrof."
                />
                <div className="validator-hint">Mindst 2 tegn, fx "FindJob.nu"</div>
              </>
            ) : (
              <div>{profile?.basicInfo?.company?.trim() ? profile.basicInfo.company : <span className="text-gray-400">Ikke angivet</span>}</div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="phoneNumber">Telefonnummer</label>
            {editingCard === 'basic' ? (
              <>
                <input
                  className="input input-bordered validator w-full"
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form?.basicInfo?.phoneNumber ?? ""}
                  onChange={handleBasicInfoChange}
                  placeholder="Indtast telefonnummer"
                  pattern="^[+()0-9\s-]{6,20}$"
                  title="Indtast et gyldigt telefonnummer (6-20 tegn, tal, mellemrum, +, (), -)."
                />
                <p className="validator-hint">Gyldigt telefonnummer, f.eks. +45 12 34 56 78</p>
              </>
            ) : (
              <div>{profile?.basicInfo?.phoneNumber?.trim() ? profile.basicInfo.phoneNumber : <span className="text-gray-400">Ikke angivet</span>}</div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="openToWork">Aktivt søgende?</label>
            {editingCard === 'basic' ? (
              <div className="flex items-center gap-3">
                <input
                  id="openToWork"
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={!!form?.basicInfo?.openToWork}
                  onChange={(e) => form && setForm({ ...form, basicInfo: { ...form.basicInfo, openToWork: e.target.checked } })}
                />
                <span className="text-sm text-base-content/70">Vis at du er åben for nye muligheder</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  id="openToWork"
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={!!profile?.basicInfo?.openToWork}
                  readOnly
                  disabled
                />
                <span className={`text-sm ${profile?.basicInfo?.openToWork ? 'text-success' : 'text-base-content/70'}`}>
                  {profile?.basicInfo?.openToWork ? 'Aktivt søgende.' : 'Ikke aktivt søgende.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {editingCard === 'basic' && (
          <div className="mt-4 flex gap-2">
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button
              className="btn btn-outline btn-error"
              onClick={() => {
                setEditingCard(null);
                setForm(profile ? mapProfileDtoToProfile(profile) : null);
                setLocation(profile?.basicInfo?.location ?? "");
                setDateOfBirthInput(profile?.basicInfo?.dateOfBirth ? `${(profile.basicInfo.dateOfBirth as unknown as Date).getFullYear()}-${(((profile.basicInfo.dateOfBirth as unknown as Date).getMonth() + 1).toString().padStart(2, '0'))}-${((profile.basicInfo.dateOfBirth as unknown as Date).getDate().toString().padStart(2, '0'))}` : "");
                setKeywordsInput(profile?.keywords?.join(', ') ?? "");
              }}
            >
              Annuller
            </button>
          </div>
        )}
      </div>

  {/* <div className="divider my-4" /> */}

      {/* Card 2: Om mig + Nøgleord */}
  <div className="card bg-base-100 shadow rounded-lg p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title">Om mig & Nøgleord</h3>
          <button
            type="button"
            className="tooltip tooltip-bottom"
            data-tip="Rediger Om mig & Nøgleord"
            aria-label="Rediger Om mig og Nøgleord"
            onClick={() => {
              setEditingCard(prev => prev === 'about' ? null : 'about');
              if (profile) {
                const mapped = mapProfileDtoToProfile(profile);
                setForm(mapped);
                setKeywordsInput((mapped.keywords || []).join(', '));
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 hover:text-warning">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="label" htmlFor="about">Om mig</label>
            {editingCard === 'about' ? (
              <>
                <textarea
                  className="textarea textarea-bordered validator w-full"
                  id="about"
                  name="about"
                  value={form?.basicInfo?.about ?? ""}
                  onChange={handleBasicInfoChange}
                  placeholder="Kort beskrivelse"
                  rows={4}
                  maxLength={1000}
                  title="Maks 1000 tegn."
                />
                <div className="validator-hint">Maks 1000 tegn</div>
              </>
            ) : (
              <div>{profile?.basicInfo?.about?.trim() ? profile.basicInfo.about : <span className="text-gray-400">Ikke angivet</span>}</div>
            )}
          </div>
          <div className="divider my-1" />
          <div>
            <label className="label" htmlFor="keywords">Top kompetencer{" "}
              <button
              type="button"
              className="tooltip tooltip-left"
              data-tip="Dine top kompetencer anvendes i højere grad end andre informationer, når vi udsøger anbefalede job."
              aria-label="Hjælp til Min Profil"
            >
              <QuestionMarkCircleIcon
                className="w-5 h-5 text-base-content/60 hover:text-base-content"
                aria-label="Hjælp"
              />
            </button>
            </label>
            {editingCard === 'about' ? (
              <>
                <input
                  className="input input-bordered validator w-full"
                  id="keywords"
                  name="keywords"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="f.eks. React, TypeScript, .NET, Azure"
                />
                <div className="validator-hint">Adskil med komma. Eksempel: React, TypeScript, .NET</div>
              </>
            ) : (
              <div>
                {(form?.keywords && form.keywords.length > 0)
                  ? form.keywords.join(', ')
                  : <span className="text-gray-400">Ikke angivet</span>}
              </div>
            )}
          </div>
        </div>

        {editingCard === 'about' && (
          <div className="mt-4 flex gap-2">
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button
              className="btn btn-outline btn-error"
              onClick={() => {
                setEditingCard(null);
                setForm(profile ? mapProfileDtoToProfile(profile) : null);
                setKeywordsInput(profile?.keywords?.join(', ') ?? "");
              }}
            >
              Annuller
            </button>
          </div>
        )}
      </div>

  {/* <div className="divider my-4" /> */}

      {/* Card 3a: Erfaringer */}
  <div className="card bg-base-100 shadow rounded-lg p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title">Erfaringer</h3>
          <button
            type="button"
            className="tooltip tooltip-bottom"
            data-tip="Rediger Erfaringer"
            aria-label="Rediger Erfaringer"
            onClick={() => {
              setEditingCard(prev => prev === 'experiences' ? null : 'experiences');
              if (profile) {
                const mapped = mapProfileDtoToProfile(profile);
                setForm(mapped);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 hover:text-warning">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
        </div>
        {renderExperiencesSection()}
        {editingCard === 'experiences' && (
          <div className="mt-4 flex gap-2">
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button
              className="btn btn-outline btn-error"
              onClick={() => {
                setEditingCard(null);
                setForm(profile ? mapProfileDtoToProfile(profile) : null);
              }}
            >
              Annuller
            </button>
          </div>
        )}
      </div>

  {/* <div className="divider my-4" /> */}

      {/* Card 3b: Uddannelser */}
      <div className="card bg-base-100 shadow p-6 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title">Uddannelser</h3>
          <button
            type="button"
            className="tooltip tooltip-bottom"
            data-tip="Rediger Uddannelser"
            aria-label="Rediger Uddannelser"
            onClick={() => {
              setEditingCard(prev => prev === 'educations' ? null : 'educations');
              if (profile) {
                const mapped = mapProfileDtoToProfile(profile);
                setForm(mapped);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 hover:text-warning">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
        </div>
        {renderEducationsSection()}
        {editingCard === 'educations' && (
          <div className="mt-4 flex gap-2">
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button
              className="btn btn-outline btn-error"
              onClick={() => {
                setEditingCard(null);
                setForm(profile ? mapProfileDtoToProfile(profile) : null);
              }}
            >
              Annuller
            </button>
          </div>
        )}
      </div>

  {/* <div className="divider my-4" /> */}

      {/* Card 3c: Færdigheder */}
  <div className="card bg-base-100 shadow rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title">Færdigheder</h3>
          <button
            type="button"
            className="tooltip tooltip-bottom"
            data-tip="Rediger Færdigheder"
            aria-label="Rediger Færdigheder"
            onClick={() => {
              setEditingCard(prev => prev === 'skills' ? null : 'skills');
              if (profile) {
                const mapped = mapProfileDtoToProfile(profile);
                setForm(mapped);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 hover:text-warning">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
        </div>
        {renderSkillsSection()}
        {editingCard === 'skills' && (
          <div className="mt-4 flex gap-2">
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button
              className="btn btn-outline btn-error"
              onClick={() => {
                setEditingCard(null);
                setForm(profile ? mapProfileDtoToProfile(profile) : null);
              }}
            >
              Annuller
            </button>
          </div>
        )}
      </div>

      {/* Toast confirmation */}
      {toast && (
        <div className="toast toast-end z-50">
          <div className="alert alert-success">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileComponent;