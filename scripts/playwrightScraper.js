// scripts/playwrightScraper.js
const { chromium } = require("@playwright/test");
const fs = require("fs/promises");
const path = require("path");

async function scrapeStores() {
	let browser = null;

	try {
		console.log("🚀 Starting enhanced store scraper...");

		browser = await chromium.launch({
			headless: false,
		});

		const context = await browser.newContext();
		const page = await context.newPage();

		// Listen for all network requests
		page.on("request", (request) => {
			console.log(`📡 ${request.method()} ${request.url()}`);
		});

		// Listen for XHR/fetch responses
		page.on("response", async (response) => {
			const url = response.url();
			const contentType = response.headers()["content-type"] || "";

			if (contentType.includes("application/json")) {
				try {
					const json = await response.json();
					console.log("📥 JSON Response from:", url);
					console.log(json);
				} catch (e) {
					// Not JSON data
				}
			}
		});

		console.log("🌐 Navigating to store locator...");
		await page.goto("https://www.seattlecoffeecompany.co.za/find-a-store/");

		// Wait for any dynamic content
		await page.waitForLoadState("networkidle");
		console.log("✅ Page loaded");

		// Look for embedded store data in scripts
		const storeData = await page.evaluate(() => {
			const results = {
				scriptData: [],
				elementData: [],
			};

			// Check script tags for embedded data
			document.querySelectorAll("script").forEach((script) => {
				const content = script.textContent;
				if (
					content &&
					(content.includes("store") ||
						content.includes("location") ||
						content.includes("branch"))
				) {
					results.scriptData.push(content);
				}
			});

			// Check for store elements with specific attributes
			document
				.querySelectorAll(
					'[data-store], [data-location], [class*="store"], [class*="location"]'
				)
				.forEach((element) => {
					results.elementData.push({
						html: element.outerHTML,
						text: element.textContent,
						dataset: JSON.stringify(element.dataset),
						attributes: Object.values(element.attributes)
							.map((attr) => `${attr.name}="${attr.value}"`)
							.join(" "),
					});
				});

			return results;
		});

		const dataDir = path.join(__dirname, "..", "src", "data");
		await fs.mkdir(dataDir, { recursive: true });

		// Save the full page for analysis
		await fs.writeFile(path.join(dataDir, "page.html"), await page.content());

		// Save any found store data
		await fs.writeFile(
			path.join(dataDir, "store-data.json"),
			JSON.stringify(storeData, null, 2)
		);

		// Take a screenshot
		await page.screenshot({
			path: path.join(dataDir, "page.png"),
			fullPage: true,
		});

		console.log("\n📊 Results:");
		console.log(
			`Found ${storeData.scriptData.length} potential script data sources`
		);
		console.log(
			`Found ${storeData.elementData.length} potential store elements`
		);

		console.log("\n💡 Next steps:");
		console.log("1. Check store-data.json for embedded data");
		console.log("2. Analyze page.html for store information");
		console.log("3. Look at page.png to verify correct page load");
	} catch (error) {
		console.error("❌ Error:", error.message);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

scrapeStores();
