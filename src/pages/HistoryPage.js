import React from "react";

const HistoryPage = () => {
	const transactions = [
		{ id: 1, date: "2024-02-17", store: "Sandton City", amount: "R 48.00" },
		{ id: 2, date: "2024-02-15", store: "Rosebank", amount: "R 32.00" },
	];

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">Transaction History</h2>
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Date
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Store
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Amount
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{transactions.map((transaction) => (
							<tr key={transaction.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									{transaction.date}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{transaction.store}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{transaction.amount}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default HistoryPage;
