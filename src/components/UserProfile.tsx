import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { UserProfileApi, Configuration, CitiesApi, type Cities } from "../findjobnu-api";
import type { UserProfile } from "../findjobnu-api/models/UserProfile";
import { handleApiError } from "../helpers/ErrorHelper";

interface Props {
  userId: string;
}

const UserProfileComponent: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Cities[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user } = useUser();
  const token = user?.accessToken;
  
  useEffect(() => {
    const api = new UserProfileApi(
      new Configuration({
        basePath: "https://findjob.nu",
        accessToken: token ?? undefined, 
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getUserProfileByUserId(
          { userid: userId }
        );
        setProfile(data);
        setForm(data);
      } catch (e) {
        handleApiError(e).then((errorMessage) => {
          setError(errorMessage.message);
          if (errorMessage.type === "not_found") {
            setProfile(null);
          }
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationFocus = async () => {
    const citiesApi = new CitiesApi(new Configuration({ basePath: "https://findjob.nu" }));
    if (!location) {
      try {
        const results = await citiesApi.getAllCities();
        setCitySuggestions(results ?? []);
        setShowSuggestions(true);
      } catch {
        setCitySuggestions([]);
      }
    } else {
      setShowSuggestions(true);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const citiesApi = new CitiesApi(new Configuration({ basePath: "https://findjob.nu" }));
    const value = e.target.value;
    setLocation(value);
    if (!form) return;
    setForm(form => form ? { ...form, city: value ?? "" } : form); // <-- update form.city

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.length > 0) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const results = await citiesApi.getCitiesByQuery({ query: value });
          setCitySuggestions(results ?? []);
          setShowSuggestions(true);
        } catch {
          setCitySuggestions([]);
        }
      }, 300);
    } else {
      (async () => {
        try {
          const results = await citiesApi.getAllCities();
          setCitySuggestions(results ?? []);
          setShowSuggestions(true);
        } catch {
          setCitySuggestions([]);
        }
      })();
    }
  };

  const handleSuggestionClick = (city: Cities) => {
    setLocation(city.cityName ?? "");
    setForm(form => form ? { ...form, city: city.cityName ?? "" } : form); // <-- update form.city
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    const api = new UserProfileApi(
      new Configuration({
        basePath: "https://findjob.nu",
        accessToken: token ?? undefined, 
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );
    if (!form?.id) return;
    setLoading(true);
    setError(null);
    try {
      await api.updateUserProfile({ id: form.id, userProfile: form });
      setProfile(form);
      setEditMode(false);
    } catch (e) {
      handleApiError(e).then((errorMessage) => {
          setError(errorMessage.message);
        });
    }
    setLoading(false);
  };

  const handleCreateProfile = async () => {
    const api = new UserProfileApi(
      new Configuration({
        basePath: "https://findjob.nu",
        accessToken: token ?? undefined, 
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );
    setLoading(true);
    setError(null);
    try {
      const newProfile: UserProfile = {
        id: undefined,
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: null,
        userId: userId,
        city: "",
      };
      const created = await api.createUserProfile({ userProfile: newProfile });
      setProfile(created);
      setForm(created);
      setEditMode(true);
    } catch (e) {
      handleApiError(e).then((errorMessage) => {
        setError(errorMessage.message);
      });
    }
    setLoading(false);
  };

  if (loading) return <div className="card bg-base-100 shadow p-6 w-full h-fit"><div className="text-center py-8">Indlæser profil...</div></div>;

  if (error || profile === null) {
    return (
      <div className="card bg-base-100 shadow p-6 w-full h-fit">
        <div className="text-center py-8">
          Ingen profil fundet.<br />
          <button className="btn btn-primary mt-4" onClick={handleCreateProfile}>
            Opret profil
          </button>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="card bg-base-100 shadow p-6 w-full h-fit">
      <h2 className="card-title mb-4">Min Profil</h2>
      <div className="grid gap-4">
        <div>
          <label className="label" htmlFor="firstName">Fornavn</label>
          {editMode ? (
            <input
              className="input input-bordered w-full"
              id="firstName"
              name="firstName"
              value={form?.firstName ?? ""}
              onChange={handleChange}
              placeholder="Indtast fornavn"
              title="Fornavn"
            />
          ) : (
            <div>
              {profile.firstName && profile.firstName.trim() !== ""
                ? profile.firstName
                : <span className="text-gray-400">Ikke angivet</span>}
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="lastName">Efternavn</label>
          {editMode ? (
            <input
              className="input input-bordered w-full"
              id="lastName"
              name="lastName"
              value={form?.lastName ?? ""}
              onChange={handleChange}
              placeholder="Indtast efternavn"
              title="Efternavn"
            />
          ) : (
            <div>
              {profile.lastName && profile.lastName.trim() !== ""
                ? profile.lastName
                : <span className="text-gray-400">Ikke angivet</span>}
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="phoneNumber">Telefonnummer</label>
          {editMode ? (
            <input
              className="input input-bordered w-full"
              id="phoneNumber"
              name="phoneNumber"
              value={form?.phoneNumber ?? ""}
              onChange={handleChange}
              placeholder="Indtast telefonnummer"
              title="Telefonnummer"
            />
          ) : (
            <div>
              {profile.phoneNumber && profile.phoneNumber.trim() !== ""
                ? profile.phoneNumber
                : <span className="text-gray-400">Ikke angivet</span>}
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="address">Adresse</label>
          {editMode ? (
            <input
              className="input input-bordered w-full"
              id="address"
              name="address"
              value={form?.address ?? ""}
              onChange={handleChange}
              placeholder="Indtast adresse"
              title="Adresse"
            />
          ) : (
            <div>
              {profile.address && profile.address.trim() !== ""
                ? profile.address
                : <span className="text-gray-400">Ikke angivet</span>}
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="City">By</label>
          {editMode ? (
            <div
      className="relative flex-1"
      tabIndex={-1}
      onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      onFocus={() => showSuggestions && setShowSuggestions(true)}
    >
      <input
        className="select select-bordered w-full"
        placeholder="By"
        name="city"
        id="city"
        value={form?.city ?? location}
        onChange={handleLocationChange}
        onFocus={handleLocationFocus}
        autoComplete="off"
      />
      {showSuggestions && citySuggestions.length > 0 && (
        <ul className="menu-vertical absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-40 overflow-y-auto shadow-lg rounded-box p-0">
          {citySuggestions.map(city => (
            <li key={city.id}>
              <button
                type="button"
                className="menu-item text px-3 py-2 hover:bg-base-200 w-full text-left"
                onClick={() => handleSuggestionClick(city)}
              >
                {city.cityName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
          ) : (
            <div>
              {profile.city && profile.city.trim() !== ""
                ? profile.city
                : <span className="text-gray-400">Ikke angivet</span>}
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="dateOfBirth">Fødselsdato</label>
          {editMode ? (
            <input
              className="input input-bordered w-full"
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={
                form?.dateOfBirth
                  ? new Date(form.dateOfBirth).toISOString().slice(0, 10)
                  : ""
              }
              onChange={e =>
                setForm({
                  ...form!,
                  dateOfBirth: e.target.value ? new Date(e.target.value) : null,
                })
              }
              placeholder="Vælg fødselsdato"
              title="Fødselsdato"
            />
          ) : (
            <div>
              {profile.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString()
                : <span className="text-gray-400">Ikke angivet</span>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {editMode ? (
          <>
            <button className="btn btn-success" onClick={handleSave}>Gem</button>
            <button className="btn btn-outline btn-error" onClick={() => setEditMode(false)}>Annuller</button>
          </>
        ) : (
          <button className="btn btn-outline btn-warning" onClick={() => setEditMode(true)}>Rediger</button>
        )}
      </div>
    </div>
  );
};

export default UserProfileComponent;