import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileApi } from "../findjobnu-api";
import { createApiClient, createProfileSimple } from "../helpers/ApiFactory";
import { clearLinkedInState, validateLinkedInResponse } from "../helpers/oauth";
import Seo from "../components/Seo";

const SENSITIVE_QUERY_KEYS = [
  "accessToken",
  "refreshToken",
  "accessTokenExpiration",
  "userId",
  "email",
  "firstName",
  "lastName",
  "isLinkedInUser",
  "findJobNuUri",
  "state",
];

function parseQueryParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    userId: params.get("userId"),
    email: params.get("email"),
    firstName: params.get("firstName"),
    lastName: params.get("lastName"),
    accessToken: params.get("accessToken"),
    refreshToken: params.get("refreshToken"),
    accessTokenExpiration: params.get("accessTokenExpiration"),
    isLinkedInUser: params.get("isLinkedInUser"),
    findJobNuUri: params.get("findJobNuUri"),
    state: params.get("state"),
  };
}

function sanitizeInternalPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || !trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  return trimmed;
}

const LinkedInAuthHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const sensitiveKeys = useMemo(() => SENSITIVE_QUERY_KEYS, []);

  const stripSensitiveParams = useCallback(() => {
    try {
      const query = new URLSearchParams(location.search);
      sensitiveKeys.forEach(key => query.delete(key));
      const next = `${location.pathname}${query.size ? `?${query.toString()}` : ""}`;
      if (globalThis.history?.replaceState) {
        globalThis.history.replaceState(null, "", next);
      }
    } catch (err) {
      console.warn("Failed to strip LinkedIn query parameters", err);
    }
  }, [location.pathname, location.search, sensitiveKeys]);

  const { setUser } = useUser();
  useEffect(() => {
    const handleAuth = async () => {
      const params = parseQueryParams(location.search);
      if (!params.accessToken && !params.refreshToken && !params.state) {
        return;
      }

      if (!validateLinkedInResponse(params.state)) {
        clearLinkedInState();
        stripSensitiveParams();
        setError("Ugyldig LinkedIn-session. Prøv venligst igen.");
        return;
      }

      stripSensitiveParams();

      if (!params.accessToken || !params.refreshToken || !params.userId) {
        setError("Mangler godkendelsesdata fra LinkedIn. Prøv igen.");
        return;
      }

      try {
        const upApi = createApiClient(ProfileApi, params.accessToken);
        const existingProfile = await upApi.getProfileByUserId({ userId: params.userId });
        const fullName = `${params.firstName ?? ""} ${params.lastName ?? ""}`.trim();
        if (!existingProfile?.basicInfo?.firstName || !existingProfile?.basicInfo?.lastName) {
          await createProfileSimple(upApi, {
            userId: params.userId,
            fullName,
            email: params.email ?? undefined,
            phone: undefined,
            summary: undefined,
          });
        }
      } catch (profileError) {
        console.error("LinkedIn profile bootstrap failed", profileError);
      }

      setUser({
        accessToken: params.accessToken ?? undefined,
        refreshToken: params.refreshToken ?? undefined,
        accessTokenExpiration: params.accessTokenExpiration ?? undefined,
        userId: params.userId ?? undefined,
        email: params.email ?? undefined,
        firstName: params.firstName ?? undefined,
        lastName: params.lastName ?? undefined,
        isLinkedInUser: params.isLinkedInUser ?? "true",
      });

      const redirectPath = sanitizeInternalPath(params.findJobNuUri) ?? "/profile";
      navigate(redirectPath, { replace: true });
    };
    handleAuth();
  }, [location.search, navigate, sensitiveKeys, setUser, stripSensitiveParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Seo
        title="LinkedIn login | FindJob.nu"
        description="Behandler LinkedIn-login og sender dig videre til din profil."
        path="/profile/linkedin-auth"
        noIndex
      />
      <span className="loading loading-spinner loading-lg"></span>
      <p>Logging you in with LinkedIn...</p>
      {error && <p className="text-error mt-4 text-center max-w-md">{error}</p>}
    </div>
  );
};

export default LinkedInAuthHandler;
