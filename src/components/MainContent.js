import React from "react";
import LocationsPage from "../pages/LocationsPage";
import DashboardPage from "../pages/DashboardPage";
import HistoryPage from "../pages/HistoryPage";
import ProfilePage from "../pages/ProfilePage";

const MainContent = ({ activeTab }) => {
	const renderContent = () => {
		switch (activeTab) {
			case "locations":
				return <LocationsPage />;
			case "dashboard":
				return <DashboardPage />;
			case "history":
				return <HistoryPage />;
			case "profile":
				return <ProfilePage />;
			default:
				return <DashboardPage />;
		}
	};

	return (
		<main className="flex-1 p-6 bg-gray-50">
			<div className="max-w-7xl mx-auto">{renderContent()}</div>
		</main>
	);
};

export default MainContent;
