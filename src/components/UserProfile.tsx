// Helper to convert ProfileDto to Profile (for editing/updating)
function mapProfileDtoToProfile(dto: ProfileDto): Profile {
  return {
    id: dto.id,
    userId: dto.userId ?? '',
    lastUpdatedAt: dto.lastUpdatedAt,
    createdAt: dto.createdAt,
    savedJobPosts: dto.savedJobPosts ?? [],
    keywords: dto.keywords ?? [],
    basicInfo: dto.basicInfo as any, // Assume compatible, or add mapping if needed
    experiences: dto.experiences as any,
    educations: dto.educations as any,
    interests: dto.interests as any,
    accomplishments: dto.accomplishments as any,
    contacts: dto.contacts as any,
    skills: dto.skills as any,
  };
}
import React, { useEffect, useRef, useState } from "react";

// Add DateInput component for better validation UX
const DateInput: React.FC<{ value: string; onChange: (v: string) => void; inputRef?: React.RefObject<HTMLInputElement> }> = ({ value, onChange, inputRef }) => {
  const [touched, setTouched] = useState(false);
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return (
    <>
      <input
        className={`input input-bordered validator w-full${touched && !isValid ? " input-error" : ""}`}
        id="dateOfBirth"
        name="dateOfBirth"
        type="text"
        ref={inputRef}
        value={value}
        onChange={e => { onChange(e.target.value); if (!touched) setTouched(true); }}
        onBlur={() => setTouched(true)}
        placeholder="Vælg fødselsdato"
        autoComplete="off"
        pattern="^\\d{4}-\\d{2}-\\d{2}$"
        title="Brug formatet ÅÅÅÅ-MM-DD (f.eks. 1990-05-21)."
      />
      {touched && !isValid && (
        <div className="text-error text-xs mt-1">Brug formatet ÅÅÅÅ-MM-DD (f.eks. 1990-05-21).</div>
      )}
    </>
  );
};
import LocationTypeahead from "./LocationTypeahead";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext";
import { ProfileApi } from "../findjobnu-api";
import type { Profile } from "../findjobnu-api/models/Profile";
import type { ProfileDto } from "../findjobnu-api/models/ProfileDto";
import type { Experience } from "../findjobnu-api/models/Experience";
import type { Education } from "../findjobnu-api/models/Education";
import type { Skill } from "../findjobnu-api/models/Skill";
import WorkExperienceList from "./WorkExperienceList";
import EducationList from "./EducationList";
import SkillList from "./SkillList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient } from "../helpers/ApiFactory";

interface Props { userId: string; }

const UserProfileComponent: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateOfBirthInput, setDateOfBirthInput] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  // LocationTypeahead handles suggestions
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayRef = useRef<Pikaday | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const token = user?.accessToken;

  // Date picker setup
  useEffect(() => {
    if (editMode && dateInputRef.current) {
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
  }, [editMode, dateOfBirthInput]);

  // Fetch profile
  useEffect(() => {
    const api = createApiClient(ProfileApi, token);
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data: ProfileDto = await api.getProfileByUserId({ userId });
        if (cancelled) return;
        const mapped = mapProfileDtoToProfile(data);
        setProfile(data); setForm(mapped);
        if (data.basicInfo?.dateOfBirth instanceof Date && !isNaN(data.basicInfo.dateOfBirth.getTime())) {
          const d = data.basicInfo.dateOfBirth;
          setDateOfBirthInput(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`);
        }
        setLocation(data.basicInfo?.location ?? "");
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
      const toSave: Profile = { ...form, basicInfo: { ...form.basicInfo, dateOfBirth: dateOfBirthInput ? new Date(dateOfBirthInput) : null, location } }; // Profile is used for saving
      await api.updateProfile({ id: form.id, profile: toSave });
      setProfile(toSave); setForm(toSave); setEditMode(false);
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
      const created = await api.createProfile({ profile: newProfile });
      setProfile(created); setForm(created); setEditMode(true);
    } catch (e) { const err = await handleApiError(e); setError(err.message); }
    finally { setLoading(false); }
  };

  // Derived UI content to avoid nested ternaries in JSX
  const dobDate = profile?.basicInfo?.dateOfBirth as unknown as Date | undefined;
  const dobDisplay = dobDate instanceof Date && !isNaN(dobDate.getTime())
    ? `${dobDate.getDate().toString().padStart(2, '0')}-${(dobDate.getMonth() + 1).toString().padStart(2, '0')}-${dobDate.getFullYear()}`
    : null;

  const renderExperiencesSection = () => {
    if (editMode) {
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
    if (editMode) {
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
    if (editMode) {
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

  if (loading) return <div className="card bg-base-100 shadow p-6 w-full h-fit"><div className="text-center py-8">Indlæser profil...</div></div>;

  if (error || profile === null) {
    return (
      <div className="card bg-base-100 shadow p-6 w-full h-fit">
        <div className="text-center py-8">
          Ingen profil fundet.<br />
          <button className="btn btn-primary mt-4" onClick={handleCreateProfile}>Opret profil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow p-6 w-full h-fit" ref={containerRef}>
      <h2 className="card-title mb-4 flex items-center gap-2">
        <span>Min Profil</span>
        <button
          type="button"
          className="tooltip tooltip-right"
          data-tip="Vi bruger dine informationer til at finde relevante job annoncer i bla. 'Anbefalede job'. Vi videregiver aldrig dine oplysninger til tredjeparter."
          aria-label="Hjælp til Min Profil"
        >
          <QuestionMarkCircleIcon
            className="w-5 h-5 text-base-content/60 hover:text-base-content"
            aria-label="Hjælp"
          />
        </button>
      </h2> 
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">Fornavn</label>
          {editMode ? (
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
          {editMode ? (
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
          <label className="label" htmlFor="phoneNumber">Telefonnummer</label>
          {editMode ? (
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
          <label className="label" htmlFor="location">By</label>
          {editMode ? (
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
          <label className="label" htmlFor="dateOfBirth">Fødselsdato</label>
          {editMode ? (
            <DateInput
              value={dateOfBirthInput}
              onChange={setDateOfBirthInput}
              inputRef={dateInputRef as React.RefObject<HTMLInputElement>}
            />
          ) : (
            <div>{dobDisplay ?? <span className="text-gray-400">Ikke angivet</span>}</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="about">Om mig</label>
          {editMode ? (
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
        <div>
          <label className="label" htmlFor="company">Virksomhed</label>
          {editMode ? (
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
          <label className="label" htmlFor="jobTitle">Jobtitel</label>
          {editMode ? (
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
          <label className="label" htmlFor="openToWork">Aktivt søgende?</label>
          {editMode ? (
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
      <div className="mt-8 grid gap-6">
        <div>
          <div className="label"><span className="label-text font-semibold">Erfaringer</span></div>
          {renderExperiencesSection()}
        </div>
        <div>
          <div className="label"><span className="label-text font-semibold">Uddannelser</span></div>
          {renderEducationsSection()}
        </div>
        <div>
          <div className="label"><span className="label-text font-semibold">Færdigheder</span></div>
          {renderSkillsSection()}
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {editMode ? (
          <>
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button className="btn btn-outline btn-error" onClick={() => { setEditMode(false); setForm(profile ? mapProfileDtoToProfile(profile) : null); setLocation(profile?.basicInfo?.location ?? ""); setDateOfBirthInput(profile?.basicInfo?.dateOfBirth ? `${profile.basicInfo.dateOfBirth.getFullYear()}-${(profile.basicInfo.dateOfBirth.getMonth() + 1).toString().padStart(2, '0')}-${profile.basicInfo.dateOfBirth.getDate().toString().padStart(2, '0')}` : ""); }}>Annuller</button>
          </>
        ) : (
          <button className="btn btn-outline btn-warning" onClick={() => setEditMode(true)}>Rediger</button>
        )}
      </div>
    </div>
  );
};

export default UserProfileComponent;