import React, { useState } from "react";
import { AuthenticationApi, Configuration, type LoginRequest } from "../findjobnu-auth";

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
      // Store tokens in localStorage/sessionStorage as needed
      localStorage.setItem("accessToken", res.accessToken ?? "");
      localStorage.setItem("refreshToken", res.refreshToken ?? "");
      window.location.href = "/"; // Redirect to home
    } catch (err: any) {
      setError("Login fejlede. Tjek dine oplysninger.");
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