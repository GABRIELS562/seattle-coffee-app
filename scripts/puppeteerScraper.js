const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const path = require("path");

async function scrapeStores() {
	try {
		console.log("🚀 Launching browser...");
		const browser = await puppeteer.launch({
			headless: "new",
			defaultViewport: { width: 1920, height: 1080 },
		});

		const page = await browser.newPage();

		// Set a reasonable timeout
		page.setDefaultTimeout(30000);

		console.log("🌐 Navigating to store locator...");
		await page.goto("https://www.seattlecoffeecompany.co.za/find-a-store/", {
			waitUntil: "networkidle0",
		});

		// Wait for and log all network requests
		page.on("request", (request) => {
			console.log(`📡 Request: ${request.url()}`);
		});

		// Wait for store elements to load
		console.log("⏳ Waiting for store data to load...");
		await page.waitForSelector('.store-list, .store-locator, [class*="store"]');

		// Extract store data
		const stores = await page.evaluate(() => {
			const storeElements = document.querySelectorAll(
				'.store-list .store, .store-item, [class*="store-container"]'
			);

			return Array.from(storeElements).map((element) => {
				// Log the HTML structure we're working with
				console.log("Store element HTML:", element.outerHTML);

				return {
					name: element
						.querySelector('h3, .store-name, [class*="name"]')
						?.textContent.trim(),
					address: element
						.querySelector('.address, [class*="address"]')
						?.textContent.trim(),
					hours: element
						.querySelector('.hours, [class*="hours"]')
						?.textContent.trim(),
					// Try to find coordinates in data attributes or hidden fields
					coordinates: {
						lat:
							element.getAttribute("data-lat") ||
							element.querySelector("[data-lat]")?.getAttribute("data-lat"),
						lng:
							element.getAttribute("data-lng") ||
							element.querySelector("[data-lng]")?.getAttribute("data-lng"),
					},
				};
			});
		});

		console.log(`\n📊 Found ${stores.length} stores`);

		// Save the raw HTML for inspection
		const html = await page.content();
		const dataDir = path.join(__dirname, "..", "src", "data");
		await fs.mkdir(dataDir, { recursive: true });

		await fs.writeFile(path.join(dataDir, "puppeteer-page.html"), html);

		// Save store data
		if (stores.length > 0) {
			const storesData = `export const stores = ${JSON.stringify(stores, null, 2)};`;
			await fs.writeFile(path.join(dataDir, "stores.js"), storesData);

			console.log("💾 Saved store data to stores.js");
			console.log("\n📝 Sample store data:");
			console.log(stores[0]);
		} else {
			console.log(
				"⚠️ No stores found. Check puppeteer-page.html for the page structure"
			);
		}

		await browser.close();
		console.log("\n✅ Scraping complete");
	} catch (error) {
		console.error("❌ Error:", error.message);
	}
}

scrapeStores();
