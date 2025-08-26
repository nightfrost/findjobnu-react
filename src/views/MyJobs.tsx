import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.shared";
import SavedJobs from "../components/SavedJobs";
import RecommendedJobs from "../components/RecommendedJobs";

type TabKey = "saved" | "recommended";

const MyJobs: React.FC = () => {
	const { user } = useUser();
	const userId = user?.userId ?? "";
	const location = useLocation();

	const initialTab: TabKey = useMemo(() => {
		if (location.pathname.includes("recommended")) return "recommended";
		return "saved";
	}, [location.pathname]);

	const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

	const switchTab = (tab: TabKey) => {
		setActiveTab(tab);
	};

	return (
		<div className="container max-w-7xl mx-auto px-4 py-6">
			<h1 className="text-3xl font-bold mb-4">Mine Jobs</h1>

			<div role="tablist" className="tabs tabs-boxed">
				<button
					role="tab"
					className={`tab ${activeTab === "saved" ? "tab-active" : ""}`}
					onClick={() => switchTab("saved")}
				>
					Gemte
				</button>
				<button
					role="tab"
					className={`tab ${activeTab === "recommended" ? "tab-active" : ""}`}
					onClick={() => switchTab("recommended")}
				>
					Anbefalede
				</button>
			</div>

			{activeTab === "saved" ? (
				<SavedJobs userId={userId} />
			) : (
				<RecommendedJobs userId={userId} />
			)}
		</div>
	);
};

export default MyJobs;

