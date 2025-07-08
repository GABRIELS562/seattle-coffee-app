import React from "react";

const TopBar = () => {
	return (
		<div className="bg-brand-blue text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-12 sm:h-16 items-center">
					<div className="flex-shrink-0">
						<h1 className="text-lg sm:text-xl lg:text-2xl font-helvetica">
							<span className="hidden sm:inline">SEATTLE COFFEE CO</span>
							<span className="sm:hidden">☕ SEATTLE</span>
						</h1>
					</div>
					<div className="text-xs sm:text-sm opacity-75">
						Store Locator
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopBar;
