import React, { useState, useEffect, useRef, useMemo } from "react";
import { useUser } from "../context/UserContext.shared";
import { AuthenticationApi, type RegisterRequest } from "../findjobnu-auth";
import { Link } from "react-router-dom";
import { handleApiError } from "../helpers/ErrorHelper";
import { ProfileApi } from "../findjobnu-api";
import { createAuthClient, createApiClient, createProfileSimple } from "../helpers/ApiFactory";
import { prepareLinkedInLogin } from "../helpers/oauth";

const api = createAuthClient(AuthenticationApi);

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({ email: "", password: "", phone: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [firstNameInvalid, setFirstNameInvalid] = useState(false);
  const [lastNameInvalid, setLastNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "firstName" && firstNameTouched) setFirstNameInvalid(!e.target.checkValidity());
    if (name === "lastName" && lastNameTouched) setLastNameInvalid(!e.target.checkValidity());
    if (name === "email" && emailTouched) setEmailInvalid(!e.target.checkValidity());
    if (name === "password" && passwordTouched) setPasswordInvalid(!e.target.checkValidity());
    if (name === "firstName") { setFirstNameTouched(true); setFirstNameInvalid(!e.target.checkValidity()); }
    if (name === "lastName") { setLastNameTouched(true); setLastNameInvalid(!e.target.checkValidity()); }
    if (name === "email") { setEmailTouched(true); setEmailInvalid(!e.target.checkValidity()); }
    if (name === "password") { setPasswordTouched(true); setPasswordInvalid(!e.target.checkValidity()); }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === "firstName") { setFirstNameTouched(true); setFirstNameInvalid(!e.target.checkValidity()); }
    if (name === "lastName") { setLastNameTouched(true); setLastNameInvalid(!e.target.checkValidity()); }
    if (name === "email") { setEmailTouched(true); setEmailInvalid(!e.target.checkValidity()); }
    if (name === "password") { setPasswordTouched(true); setPasswordInvalid(!e.target.checkValidity()); }
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
      setFirstNameTouched(true);
      setLastNameTouched(true);
      setEmailTouched(true);
      setPasswordTouched(true);
      if (firstNameRef.current) setFirstNameInvalid(!firstNameRef.current.checkValidity());
      if (lastNameRef.current) setLastNameInvalid(!lastNameRef.current.checkValidity());
      if (emailRef.current) setEmailInvalid(!emailRef.current.checkValidity());
      if (passwordRef.current) setPasswordInvalid(!passwordRef.current.checkValidity());
      return;
    }
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
  const upApi = createApiClient(ProfileApi, res.accessToken);
      await createProfileSimple(upApi, {
        userId: res.userId ?? "",
        fullName: `${form.firstName ?? ""} ${form.lastName ?? ""}`.trim(),
        email: form.email ?? undefined,
        phone: form.phone ?? undefined,
        summary: undefined,
      });

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
        globalThis.location.replace("/profile");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-base-100 shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Opret bruger</h2>
      <form onSubmit={handleSubmit} className="grid gap-4" ref={formRef}>
        <input
          type="text"
          name="firstName"
          placeholder="Fornavn"
          className="input input-bordered validator w-full"
          value={form.firstName ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={firstNameRef}
          required
          minLength={2}
          pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
          title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
        />
        {firstNameTouched && firstNameInvalid && (
          <p className="validator-hint">Mindst 2 bogstaver</p>
        )}
        <input
          type="text"
          name="lastName"
          placeholder="Efternavn"
          className="input input-bordered validator w-full"
          value={form.lastName ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={lastNameRef}
          required
          minLength={2}
          pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
          title="Mindst 2 bogstaver. Brug kun bogstaver, mellemrum, bindestreg eller apostrof."
        />
        {lastNameTouched && lastNameInvalid && (
          <p className="validator-hint">Mindst 2 bogstaver</p>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered validator w-full"
          value={form.email ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={emailRef}
          required
        />
        {emailTouched && emailInvalid && (
          <div className="validator-hint">Indtast en gyldig e-mailadresse</div>
        )}
        <input
          type="password"
          name="password"
          placeholder="Adgangskode"
          className="input input-bordered validator w-full"
          value={form.password ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={passwordRef}
          required
          minLength={8}
          pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Mindst 8 tegn, inkl. tal, små og store bogstaver"
        />
        {passwordTouched && passwordInvalid && (
          <p className="validator-hint">
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
          {loading ? "Opretter..." : "Opret konto"}
        </button>
        <button
          type="button"
          className="btn bg-[#0967C2] text-white border-[#0059b3] btn-info btn-outline w-full flex items-center justify-center gap-2"
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
              <Link to="/profile" className="link link-primary" onClick={() => globalThis.location.replace("/profile")}>profil</Link>.
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