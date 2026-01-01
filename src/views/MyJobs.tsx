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

	return (
		<div className="container max-w-7xl mx-auto px-4 py-6">
			<div role="tablist" className="tabs tabs-box">
				<input
					type="radio"
					name="my-jobs-tabs"
					role="tab"
					aria-label="Gemte"
					className="tab"
					checked={activeTab === "saved"}
					onChange={() => setActiveTab("saved")}
				/>
				<div className="tab-content bg-base-100 border-base-300 rounded-box p-4 md:p-6">
					{activeTab === "saved" && <SavedJobs userId={userId} />}
				</div>

				<input
					type="radio"
					name="my-jobs-tabs"
					role="tab"
					aria-label="Anbefalede"
					className="tab"
					checked={activeTab === "recommended"}
					onChange={() => setActiveTab("recommended")}
				/>
				<div className="tab-content bg-base-100 border-base-300 rounded-box p-4 md:p-6">
					{activeTab === "recommended" && <RecommendedJobs userId={userId} />}
				</div>
			</div>
		</div>
	);
};

export default MyJobs;

