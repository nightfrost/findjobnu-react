import React from "react";
import Seo from "../components/Seo";
import JobSearch from "./JobSearch";

// Home now shows quick category buttons above the search view
const Home: React.FC = () => (
	<div className="container max-w-7xl mx-auto px-4 flex flex-col gap-6 py-4">
		<Seo
			title="FindJob.nu – Find relevante job i Danmark"
			description="Søg blandt danske jobopslag, opret jobagenter og få anbefalinger tilpasset dine kompetencer. Start din jobsøgning her."
			path="/"
			jsonLd={{
				"@context": "https://schema.org",
				"@type": "WebSite",
				name: "FindJob.nu",
				url: "https://findjob.nu/",
				potentialAction: {
					"@type": "SearchAction",
					target: "https://findjob.nu/jobsearch?searchTerm={search_term_string}",
					"query-input": "required name=search_term_string"
				}
			}}
		/>
		{/* <PopularCategories limit={10} /> */}
		<JobSearch />
	</div>
);

export default Home;