import React from "react";
import { Coffee, User } from "lucide-react";

const TopBar = () => {
	return (
		<header className="bg-white shadow-sm p-4 flex justify-between items-center">
			<div className="flex items-center">
				<span className="text-gray-600">Welcome: 2313517</span>
			</div>
			<div className="flex items-center space-x-4">
				<button className="p-2 hover:bg-gray-100 rounded-full">
					<Coffee className="w-5 h-5" />
				</button>
				<button className="p-2 hover:bg-gray-100 rounded-full">
					<User className="w-5 h-5" />
				</button>
			</div>
		</header>
	);
};

export default TopBar;
