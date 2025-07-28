import React, { useState, useEffect } from "react";
import { AuthenticationApi, Configuration, type RegisterRequest } from "../findjobnu-auth";
import { Link } from "react-router-dom";
import { handleApiError } from "../helpers/ErrorHelper";

const api = new AuthenticationApi(new Configuration());

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({ email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.register({ registerRequest: form });
      localStorage.setItem("email", res.email ?? "");
      localStorage.setItem("accessToken", res.accessToken ?? "");
      localStorage.setItem("refreshToken", res.refreshToken ?? "");
      localStorage.setItem("userId", res.userId ?? "");
      localStorage.setItem("accessTokenExpiration", res.accessTokenExpiration?.toISOString() ?? "");
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
        {error && <div className="text-error text-center">{error}</div>}
        {success && (
          <div className="text-success text-center flex flex-col items-center gap-2">
            <span>
              Bruger oprettet! Tjek din E-mail for at bekræfte din konto. Du kan allerede nu editere din{" "}
              <Link to="/profile" className="link link-primary" onClick={() => window.location.replace("/profile")}>profil</Link>.
            </span>
            <span className="flex items-center gap-2 mt-2">
              <span className="loading loading-spinner loading-md"></span>
              <span>Du bliver omdirigeret til din profil...</span>
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;