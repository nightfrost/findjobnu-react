import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { createAuthClient, createApiClient } from "../helpers/ApiFactory";
import { AuthenticationApi, type LoginRequest } from "../findjobnu-auth";
import { ProfileApi } from "../findjobnu-api";

const api = createAuthClient(AuthenticationApi);

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const res = await api.login({ loginRequest: form });
      setUser({
        email: res.email ?? "",
        accessToken: res.accessToken ?? "",
        refreshToken: res.refreshToken ?? "",
        userId: res.userId ?? "",
        accessTokenExpiration: res.accessTokenExpiration?.toISOString() ?? "",
      });

      //Attempt to cache SavedJobs
      const userProfileApi = createApiClient(ProfileApi, res.accessToken);

      try {
        const savedJobsResponse = await userProfileApi.getSavedJobsByUserId({ userId: res.userId ?? "" });
        const savedJobsArray = savedJobsResponse.items?.map(job => job.jobID?.toString()) ?? [];
        localStorage.setItem("savedJobsArray", savedJobsArray.join(","));
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
      }
      window.location.href = "/";
    } catch (err: unknown) {
      setError("Login fejlede. Tjek dine oplysninger.");
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-base-100 shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Log ind</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
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
          className="btn btn-success w-full"
          disabled={loading}
        >
          {loading ? "Logger ind..." : "Log ind"}
        </button>
        {error && <div className="text-error text-center">{error}</div>}
      </form>
      <button
        type="button"
        className="btn bg-[#0967C2] text-white border-[#0059b3] btn-info btn-outline w-full flex items-center justify-center gap-2 mt-4"
        onClick={handleLinkedInLogin}
        disabled={loading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z" /></svg>
        Log ind med LinkedIn
      </button>
      <div className="text-center mt-4">
        <a href="/register" className="link link-primary">Opret bruger</a>
      </div>
    </div>
  );
};

export default Login;