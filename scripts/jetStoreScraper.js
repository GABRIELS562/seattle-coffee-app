// scripts/jetStoreScraper.js
console.log("Script starting...");

const { chromium } = require("@playwright/test");

async function scrapeStores() {
	console.log("Starting store scraper...");
	let browser = null;

	try {
		console.log("Launching browser...");
		browser = await chromium.launch({
			headless: false,
		});

		console.log("Creating new context...");
		const context = await browser.newContext();

		console.log("Creating new page...");
		const page = await context.newPage();

		console.log("Navigating to store page...");
		await page.goto("https://www.seattlecoffeecompany.co.za/find-a-store/");

		console.log("Page loaded, waiting 5 seconds...");
		await new Promise((r) => setTimeout(r, 5000));

		await browser.close();
		console.log("Done!");
	} catch (error) {
		console.error("Error:", error);
		if (browser) {
			await browser.close();
		}
	}
}

// Call the function and handle any unhandled promise rejections
scrapeStores().catch((error) => {
	console.error("Unhandled error:", error);
	process.exit(1);
});

console.log("Script initialized");
