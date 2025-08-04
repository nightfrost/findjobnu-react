import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { AuthenticationApi, Configuration as AuthConfiguration, type RegisterRequest } from "../findjobnu-auth";
import { LinkedInAuthApi } from "../findjobnu-auth/apis/LinkedInAuthApi";
import { Link } from "react-router-dom";
import { handleApiError } from "../helpers/ErrorHelper";
import { UserProfileApi, Configuration as UserProfileConfiguration } from "../findjobnu-api";

const api = new AuthenticationApi(new AuthConfiguration());
const linkedInApi = new LinkedInAuthApi(new AuthConfiguration());

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({ email: "", password: "", phone: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLinkedInLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.location.href = "https://auth.findjob.nu/api/auth/linkedin/login";
  };

  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.register({ registerRequest: form });
      setUser({
        email: res.email ?? "",
        accessToken: res.accessToken ?? "",
        refreshToken: res.refreshToken ?? "",
        userId: res.userId ?? "",
        accessTokenExpiration: res.accessTokenExpiration?.toISOString() ?? "",
      });

      //initialize user profile
      const upApi = new UserProfileApi(
        new UserProfileConfiguration({
          basePath: "https://findjob.nu",
          accessToken: res.accessToken ?? undefined, 
          headers: {
            Authorization: `Bearer ${res.accessToken}`
          }
        })
      );
      await upApi.createUserProfile({ userProfile: {
          userId: res.userId ?? "",
          firstName: form.firstName ?? "",
          lastName: form.lastName ?? "",
          phoneNumber: form.phone ?? "",
        }});

      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = await handleApiError(err);
      setError("Registrering fejlede. " + (apiErr?.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.replace("/profile");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-base-100 shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Opret bruger</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="Fornavn"
          className="input input-bordered w-full"
          value={form.firstName ?? ""}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Efternavn"
          className="input input-bordered w-full"
          value={form.lastName ?? ""}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={form.email ?? ""}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Adgangskode"
          className="input input-bordered w-full"
          value={form.password ?? ""}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Opretter..." : "Opret konto"}
        </button>
        <button
          type="button"
          className="btn btn-info btn-outline w-full flex items-center justify-center gap-2"
          onClick={handleLinkedInLogin}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
          Opret med LinkedIn
        </button>
        {error && <div className="text-error text-center">{error}</div>}
        {success && (
          <div className="text-success text-center flex flex-col items-center gap-2">
            <span>
              Bruger oprettet! Tjek din E-mail for at bekræfte din konto. Du kan allerede nu editere din{" "}
              <Link to="/profile" className="link link-primary" onClick={() => window.location.replace("/profile")}>profil</Link>.
            </span>
            <span className="flex items-center gap-2 mt-2">
              <span className="loading loading-spinner loading-md"></span>
              <span>Du bliver omdirigeret til profilopsætning...</span>
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;