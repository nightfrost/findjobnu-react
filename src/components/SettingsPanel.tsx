import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticationApi } from "../findjobnu-auth";
import { createAuthClient } from "../helpers/ApiFactory";
import { useUser } from "../context/UserContext.shared";

export type SettingsCardProps = {
  title?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
};

const SettingsCard: React.FC<SettingsCardProps> = ({ title, children, tone = "default" }) => (
  <div className={`card bg-base-100 shadow-md p-6 ${tone === "danger" ? "border border-error/20" : ""}`}>
    {title ? <h2 className={`card-title mb-4 ${tone === "danger" ? "text-error" : ""}`}>{title}</h2> : null}
    {children}
  </div>
);

const SettingsPanel: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const userId = user?.userId ?? "";
  const token = user?.accessToken ?? "";

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
    }
  }, [userId, token, navigate]);

  const authApi = useMemo(() => createAuthClient(AuthenticationApi, token), [token]);

  const [emailForm, setEmailForm] = useState({ newEmail: "", currentPassword: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingLockout, setLoadingLockout] = useState(false);

  const resetMessages = () => {
    setStatus(null);
    setError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoadingEmail(true);
    try {
      await authApi.changeEmail({
        changeEmailRequest: {
          userId,
          newEmail: emailForm.newEmail.trim(),
          currentPassword: emailForm.currentPassword,
        },
      });
      setStatus("Vi har sendt en bekræftelsesmail til den nye adresse.");
      setEmailForm({ newEmail: "", currentPassword: "" });
    } catch (err) {
      setError("Kunne ikke opdatere e-mail. Tjek adgangskode og e-mail.");
      console.warn(err);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoadingPassword(true);
    try {
      await authApi.changePassword({
        changePasswordRequest: {
          userId,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setStatus("Adgangskode opdateret.");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setError("Kunne ikke opdatere adgangskode. Tjek felterne.");
      console.warn(err);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLockout = async () => {
    const confirmed = window.confirm("Are you sure you want to lock the account temporarily?");
    if (!confirmed) return;
    resetMessages();
    setLoadingLockout(true);
    try {
      await authApi.lockoutUser({ body: userId });
      setStatus("Kontoen er låst. Log ind igen for at låse op.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessTokenExpiration");
      setUser(null);
      navigate("/login");
    } catch (err) {
      setError("Kunne ikke låse kontoen.");
      console.warn(err);
    } finally {
      setLoadingLockout(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SettingsCard>
          <form className="flex flex-col" onSubmit={handleEmailSubmit}>
            <fieldset className="fieldset gap-3">
              <legend className="fieldset-legend text-lg font-semibold">Opdater e-mail</legend>
              <label className="fieldset-label" htmlFor="newEmail">Ny e-mail</label>
              <input
                id="newEmail"
                className="input input-bordered w-full"
                type="email"
                placeholder="Ny e-mail"
                value={emailForm.newEmail}
                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                required
              />
              <label className="fieldset-label" htmlFor="currentPassword">Nuværende adgangskode</label>
              <input
                id="currentPassword"
                className="input input-bordered w-full"
                type="password"
                placeholder="Nuværende adgangskode"
                value={emailForm.currentPassword}
                onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
                minLength={6}
              />
              <button className="btn btn-primary" type="submit" disabled={loadingEmail}>
                {loadingEmail ? "Opdaterer..." : "Send bekræftelse"}
              </button>
            </fieldset>
          </form>
        </SettingsCard>

        <SettingsCard>
          <form className="flex flex-col" onSubmit={handlePasswordSubmit}>
            <fieldset className="fieldset gap-3">
              <legend className="fieldset-legend text-lg font-semibold">Opdater adgangskode</legend>
              <label className="fieldset-label" htmlFor="oldPassword">Nuværende adgangskode</label>
              <input
                id="oldPassword"
                className="input input-bordered w-full"
                type="password"
                placeholder="Nuværende adgangskode"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                required
                minLength={6}
              />
              <label className="fieldset-label" htmlFor="newPassword">Ny adgangskode</label>
              <input
                id="newPassword"
                className="input input-bordered w-full"
                type="password"
                placeholder="Ny adgangskode"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={6}
              />
              <button className="btn btn-primary" type="submit" disabled={loadingPassword}>
                {loadingPassword ? "Opdaterer..." : "Gem ny adgangskode"}
              </button>
            </fieldset>
          </form>
        </SettingsCard>

        <SettingsCard title="Lås konto" tone="danger">
          <p className="mb-4 text-sm text-base-content/70">Låser kontoen indtil du logger ind igen. Brugbar hvis du vil pause adgang.</p>
          <button className="btn btn-outline btn-error" onClick={handleLockout} disabled={loadingLockout}>
            {loadingLockout ? "Låser..." : "Lås konto"}
          </button>
        </SettingsCard>
      </div>

      {(status || error) && (
        <div className={`alert ${status ? "alert-success" : "alert-error"}`}>
          <span>{status ?? error}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
