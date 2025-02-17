const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs/promises");
const path = require("path");

async function fetchStores() {
	try {
		console.log("🔍 Starting enhanced store location fetch...");

		// Try multiple possible endpoints and data sources
		const sources = [
			{
				url: "https://www.seattlecoffeecompany.co.za/find-a-store/",
				headers: { Accept: "text/html" },
			},
			{
				url: "https://www.seattlecoffeecompany.co.za/stores-json/",
				headers: { Accept: "application/json" },
			},
			{
				url: "https://www.seattlecoffeecompany.co.za/wp-json/api/stores",
				headers: { Accept: "application/json" },
			},
		];

		for (const source of sources) {
			try {
				console.log(`\n📡 Trying: ${source.url}`);

				const response = await axios.get(source.url, {
					headers: {
						...source.headers,
						"User-Agent":
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
						Referer: "https://www.seattlecoffeecompany.co.za",
					},
					timeout: 10000,
				});

				console.log(`✅ Got response [${response.status}]`);
				console.log(`📦 Size: ${response.data.length} bytes`);

				// Save raw response for inspection
				const dataDir = path.join(__dirname, "..", "src", "data");
				await fs.mkdir(dataDir, { recursive: true });

				const filename = `response-${new Date().getTime()}.json`;
				await fs.writeFile(
					path.join(dataDir, filename),
					typeof response.data === "string"
						? response.data
						: JSON.stringify(response.data, null, 2)
				);

				console.log(`💾 Saved response to ${filename}`);

				// If it's HTML, look for embedded data
				if (source.headers["Accept"] === "text/html") {
					const $ = cheerio.load(response.data);

					// Look for script tags with store data
					console.log("🔍 Searching for embedded data...");

					$("script").each((i, elem) => {
						const content = $(elem).html();
						if (content.includes("store") || content.includes("location")) {
							console.log(
								"Found potential data in script tag:",
								content.substring(0, 100) + "..."
							);
						}
					});

					// Save the full HTML for inspection
					await fs.writeFile(path.join(dataDir, "full-page.html"), $.html());
				}
			} catch (error) {
				console.log(`❌ Failed: ${error.message}`);
				if (error.response) {
					console.log(`Status: ${error.response.status}`);
					console.log("Headers:", error.response.headers);
				}
			}
		}

		console.log("\n📝 Check the data directory for captured responses");
		console.log("Next steps:");
		console.log("1. Inspect the responses to identify the correct data source");
		console.log("2. Adjust the scraper based on findings");
		console.log("3. Create a data processor for the identified format");
	} catch (error) {
		console.error("❌ Fatal error:", error.message);
	}
}

fetchStores();
