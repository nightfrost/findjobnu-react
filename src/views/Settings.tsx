import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticationApi } from "../findjobnu-auth";
import { createAuthClient } from "../helpers/ApiFactory";
import { useUser } from "../context/UserContext.shared";

const Settings: React.FC = () => {
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
      await authApi.changeEmail({ changeEmailRequest: {
        userId,
        newEmail: emailForm.newEmail.trim(),
        currentPassword: emailForm.currentPassword,
      }});
      setStatus("We sent a confirmation email to the new address.");
      setEmailForm({ newEmail: "", currentPassword: "" });
    } catch (err) {
      setError("Could not update email. Check password and email.");
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
      await authApi.changePassword({ changePasswordRequest: {
        userId,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }});
      setStatus("Password updated.");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setError("Could not update password. Check the entered fields.");
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
      setStatus("The account is locked. Log in again to unlock.");
      // Clear local session
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessTokenExpiration");
      setUser(null);
      navigate("/login");
    } catch (err) {
      setError("Could not lock the account.");
      console.warn(err);
    } finally {
      setLoadingLockout(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <div className="flex w-full mb-8 items-start">
        <div className="flex-[4_5_0%] min-w-0 pr-6">
          <div className="card bg-base-100 shadow-md p-6 mb-6">
            <h2 className="card-title mb-4">Change email</h2>
            <form className="flex flex-col gap-3" onSubmit={handleEmailSubmit}>
              <input
                className="input input-bordered w-full"
                type="email"
                placeholder="New email"
                value={emailForm.newEmail}
                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                required
              />
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="Current password"
                value={emailForm.currentPassword}
                onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
                minLength={6}
              />
              <button className="btn btn-primary" type="submit" disabled={loadingEmail}>
                {loadingEmail ? "Updating..." : "Send confirmation"}
              </button>
            </form>
          </div>

          <div className="card bg-base-100 shadow-md p-6">
            <h2 className="card-title mb-4">Change password</h2>
            <form className="flex flex-col gap-3" onSubmit={handlePasswordSubmit}>
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="Current password"
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                required
                minLength={6}
              />
              <input
                className="input input-bordered w-full"
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={6}
              />
              <button className="btn btn-primary" type="submit" disabled={loadingPassword}>
                {loadingPassword ? "Updating..." : "Save new password"}
              </button>
            </form>
          </div>
        </div>

        <div className="divider divider-horizontal" />

        <div className="flex-[4_0_0%] min-w-0 pl-6">
          <div className="card bg-base-100 shadow-md p-6">
            <h2 className="card-title mb-4 text-error">Lock account</h2>
            <p className="mb-4 text-sm text-base-content/70">Locks the account until you log in again. Useful if you need to pause access.</p>
            <button className="btn btn-outline btn-error" onClick={handleLockout} disabled={loadingLockout}>
              {loadingLockout ? "Locking..." : "Lock account"}
            </button>
          </div>

          {(status || error) && (
            <div className={`alert mt-4 ${status ? "alert-success" : "alert-error"}`}>
              <span>{status ?? error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
