import React, { useEffect, useMemo, useState } from "react";
import { Configuration as AuthConfiguration, AuthenticationApi, LinkedInAuthApi } from "../findjobnu-auth";
import { prepareLinkedInLogin } from "../helpers/oauth";
import { sanitizeExternalUrl } from "../helpers/url";

interface Props {
  userId: string;
  accessToken: string;
}

interface Connection {
  id: string;
  platform: string;
  username: string;
  isConnected: boolean;
  profileUrl?: string;
  lastSync?: Date;
}

const ConnectionsComponent: React.FC<Props> = ({ userId, accessToken }) => {
  // Mock data - in a real app, this would come from an API
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "1",
      platform: "LinkedIn",
      username: "",
      isConnected: false,
      profileUrl: "",
      lastSync: undefined,
    },
    {
      id: "2",
      platform: "GitHub",
      username: "",
      isConnected: false,
      profileUrl: "",
      lastSync: undefined,
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user profile to check if LinkedIn user
    const fetchUserProfile = async () => {
      try {
        const authApi = new AuthenticationApi(
          new AuthConfiguration({
            basePath: "https://auth.findjob.nu",
            accessToken: accessToken ?? undefined,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
        );
        const response = await authApi.getUserInformation();
        // If the user is a LinkedIn user, update the LinkedIn connection status
        if (response.success && response.userInformation?.hasVerifiedLinkedIn === true) {
          setConnections(prev =>
            prev.map(conn =>
              conn.platform === "LinkedIn"
                ? { ...conn, isConnected: response.userInformation?.hasVerifiedLinkedIn ?? false, username: response.userInformation?.userName ?? "", profileUrl: response.userInformation?.linkedInProfileUrl ?? "", lastSync: response.userInformation?.lastLinkedInSync ?? new Date() }
                : conn
            )
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId, accessToken]);

  const linkedInLoginUrl = useMemo(() => (
    import.meta.env.VITE_LINKEDIN_LOGIN_URL ?? "https://auth.findjob.nu/api/auth/linkedin/login"
  ), []);

  const handleLinkedInLogin = () => {
    const redirect = prepareLinkedInLogin(linkedInLoginUrl);
    globalThis.location.href = redirect;
  };

  const handleConnect = async (connectionId: string) => {
    setLoading(true);

    if (connectionId === "1") {
      handleLinkedInLogin();
      return;
    }

    setLoading(false);
  };

  const handleDisconnect = async (connectionId: string) => {
    setLoading(true);

    try {
      const linkedInAuthApi = new LinkedInAuthApi(
        new AuthConfiguration({
          basePath: "https://auth.findjob.nu",
          accessToken: accessToken ?? undefined,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      );
      await linkedInAuthApi.unlinkLinkedInProfile();
      setConnections(prev =>
        prev.map(conn =>
          conn.id === connectionId
            ? {
              ...conn,
              isConnected: false,
              username: "",
              profileUrl: "",
              lastSync: undefined
            }
            : conn
        )
      );
    } catch (error) {
      console.error("Error unlinking user profile:", error);
    }
    setLoading(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "LinkedIn":
        return (
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      case "GitHub":
        return (
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{platform[0]}</span>
          </div>
        );
    }
  };

  return (
    <div className="card bg-base-100 shadow rounded-lg p-6 w-full h-fit">
      <h2 className="card-title mb-4">Tilslutninger</h2>
      <div className="space-y-4">
        {connections.map((connection) => {
          const safeProfileUrl = sanitizeExternalUrl(connection.profileUrl);
          return (
            <div key={connection.id} className="border border-base-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon(connection.platform)}
                <div>
                  <h3 className="font-semibold text-lg">{connection.platform}</h3>
                  {connection.isConnected ? (
                    <div className="text-sm text-gray-600">
                      <p>Bruger: {connection.username}</p>
                      {connection.lastSync && (
                        <p>Sidst synkroniseret: {connection.lastSync.toLocaleDateString()}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Ikke tilsluttet</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {connection.isConnected ? (
                  <>
                    {safeProfileUrl && (
                      <a
                        href={safeProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        Profil
                      </a>
                    )}
                    <button
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => handleDisconnect(connection.id)}
                      disabled={loading}
                    >
                      {loading ? "Fjerner..." : "Fjern"}
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleConnect(connection.id)}
                    disabled={loading}
                  >
                    {loading ? "Tilslutter..." : "Tilslut"}
                  </button>
                )}
              </div>
            </div>
            {connection.isConnected && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Aktiv forbindelse</span>
              </div>
            )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Tilslut dine profiler for at importere relevant information og forbedre din jobsøgning.
        </p>
      </div>
    </div>
  );
};

export default ConnectionsComponent;
