import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileApi, Configuration as UserProfileConfiguration } from "../findjobnu-api";

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
  };
}

const LinkedInAuthHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { setUser } = useUser();
  useEffect(() => {
    const handleAuth = async () => {
      const params = parseQueryParams(location.search);
      //initialize user profile
  const upApi = new ProfileApi(
        new UserProfileConfiguration({
          basePath: "https://findjob.nu",
          accessToken: params.accessToken ?? undefined, 
          headers: {
            Authorization: `Bearer ${params.accessToken}`
          }
        })
      );
      const existingProfile = await upApi.getProfileByUserId({ userId: params.userId ?? "" });
      if (!existingProfile?.basicInfo?.firstName || !existingProfile?.basicInfo?.lastName) { 
        await upApi.createProfile({ profile: {
            userId: params.userId ?? "",
            basicInfo: {
              firstName: params.firstName ?? "",
              lastName: params.lastName ?? "",
            }
        }});
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

      navigate("/profile", { replace: true });
    };
    handleAuth();
  }, [location.search, navigate, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
      <p>Logging you in with LinkedIn...</p>
    </div>
  );
};

export default LinkedInAuthHandler;
