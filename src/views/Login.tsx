import React, { useMemo, useRef, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import { createAuthClient, createApiClient } from "../helpers/ApiFactory";
import { AuthenticationApi, type LoginRequest } from "../findjobnu-auth";
import { ProfileApi } from "../findjobnu-api";
import { prepareLinkedInLogin } from "../helpers/oauth";

const api = createAuthClient(AuthenticationApi);

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "email" && emailTouched) {
      setEmailInvalid(!e.target.checkValidity());
    }
    if (name === "password" && passwordTouched) {
      setPasswordInvalid(!e.target.checkValidity());
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === "email") {
      setEmailTouched(true);
      setEmailInvalid(!e.target.checkValidity());
    }
    if (name === "password") {
      setPasswordTouched(true);
      setPasswordInvalid(!e.target.checkValidity());
    }
  };

  const linkedInLoginUrl = useMemo(() => (
    import.meta.env.VITE_LINKEDIN_LOGIN_URL ?? "https://auth.findjob.nu/api/auth/linkedin/login"
  ), []);

  const handleLinkedInLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const redirect = prepareLinkedInLogin(linkedInLoginUrl);
    globalThis.location.href = redirect;
  };

  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current && !formRef.current.reportValidity()) {
      // mark fields as touched and update invalid states to display hints appropriately
      setEmailTouched(true);
      setPasswordTouched(true);
      if (emailRef.current) setEmailInvalid(!emailRef.current.checkValidity());
      if (passwordRef.current) setPasswordInvalid(!passwordRef.current.checkValidity());
      return;
    }
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
      globalThis.location.href = "/";
    } catch (err: unknown) {
      setError("Login fejlede. Tjek dine oplysninger.");
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto mt-12 p-8 bg-base-100 shadow rounded">
      <form onSubmit={handleSubmit} className="grid gap-4" ref={formRef}>
        <fieldset className="fieldset gap-3">
          <legend className="fieldset-legend text-2xl font-bold text-center">Log ind</legend>
          <label className="fieldset-label" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            className={`input input-bordered validator w-full ${emailTouched && emailInvalid ? "input-error" : ""}`.trim()}
            value={form.email ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={emailRef}
            required
            aria-invalid={emailTouched && emailInvalid ? "true" : "false"}
          />
          {emailTouched && emailInvalid && (
            <div className="validator-hint text-error text-sm">Indtast en gyldig e-mailadresse</div>
          )}
          <label className="fieldset-label" htmlFor="password">Adgangskode</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Adgangskode"
            className={`input input-bordered validator w-full ${passwordTouched && passwordInvalid ? "input-error" : ""}`.trim()}
            value={form.password ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={passwordRef}
            minLength={8}
            pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Mindst 8 tegn, inkl. tal, små og store bogstaver"
            required
            aria-invalid={passwordTouched && passwordInvalid ? "true" : "false"}
          />
          {passwordTouched && passwordInvalid && (
            <p className="validator-hint text-error text-sm">
              Mindst 8 tegn, inklusive
              <br/>Mindst ét tal
              <br/>Mindst ét lille bogstav
              <br/>Mindst ét stort bogstav
            </p>
          )}
          <button
            type="submit"
            className="btn btn-success w-full"
            disabled={loading}
          >
            {loading ? "Logger ind..." : "Log ind"}
          </button>
          {error && <div className="text-error text-center">{error}</div>}
        </fieldset>
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