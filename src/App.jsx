import React from "react";
import TopBar from "./components/TopBar";
import HeroSection from "./components/HeroSection";
import LocationsPage from "./pages/LocationsPage";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
	return (
		<ErrorBoundary>
			<div className="flex flex-col min-h-screen w-full bg-egg-shell font-helvetica text-brand-blue overflow-x-hidden">
				<TopBar />
				<HeroSection />
				<main className="flex-1 w-full bg-egg-shell" role="main">
					<LocationsPage />
				</main>
			</div>
		</ErrorBoundary>
	);
};

export default App;
