import React from "react";

const DashboardPage = () => {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">Dashboard</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="p-6 bg-white rounded-lg shadow">
					<h3 className="font-semibold mb-2">Loyalty Points</h3>
					<p className="text-2xl font-bold">2,450</p>
				</div>
				<div className="p-6 bg-white rounded-lg shadow">
					<h3 className="font-semibold mb-2">Recent Orders</h3>
					<p className="text-2xl font-bold">12</p>
				</div>
				<div className="p-6 bg-white rounded-lg shadow">
					<h3 className="font-semibold mb-2">Rewards Available</h3>
					<p className="text-2xl font-bold">3</p>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
