// scripts/elementorScraper.js
const { chromium } = require("@playwright/test");
const fs = require("fs/promises");
const path = require("path");

async function scrapeStores() {
	let browser = null;

	try {
		console.log("🚀 Starting Elementor-specific scraper...");

		browser = await chromium.launch({
			headless: false,
			slowMo: 1000, // Slow down operations to handle dynamic content
		});

		const context = await browser.newContext();
		const page = await context.newPage();

		console.log("🌐 Navigating to store locator...");
		await page.goto("https://www.seattlecoffeecompany.co.za/find-a-store/", {
			waitUntil: "networkidle",
			timeout: 60000,
		});

		// Wait for Elementor content to load
		await page.waitForSelector(".elementor-widget-container", {
			timeout: 30000,
		});

		console.log("🔍 Searching for store information...");

		const storeData = await page.evaluate(() => {
			const stores = [];

			// Look for store information in Elementor sections
			document
				.querySelectorAll(".elementor-widget-container")
				.forEach((container) => {
					const text = container.textContent.trim();

					// Look for patterns that might indicate store information
					if (
						text.includes("Mall") ||
						text.includes("Shopping Centre") ||
						text.includes("Store")
					) {
						console.log("Found potential store text:", text);

						// Try to split address into components
						const lines = text
							.split("\n")
							.map((line) => line.trim())
							.filter((line) => line.length > 0);

						if (lines.length > 0) {
							stores.push({
								fullText: text,
								lines: lines,
							});
						}
					}
				});

			return stores;
		});

		console.log(`\n📊 Found ${storeData.length} potential store sections`);

		// Save the data
		const dataDir = path.join(__dirname, "..", "src", "data");
		await fs.mkdir(dataDir, { recursive: true });

		await fs.writeFile(
			path.join(dataDir, "raw-store-data.json"),
			JSON.stringify(storeData, null, 2)
		);

		// Take a full page screenshot
		await page.screenshot({
			path: path.join(dataDir, "full-page.png"),
			fullPage: true,
		});

		// Process the store data into a cleaner format
		const processedStores = storeData.map((store, index) => {
			const lines = store.lines;
			return {
				id: index + 1,
				name: lines[0] || "",
				address: lines.slice(1).join(", "),
				raw_text: store.fullText,
			};
		});

		// Save processed data
		const storesJs = `export const stores = ${JSON.stringify(processedStores, null, 2)};`;
		await fs.writeFile(path.join(dataDir, "stores.js"), storesJs);

		console.log("\n✅ Data saved:");
		console.log("1. raw-store-data.json - Raw scraped data");
		console.log("2. stores.js - Processed store data");
		console.log("3. full-page.png - Page screenshot");

		if (processedStores.length > 0) {
			console.log("\n📍 Sample store data:");
			console.log(processedStores[0]);
		}
	} catch (error) {
		console.error("❌ Error:", error.message);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

scrapeStores();
