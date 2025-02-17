import React from "react";

const ProfilePage = () => {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">Profile</h2>
			<div className="bg-white rounded-lg shadow p-6 max-w-2xl">
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Card Number
						</label>
						<p className="mt-1 text-gray-900">2313517</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Name
						</label>
						<p className="mt-1 text-gray-900">John Doe</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<p className="mt-1 text-gray-900">john.doe@example.com</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Phone
						</label>
						<p className="mt-1 text-gray-900">+27 123 456 789</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
