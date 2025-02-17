import React from "react";
import { MapPin, Home, History, User } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
	const navItems = [
		{ id: "dashboard", icon: Home, text: "Dashboard" },
		{ id: "history", icon: History, text: "Transaction History" },
		{ id: "profile", icon: User, text: "Profile" },
		{ id: "locations", icon: MapPin, text: "Locations" },
	];

	return (
		<div className="w-64 bg-[#172554] text-white">
			<div className="p-6">
				<h1 className="text-xl font-bold">SEATTLE COFFEE CO</h1>
			</div>
			<nav className="mt-6">
				{navItems.map(({ id, icon: Icon, text }) => (
					<button
						key={id}
						onClick={() => setActiveTab(id)}
						className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors ${
							activeTab === id
								? "bg-[#1e3a8a] text-white"
								: "text-gray-300 hover:bg-[#1e3a8a] hover:text-white"
						}`}
					>
						<Icon className="w-5 h-5" />
						<span>{text}</span>
					</button>
				))}
			</nav>
		</div>
	);
};

export default Sidebar;
