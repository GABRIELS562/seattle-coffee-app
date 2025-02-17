const fs = require("fs/promises");
const path = require("path");

async function processStoreData() {
	try {
		console.log("🔄 Starting store data processing...");

		const dataDir = path.join(__dirname, "..", "src", "data");
		const files = await fs.readdir(dataDir);

		console.log("\n📂 Found files:", files);

		// Get all response files
		const responseFiles = files.filter((f) => f.startsWith("response-"));
		console.log(`\n🔍 Found ${responseFiles.length} response files`);

		// Try each response file until we find valid JSON
		for (const file of responseFiles) {
			console.log(`\n📖 Trying file: ${file}`);

			const rawData = await fs.readFile(path.join(dataDir, file), "utf-8");

			console.log(`📦 Size: ${rawData.length} bytes`);

			// Check if it starts with HTML
			if (
				rawData.trim().startsWith("<!DOCTYPE") ||
				rawData.trim().startsWith("<html")
			) {
				console.log("⚠️ Skipping HTML file");
				continue;
			}

			try {
				const data = JSON.parse(rawData);
				console.log("✅ Successfully parsed JSON data");

				if (Array.isArray(data)) {
					console.log(`📊 Found ${data.length} items`);
					if (data.length > 0) {
						console.log("📝 Sample store data:");
						console.log(JSON.stringify(data[0], null, 2));

						// Process stores into clean format
						const stores = data.map((store, index) => ({
							id: index + 1,
							name: store.name || store.title || store.store_name,
							address: store.address || store.location,
							coordinates: {
								lat: parseFloat(store.latitude || store.lat || 0),
								lng: parseFloat(store.longitude || store.lng || 0),
							},
							province: store.province || store.region,
							hours: store.trading_hours || store.hours,
							phone: store.phone || store.contact,
						}));

						// Save processed stores
						const storesJs = `export const stores = ${JSON.stringify(stores, null, 2)};`;
						await fs.writeFile(path.join(dataDir, "stores.js"), storesJs);

						console.log(`\n✅ Successfully processed ${stores.length} stores`);
						console.log("💾 Saved to stores.js");
						return;
					}
				} else {
					console.log("⚠️ Data is not an array, structure:", typeof data);
					console.log("Keys:", Object.keys(data));
				}
			} catch (parseError) {
				console.log(`❌ Not valid JSON: ${parseError.message}`);
				console.log("First 100 characters:", rawData.substring(0, 100));
			}
		}

		console.log("\n❌ No valid store data found in any response file");
	} catch (error) {
		console.error("❌ Error:", error.message);
	}
}

processStoreData();
