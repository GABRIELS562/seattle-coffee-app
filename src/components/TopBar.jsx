import React, { useState, useEffect } from "react";

const TopBar = () => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			setIsScrolled(scrollTop > window.innerHeight * 0.7); // Show solid nav after scrolling 70% of viewport
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<>
			{/* Hero Overlay Navigation */}
			<header className="absolute top-0 left-0 right-0 w-full z-50 bg-transparent" role="banner">
				<div className="bg-gradient-to-b from-black/30 to-transparent">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between h-12 sm:h-16 items-center">
							<div className="flex-shrink-0">
								<h1 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-helvetica font-semibold text-white text-shadow-md">
									<span className="hidden xs:inline">MY COFFEE FINDER APP</span>
									<span className="xs:hidden">☕ MY COFFEE</span>
								</h1>
							</div>
							<div className="text-xs sm:text-sm text-white/90 font-medium text-shadow-sm">
								Store Locator
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Sticky Navigation */}
			<header 
				className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
					isScrolled 
						? 'bg-brand-blue/95 backdrop-blur-sm shadow-lg translate-y-0' 
						: 'bg-transparent -translate-y-full'
				}`}
				role="banner"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-12 sm:h-14 items-center">
						<div className="flex-shrink-0">
							<h1 className="text-base xs:text-lg sm:text-xl font-helvetica font-semibold text-white">
								<span className="hidden xs:inline">MY COFFEE FINDER APP</span>
								<span className="xs:hidden">☕ MY COFFEE</span>
							</h1>
						</div>
						<div className="text-xs sm:text-sm text-white/90 font-medium">
							Store Locator
						</div>
					</div>
				</div>
			</header>
		</>
	);
};

export default TopBar;
