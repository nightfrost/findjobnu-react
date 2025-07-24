import React, { useEffect, useState } from "react";
import { UserProfileApi, Configuration } from "../findjobnu-api";
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

  const token = localStorage.getItem("accessToken");
  
  const api = new UserProfileApi(
    new Configuration({
      basePath: "https://findjob.nu",
      accessToken: token ?? undefined, 
      headers: {
              Authorization: `Bearer ${token}`
            }
    })
  );

  useEffect(() => {
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
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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
    setLoading(true);
    setError(null);
    try {
      // You may want to adjust default values as needed
      const newProfile: UserProfile = {
        id: undefined,
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: null,
        userId: userId,
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

  if (loading) return <div className="text-center py-8">Indlæser profil...</div>;

  if (error || profile === null) {
    return (
      <div className="text-center py-8">
        Ingen profil fundet.<br />
        <button className="btn btn-primary mt-4" onClick={handleCreateProfile}>
          Opret profil
        </button>
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="card bg-base-100 shadow p-6 max-w-lg mx-auto mt-8">
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
            <div>{profile.firstName}</div>
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
            <div>{profile.lastName}</div>
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
            <div>{profile.phoneNumber ?? <span className="text-gray-400">Ikke angivet</span>}</div>
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
            <div>{profile.address ?? <span className="text-gray-400">Ikke angivet</span>}</div>
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