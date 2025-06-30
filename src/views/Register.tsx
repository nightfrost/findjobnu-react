import React, { useState } from "react";
import { AuthenticationApi, Configuration, type RegisterRequest } from "../findjobnu-auth";

const api = new AuthenticationApi(new Configuration());

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({ email: "", password: "" });
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
      await api.register({ registerRequest: form });
      setSuccess(true);
    } catch (err: any) {
      setError("Registrering fejlede. Prøv igen.");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="text-success text-center">
              Bruger oprettet! Du kan nu <a href="/login" className="link link-primary">logge ind</a>.
            </div>
          )}
        </form>
      </div>
  );
};

export default Register;