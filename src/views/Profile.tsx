import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import UserProfileComponent from "../components/UserProfile";
import ConnectionsComponent from "../components/Connections";
import JobAgentCard from "../components/JobAgentCard";
import SavedJobs from "../components/SavedJobs";
import SettingsPanel from "../components/SettingsPanel";
import { useNavigate, useSearchParams } from "react-router-dom";

type PanelKey = "profile" | "connections" | "jobAgent" | "savedJobs" | "settings";

const Profile: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId || "";
  const token = user?.accessToken || "";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileRefreshKey] = useState(0);
  const panelFromParams = (): PanelKey => {
    const panel = searchParams.get("panel");
    if (panel === "connections" || panel === "jobAgent" || panel === "savedJobs" || panel === "settings") return panel;
    return "profile";
  };
  const [activePanel, setActivePanel] = useState<PanelKey>(panelFromParams);

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
    }
  }, [userId, token, navigate]);

  useEffect(() => {
    setActivePanel(panelFromParams());
  }, [searchParams]);

  const navItems = useMemo(
    () => [
      {
        key: "profile" as const,
        label: "Profil",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 0 1 12 0" />
          </svg>
        ),
      },
      {
        key: "connections" as const,
        label: "Forbindelser",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 20a4 4 0 0 1 4-4h0M14 16h0a4 4 0 0 1 4 4M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 10a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4" />
          </svg>
        ),
      },
      {
        key: "jobAgent" as const,
        label: "Jobagent",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v10H4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16" />
          </svg>
        ),
      },
      {
        key: "savedJobs" as const,
        label: "Gemte Jobs",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-7.5-4.5L5.5 20V5.5a1 1 0 0 1 1-1Z" />
          </svg>
        ),
      },
      {
        key: "settings" as const,
        label: "Indstillinger",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35.657-.159 1.182-.684 1.065-1.34-.94-1.543.826-3.31 2.37-2.37.642.392 1.456.133 1.572-.698Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        ),
      },
    ],
    []
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case "connections":
        return <ConnectionsComponent userId={userId} accessToken={token} />;
      case "jobAgent":
        return <JobAgentCard userId={userId} accessToken={token} />;
      case "savedJobs":
        return <SavedJobs userId={userId} />;
      case "settings":
        return <SettingsPanel />;
      case "profile":
      default:
        return <UserProfileComponent userId={userId} refreshKey={profileRefreshKey} />;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 pb-8 items-start">
        <aside className="card bg-base-100 shadow-sm self-start">
          <div className="card-body p-4">
            <h2 className="card-title text-lg mb-2">Min profil</h2>
            <div className="flex flex-col gap-2" role="tablist" aria-label="Profil navigation">
              {navItems.map((item) => {
                const isActive = activePanel === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`btn btn-sm justify-start gap-2 ${isActive ? "btn-primary" : "btn-ghost"}`}
                    aria-pressed={isActive}
                    onClick={() => {
                      setActivePanel(item.key);
                      setSearchParams((prev) => {
                        const params = new URLSearchParams(prev);
                        params.set("panel", item.key);
                        return params;
                      });
                    }}
                  >
                    <span className="text-base-content/80">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body p-0 sm:p-4 lg:p-6 transition-opacity duration-200" key={activePanel}>
            {renderActivePanel()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;