import React from "react";
import { MapPin, Clock } from "lucide-react";

const mockStores = [
	{
		id: 1,
		name: "Seattle Coffee - Sandton City",
		address: "Sandton City Mall, Shop L21",
		hours: "Mon-Sun: 9:00 AM - 6:00 PM",
	},
	{
		id: 2,
		name: "Seattle Coffee - Rosebank",
		address: "The Zone @ Rosebank, Shop 67",
		hours: "Mon-Sun: 8:00 AM - 7:00 PM",
	},
];

const LocationsPage = () => {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Store Locations</h2>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="space-y-4">
					{mockStores.map((store) => (
						<div
							key={store.id}
							className="p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
						>
							<h3 className="font-semibold">{store.name}</h3>
							<p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
								<MapPin className="h-4 w-4" />
								{store.address}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								<Clock className="h-4 w-4 inline mr-1" />
								{store.hours}
							</p>
						</div>
					))}
				</div>
				<div className="bg-gray-100 rounded-lg p-4">
					<p className="text-center text-gray-500">
						Map will be integrated here
					</p>
				</div>
			</div>
		</div>
	);
};

export default LocationsPage;
