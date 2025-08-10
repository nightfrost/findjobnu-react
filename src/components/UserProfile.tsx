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
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { useUser } from "../context/UserContext";
import { ProfileApi, CitiesApi, type Cities } from "../findjobnu-api";
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
  const [citySuggestions, setCitySuggestions] = useState<Cities[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const pikadayRef = useRef<Pikaday | null>(null);
  const { user } = useUser();
  const token = user?.accessToken;

  // Date picker setup
  useEffect(() => {
    if (editMode && dateInputRef.current) {
      if (!pikadayRef.current) {
        pikadayRef.current = new Pikaday({
          field: dateInputRef.current,
          format: "YYYY-MM-DD",
          minDate: new Date(1900, 0, 1),
          yearRange: [1900, new Date().getFullYear()]
        });
      }
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

  const handleLocationFocus = async () => {
    const citiesApi = createApiClient(CitiesApi);
    if (!location) {
      try { const results = await citiesApi.getAllCities(); setCitySuggestions(results ?? []); setShowSuggestions(true); }
      catch { setCitySuggestions([]); }
    } else { setShowSuggestions(true); }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const citiesApi = createApiClient(CitiesApi);
    const value = e.target.value; setLocation(value);
    if (!form) return;
    setForm(f => f ? { ...f, basicInfo: { ...f.basicInfo, location: value } } : f);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length > 0) {
      timeoutRef.current = setTimeout(async () => {
        try { const results = await citiesApi.getCitiesByQuery({ query: value }); setCitySuggestions(results ?? []); setShowSuggestions(true); }
        catch { setCitySuggestions([]); }
      }, 300);
    } else {
      (async () => { try { const results = await citiesApi.getAllCities(); setCitySuggestions(results ?? []); setShowSuggestions(true); } catch { setCitySuggestions([]); } })();
    }
  };

  const handleSuggestionClick = (city: Cities) => {
    setLocation(city.cityName ?? "");
    setForm(f => f ? { ...f, basicInfo: { ...f.basicInfo, location: city.cityName ?? "" } } : f);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!form?.id) return;
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
    <div className="card bg-base-100 shadow p-6 w-full h-fit">
      <h2 className="card-title mb-4">Min Profil</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">Fornavn</label>
          {editMode ? <input className="input input-bordered w-full" id="firstName" name="firstName" value={form?.basicInfo?.firstName ?? ""} onChange={handleBasicInfoChange} placeholder="Indtast fornavn" /> : <div>{profile?.basicInfo?.firstName?.trim() ? profile.basicInfo.firstName : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div>
          <label className="label" htmlFor="lastName">Efternavn</label>
          {editMode ? <input className="input input-bordered w-full" id="lastName" name="lastName" value={form?.basicInfo?.lastName ?? ""} onChange={handleBasicInfoChange} placeholder="Indtast efternavn" /> : <div>{profile?.basicInfo?.lastName?.trim() ? profile.basicInfo.lastName : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div>
          <label className="label" htmlFor="phoneNumber">Telefonnummer</label>
          {editMode ? <input className="input input-bordered w-full" id="phoneNumber" name="phoneNumber" value={form?.basicInfo?.phoneNumber ?? ""} onChange={handleBasicInfoChange} placeholder="Indtast telefonnummer" /> : <div>{profile?.basicInfo?.phoneNumber?.trim() ? profile.basicInfo.phoneNumber : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div>
          <label className="label" htmlFor="location">By</label>
          {editMode ? (
            <div className="relative flex-1" tabIndex={-1} onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} onFocus={() => showSuggestions && setShowSuggestions(true)}>
              <input className="select select-bordered w-full" placeholder="By" name="location" id="location" value={location} onChange={handleLocationChange} onFocus={handleLocationFocus} autoComplete="off" />
              {showSuggestions && citySuggestions.length > 0 && (
                <ul className="menu-vertical absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-40 overflow-y-auto shadow-lg rounded-box p-0">
                  {citySuggestions.map(city => (
                    <li key={city.id}><button type="button" className="menu-item text px-3 py-2 hover:bg-base-200 w-full text-left" onClick={() => handleSuggestionClick(city)}>{city.cityName}</button></li>
                  ))}
                </ul>
              )}
            </div>
          ) : <div>{profile?.basicInfo?.location?.trim() ? profile.basicInfo.location : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div>
          <label className="label" htmlFor="dateOfBirth">Fødselsdato</label>
          {editMode ? <input className="input input-bordered w-full" id="dateOfBirth" name="dateOfBirth" type="text" ref={dateInputRef} value={dateOfBirthInput} onChange={e => setDateOfBirthInput(e.target.value)} placeholder="Vælg fødselsdato" autoComplete="off" /> : <div>{profile?.basicInfo?.dateOfBirth ? (profile.basicInfo.dateOfBirth instanceof Date && !isNaN(profile.basicInfo.dateOfBirth.getTime()) ? `${profile.basicInfo.dateOfBirth.getDate().toString().padStart(2, '0')}-${(profile.basicInfo.dateOfBirth.getMonth() + 1).toString().padStart(2, '0')}-${profile.basicInfo.dateOfBirth.getFullYear()}` : <span className="text-gray-400">Ikke angivet</span>) : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="about">Om mig</label>
          {editMode ? <textarea className="textarea textarea-bordered w-full" id="about" name="about" value={form?.basicInfo?.about ?? ""} onChange={handleBasicInfoChange} placeholder="Kort beskrivelse" rows={4} /> : <div>{profile?.basicInfo?.about?.trim() ? profile.basicInfo.about : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div>
          <label className="label" htmlFor="company">Virksomhed</label>
          {editMode ? <input className="input input-bordered w-full" id="company" name="company" value={form?.basicInfo?.company ?? ""} onChange={handleBasicInfoChange} placeholder="Virksomhed" /> : <div>{profile?.basicInfo?.company?.trim() ? profile.basicInfo.company : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
        <div>
          <label className="label" htmlFor="jobTitle">Jobtitel</label>
          {editMode ? <input className="input input-bordered w-full" id="jobTitle" name="jobTitle" value={form?.basicInfo?.jobTitle ?? ""} onChange={handleBasicInfoChange} placeholder="Jobtitel" /> : <div>{profile?.basicInfo?.jobTitle?.trim() ? profile.basicInfo.jobTitle : <span className="text-gray-400">Ikke angivet</span>}</div>}
        </div>
      </div>
      <div className="mt-8 grid gap-6">
        <div>
          <div className="label"><span className="label-text font-semibold">Erfaringer</span></div>
          {editMode ? (
            <WorkExperienceList experiences={form?.experiences || []} onAdd={(exp: Experience) => form && setForm({ ...form, experiences: [...(form.experiences || []), exp] })} onUpdate={(exp: Experience) => form && setForm({ ...form, experiences: (form.experiences || []).map(e => e.id === exp.id ? exp : e) })} onDelete={(id: number) => form && setForm({ ...form, experiences: (form.experiences || []).filter(e => e.id !== id) })} readOnly={false} />
          ) : (!form?.experiences || form.experiences.length === 0) ? (
            <div className="mt-1 text-gray-400">Ikke angivet</div>
          ) : (
            <WorkExperienceList
              experiences={form.experiences}
              onAdd={() => { }}
              onUpdate={() => { }}
              onDelete={() => { }}
              readOnly={true}
            />
          )}
        </div>
        <div>
          <div className="label"><span className="label-text font-semibold">Uddannelser</span></div>
          {editMode ? (
            <EducationList educations={form?.educations || []} onAdd={(edu: Education) => form && setForm({ ...form, educations: [...(form.educations || []), edu] })} onUpdate={(edu: Education) => form && setForm({ ...form, educations: (form.educations || []).map(e => e.id === edu.id ? edu : e) })} onDelete={(id: number) => form && setForm({ ...form, educations: (form.educations || []).filter(e => e.id !== id) })} readOnly={false} />
          ) : (!form?.educations || form.educations.length === 0) ? (
            <div className="mt-1 text-gray-400">Ikke angivet</div>
          ) : (
            <EducationList
              educations={form.educations}
              onAdd={() => { }}
              onUpdate={() => { }}
              onDelete={() => { }}
              readOnly={true}
            />
          )}
        </div>
        <div>
          <div className="label"><span className="label-text font-semibold">Færdigheder</span></div>
          {editMode ? (
            <SkillList skills={form?.skills || []} onAdd={(skill: Skill) => form && setForm({ ...form, skills: [...(form.skills || []), skill] })} onUpdate={(skill: Skill) => form && setForm({ ...form, skills: (form.skills || []).map(s => s.id === skill.id ? skill : s) })} onDelete={(id: number) => form && setForm({ ...form, skills: (form.skills || []).filter(s => s.id !== id) })} readOnly={false} />
          ) : (!form?.skills || form.skills.length === 0) ? (
            <div className="mt-1 text-gray-400">Ikke angivet</div>
          ) : (
            <SkillList
              skills={form.skills}
              onAdd={() => { }}
              onUpdate={() => { }}
              onDelete={() => { }}
              readOnly={true}
            />
          )}
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