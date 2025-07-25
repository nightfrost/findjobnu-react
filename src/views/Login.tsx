import React, { useState } from "react";
import { AuthenticationApi, Configuration, type LoginRequest } from "../findjobnu-auth";
import { UserProfileApi, Configuration as upConfiguration, type ConfigurationParameters } from "../findjobnu-api";

const api = new AuthenticationApi(new Configuration());

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ loginRequest: form });
      localStorage.setItem("email", res.email ?? "");
      localStorage.setItem("accessToken", res.accessToken ?? "");
      localStorage.setItem("refreshToken", res.refreshToken ?? "");
      localStorage.setItem("userId", res.userId ?? "");
      localStorage.setItem("accessTokenExpiration", res.accessTokenExpiration?.toISOString() ?? "");
      
      //Attempt to cache SavedJobs
      const upConfigurationParams: ConfigurationParameters = {
        basePath: "https://findjob.nu",
        accessToken: res.accessToken ?? undefined,
        headers: {
          Authorization: `Bearer ${res.accessToken}`
        }
      };
      const userProfileApi = new UserProfileApi(new upConfiguration(
        upConfigurationParams
      ));

      try {
        const savedJobsResponse = await userProfileApi.getSavedJob({ userId: res.userId ?? "" });
        localStorage.setItem("savedJobsArray", savedJobsResponse.join(","));
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
      }
      window.location.href = "/";
    } catch (err: any) {
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
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Logger ind..." : "Log ind"}
          </button>
          {error && <div className="text-error text-center">{error}</div>}
        </form>
        <div className="text-center mt-4">
          <a href="/register" className="link link-primary">Opret bruger</a>
        </div>
      </div>
  );
};

export default Login;