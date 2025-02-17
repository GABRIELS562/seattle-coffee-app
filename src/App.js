import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import MainContent from "./components/MainContent";

const App = () => {
	const [activeTab, setActiveTab] = useState("dashboard");

	return (
		<div className="flex h-screen bg-white">
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<div className="flex-1 flex flex-col">
				<TopBar />
				<MainContent activeTab={activeTab} />
			</div>
		</div>
	);
};

export default App;
