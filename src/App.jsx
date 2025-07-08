import React from "react";
import TopBar from "./components/TopBar";
import LocationsPage from "./pages/LocationsPage";

const App = () => {
	return (
		<div className="flex flex-col min-h-screen bg-egg-shell font-helvetica text-brand-blue">
			<TopBar />
			<div className="flex-1 overflow-auto">
				<LocationsPage />
			</div>
		</div>
	);
};

export default App;
