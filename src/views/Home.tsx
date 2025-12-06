import React from "react";
import JobSearch from "./JobSearch";
import PopularCategories from "../components/PopularCategories";

// Home now shows quick category buttons above the search view
const Home: React.FC = () => (
	<div className="container max-w-7xl mx-auto px-4 flex flex-col gap-6 py-4">
		{/* <PopularCategories limit={10} /> */}
		<JobSearch />
	</div>
);

export default Home;