import React, { useCallback, useEffect, useRef, useState } from "react";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { useUser } from "../context/UserContext.shared";
import { ProfileApi } from "../findjobnu-api";
import type { Profile } from "../findjobnu-api/models/Profile";
import type { Experience } from "../findjobnu-api/models/Experience";
import type { Education } from "../findjobnu-api/models/Education";
import type { Skill } from "../findjobnu-api/models/Skill";
import type { ProfileDto } from "../findjobnu-api/models/ProfileDto";
import ProfileSkeleton from "./ProfileSkeleton";
import BasicInfoCard from "./userProfile/BasicInfoCard";
import AboutKeywordsCard from "./userProfile/AboutKeywordsCard";
import ExperiencesCard from "./userProfile/ExperiencesCard";
import EducationsCard from "./userProfile/EducationsCard";
import SkillsCard from "./userProfile/SkillsCard";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient, createProfileSimple } from "../helpers/ApiFactory";
import { mapProfileDtoToProfile, mapProfileToUpdateRequest } from "../helpers/mappers";
import { formatDateForDisplay, toApiDateString, toDateFromInput } from "../helpers/date";

interface Props { userId: string; refreshKey?: number; }

type EditingCard = 'basic' | 'about' | 'experiences' | 'educations' | 'skills' | null;

const UserProfileComponent: React.FC<Props> = ({ userId, refreshKey }) => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
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
  const [detailsTab, setDetailsTab] = useState<"experiences" | "educations" | "skills">("experiences");

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

  const applyProfileState = useCallback((dto: ProfileDto | null) => {
    if (!dto) {
      setProfile(null);
      setForm(null);
      setDateOfBirthInput("");
      setLocation("");
      setKeywordsInput("");
      return;
    }

    const mapped = mapProfileDtoToProfile(dto);
    setProfile(dto);
    setForm(mapped);
    setDateOfBirthInput(formatDateForDisplay(mapped.basicInfo.dateOfBirth));
    setLocation(mapped.basicInfo.location ?? "");
    setKeywordsInput((mapped.keywords ?? []).join(", "));
  }, []);

  // Date picker setup
  useEffect(() => {
    if (editingCard === 'basic' && dateInputRef.current) {
      pikadayRef.current ??= new Pikaday({
        field: dateInputRef.current,
        format: "DD/MM/YYYY",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()],
        onSelect: (d: Date) => setDateOfBirthInput(formatDateForDisplay(d)),
      });
      if (dateOfBirthInput) {
        const parsed = toDateFromInput(dateOfBirthInput);
        if (parsed) pikadayRef.current.setDate(parsed, true);
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
        const data = await api.getProfileByUserId({ userId });
        if (cancelled) return;
        applyProfileState(data);
      } catch (e) {
        const err = await handleApiError(e);
        if (err.type !== "not_found") setError(err.message);
        applyProfileState(null);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId, token, applyProfileState, refreshKey]);

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
      const trimOrNull = (value?: string | null): string | null => {
        if (value == null) return null;
        const trimmed = value.trim();
        return trimmed.length === 0 ? null : trimmed;
      };

      const normalizeDateString = (value?: string | null): string | null => {
        const trimmed = trimOrNull(value);
        if (!trimmed) return null;
        return toApiDateString(trimmed) ?? trimmed;
      };
      const parsedKeywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      const dateValue = dateOfBirthInput ? toDateFromInput(dateOfBirthInput) : null;
      const normalizedDob = dateValue && !Number.isNaN(dateValue.getTime()) ? dateValue : null;
      const updatedProfile: Profile = {
        ...form,
        keywords: parsedKeywords,
        experiences: (form.experiences || []).map(exp => ({
          ...exp,
          fromDate: normalizeDateString(exp.fromDate),
          toDate: normalizeDateString(exp.toDate),
        })),
        educations: (form.educations || []).map(edu => ({
          ...edu,
          fromDate: normalizeDateString(edu.fromDate),
          toDate: normalizeDateString(edu.toDate),
        })),
        basicInfo: {
          ...form.basicInfo,
          dateOfBirth: normalizedDob,
          location,
        },
      };

      const updateRequest = mapProfileToUpdateRequest(updatedProfile);
      await api.updateProfile({ id: form.id, profileUpdateRequest: updateRequest });
      const refreshed = await api.getProfileByUserId({ userId });
      applyProfileState(refreshed);
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
  applyProfileState(fresh);
  setEditingCard('basic');
  showToast('Profil oprettet');
    } catch (e) { const err = await handleApiError(e); setError(err.message); }
    finally { setLoading(false); }
  };

  const populateFormFromExistingProfile = (card: NonNullable<EditingCard>) => {
    if (!profile) return;
    const mapped = mapProfileDtoToProfile(profile);
    setForm(mapped);
    if (card === "basic") {
      setLocation(mapped.basicInfo.location ?? "");
      setDateOfBirthInput(formatDateForDisplay(mapped.basicInfo.dateOfBirth));
      setKeywordsInput((mapped.keywords ?? []).join(", "));
    }
    if (card === "about") {
      setKeywordsInput((mapped.keywords ?? []).join(", "));
    }
  };

  const updateFormState = (updater: (prev: Profile) => Profile) => {
    setForm((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    updateFormState((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, location: value },
    }));
  };

  const handleToggleOpenToWork = (checked: boolean) => {
    updateFormState((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, openToWork: checked },
    }));
  };

  const handleExperienceAdd = (experience: Experience) => {
    updateFormState((prev) => ({
      ...prev,
      experiences: [...(prev.experiences ?? []), experience],
    }));
  };

  const handleExperienceUpdate = (experience: Experience) => {
    updateFormState((prev) => ({
      ...prev,
      experiences: (prev.experiences ?? []).map((existing) =>
        existing.id === experience.id ? experience : existing
      ),
    }));
  };

  const handleExperienceDelete = (experienceId: number) => {
    updateFormState((prev) => ({
      ...prev,
      experiences: (prev.experiences ?? []).filter((existing) => existing.id !== experienceId),
    }));
  };

  const handleEducationAdd = (education: Education) => {
    updateFormState((prev) => ({
      ...prev,
      educations: [...(prev.educations ?? []), education],
    }));
  };

  const handleEducationUpdate = (education: Education) => {
    updateFormState((prev) => ({
      ...prev,
      educations: (prev.educations ?? []).map((existing) =>
        existing.id === education.id ? education : existing
      ),
    }));
  };

  const handleEducationDelete = (educationId: number) => {
    updateFormState((prev) => ({
      ...prev,
      educations: (prev.educations ?? []).filter((existing) => existing.id !== educationId),
    }));
  };

  const handleSkillAdd = (skill: Skill) => {
    updateFormState((prev) => ({
      ...prev,
      skills: [...(prev.skills ?? []), skill],
    }));
  };

  const handleSkillUpdate = (skill: Skill) => {
    updateFormState((prev) => ({
      ...prev,
      skills: (prev.skills ?? []).map((existing) => (existing.id === skill.id ? skill : existing)),
    }));
  };

  const handleSkillDelete = (skillId: number) => {
    updateFormState((prev) => ({
      ...prev,
      skills: (prev.skills ?? []).filter((existing) => existing.id !== skillId),
    }));
  };

  const beginEditingCard = (card: NonNullable<EditingCard>) => {
    populateFormFromExistingProfile(card);
    setEditingCard((prev) => (prev === card ? null : card));
  };

  const cancelEditingCard = (card: NonNullable<EditingCard>) => {
    populateFormFromExistingProfile(card);
    setEditingCard(null);
  };

  const switchDetailsTab = (tab: "experiences" | "educations" | "skills") => {
    setDetailsTab(tab);
    setEditingCard(null);
  };

  if (loading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="card bg-base-100 shadow rounded-lg p-6 w-full h-fit">
        <div className="text-center py-8 space-y-4">
          <p>{error ?? "Ingen profil fundet."}</p>
          <button className="btn btn-primary" onClick={handleCreateProfile}>
            Opret profil
          </button>
        </div>
      </div>
    );
  }

  const experiences = form?.experiences ?? [];
  const educations = form?.educations ?? [];
  const skills = form?.skills ?? [];

  return (
    <div className="w-full h-fit" ref={containerRef}>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
          <BasicInfoCard
          profile={profile}
          form={form}
          editing={editingCard === 'basic'}
          location={location}
          dateOfBirthInput={dateOfBirthInput}
          onToggleEdit={() => beginEditingCard('basic')}
          onCancel={() => cancelEditingCard('basic')}
          onSave={handleSave}
          onBasicInfoChange={handleBasicInfoChange}
          onLocationChange={handleLocationChange}
          onDateOfBirthChange={(value) => setDateOfBirthInput(value)}
          onToggleOpenToWork={handleToggleOpenToWork}
          onDateInputRef={(node) => {
            dateInputRef.current = node;
          }}
        />
        
        

        <AboutKeywordsCard
          profile={profile}
          form={form}
          editing={editingCard === 'about'}
          keywordsInput={keywordsInput}
          onToggleEdit={() => beginEditingCard('about')}
          onCancel={() => cancelEditingCard('about')}
          onSave={handleSave}
          onBasicInfoChange={handleBasicInfoChange}
          onKeywordsChange={(value) => setKeywordsInput(value)}
        />

        <div role="tablist" className="tabs tabs-box">
          <input
            type="radio"
            name="profile-details"
            role="tab"
            aria-label="Erfaringer"
            className="tab"
            checked={detailsTab === "experiences"}
            onChange={() => switchDetailsTab("experiences")}
          />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-4 md:p-6">
            <ExperiencesCard
              experiences={experiences}
              editing={editingCard === 'experiences'}
              onToggleEdit={() => beginEditingCard('experiences')}
              onCancel={() => cancelEditingCard('experiences')}
              onSave={handleSave}
              onAdd={handleExperienceAdd}
              onUpdate={handleExperienceUpdate}
              onDelete={handleExperienceDelete}
            />
          </div>

          <input
            type="radio"
            name="profile-details"
            role="tab"
            aria-label="Uddannelser"
            className="tab"
            checked={detailsTab === "educations"}
            onChange={() => switchDetailsTab("educations")}
          />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-4 md:p-6">
            <EducationsCard
              educations={educations}
              editing={editingCard === 'educations'}
              onToggleEdit={() => beginEditingCard('educations')}
              onCancel={() => cancelEditingCard('educations')}
              onSave={handleSave}
              onAdd={handleEducationAdd}
              onUpdate={handleEducationUpdate}
              onDelete={handleEducationDelete}
            />
          </div>

          <input
            type="radio"
            name="profile-details"
            role="tab"
            aria-label="Færdigheder"
            className="tab"
            checked={detailsTab === "skills"}
            onChange={() => switchDetailsTab("skills")}
          />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-4 md:p-6">
            <SkillsCard
              skills={skills}
              editing={editingCard === 'skills'}
              onToggleEdit={() => beginEditingCard('skills')}
              onCancel={() => cancelEditingCard('skills')}
              onSave={handleSave}
              onAdd={handleSkillAdd}
              onUpdate={handleSkillUpdate}
              onDelete={handleSkillDelete}
            />
          </div>
        </div>
      </div>

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