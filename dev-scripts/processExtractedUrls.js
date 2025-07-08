// Process Extracted URLs and Add Coordinates to Database
// This script takes the 293 URLs you extracted and updates the database

const fs = require('fs');

// The 293 map URLs you extracted from the browser
const extractedMapUrls = [
    "https://www.google.com/maps/place/20+Vineyard+Rd,+Claremont,+Cape+Town,+7708/@-33.9793815,18.4614803,17z/data=!3m1!4b1!4m5!3m4!1s0x1dcc42d1f8de77f7:0x7cb9a2754659731d!8m2!3d-33.979386!4d18.463669",
    "https://www.google.com/maps/place/FreshStop+at+Caltex+45th+Cutting/@-29.8328006,30.9670958,17z/data=!3m1!4b1!4m5!3m4!1s0x1ef7012fb0f7eb11:0xcd09a255a3db5f20!8m2!3d-29.8328053!4d30.9692845",
    "https://www.google.com/maps/place/FreshStop+at+Caltex+A+Club+Motors/@-25.7602088,28.2444596,18.1z/data=!4m12!1m6!3m5!1s0x1e956114fd659acf:0x24dd0fa37c94c1d9!2sFreshStop+at+Caltex+A+Club+Motors!8m2!3d-25.7602729!4d28.2449878!3m4!1s0x1e956114fd659acf:0x24dd0fa37c94c1d9!8m2!3d-25.7602729!4d28.2449878",
    "https://www.google.com/maps/place/FNB+Bank+ATM+Access+Retail+Park/@-33.991283,25.5475841,17z/data=!3m1!4b1!4m5!3m4!1s0x1e7ad1e44b3c6091:0xcf16c115a90f26bb!8m2!3d-33.9912875!4d25.5520688",
    "https://www.google.com/maps/place/FreshStop+Airport+City/@-33.9735889,18.5853692,16z/data=!4m10!1m2!2m1!1sCnr+Borcherds+Quarry+Road,+Montreal+Drive,+Airport+City+Precinct+Cape+Town+7525!3m6!1s0x1dcc4515b77df7f9:0x6e07150d74b74ee7!8m2!3d-33.9779395!4d18.5895096!15sCk9DbnIgQm9yY2hlcmRzIFF1YXJyeSBSb2FkLCBNb250cmVhbCBEcml2ZSwgQWlycG9ydCBDaXR5IFByZWNpbmN0IENhcGUgVG93biA3NTI1Wk8iTWNuciBib3JjaGVyZHMgcXVhcnJ5IHJvYWQgbW9udHJlYWwgZHJpdmUgYWlycG9ydCBjaXR5IHByZWNpbmN0IGNhcGUgdG93biA3NTI1kgENbWVhbF90YWtlYXdheZoBI0NoWkRTVWhOTUc5blMwVkpRMEZuU1VSMVoxcHVaRUozRUFF4AEA!16s%2Fg%2F11btwtcslj?entry=ttu&g_ep=EgoyMDI0MDkwNC4wIKXMDSoASAFQAw%3D%3D",
    // ... I'll need you to paste the complete array here
];

// Load existing database
function loadDatabase() {
    try {
        return JSON.parse(fs.readFileSync('src/data/seattleCoffeeComplete.json', 'utf8'));
    } catch (error) {
        console.error('❌ Error loading database:', error.message);
        process.exit(1);
    }
}

// Extract coordinates from Google Maps URL
function extractCoordinatesFromUrl(url) {
    if (!url) return null;
    
    const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        /3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
        /lat=(-?\d+\.?\d*).*lng=(-?\d+\.?\d*)/,
        /latitude=(-?\d+\.?\d*).*longitude=(-?\d+\.?\d*)/,
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            // Validate coordinates for South Africa/Namibia region
            if (lat >= -35 && lat <= -15 && lng >= 15 && lng <= 35) {
                return { lat, lng };
            }
        }
    }
    
    return null;
}

// Extract store name from URL
function extractStoreNameFromUrl(url) {
    try {
        const match = url.match(/\/place\/([^/@]+)/);
        if (match) {
            let name = decodeURIComponent(match[1]);
            name = name.replace(/\+/g, ' ');
            return name;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// Main function to add coordinates
function processUrlsAndAddCoordinates() {
    console.log('🚀 Processing 293 extracted URLs and adding coordinates...');
    
    const database = loadDatabase();
    const stores = database.stores;
    
    console.log(`📊 Database has ${stores.length} stores`);
    console.log(`📍 Processing ${extractedMapUrls.length} extracted URLs`);
    
    let coordinatesAdded = 0;
    let urlsProcessed = 0;
    
    // Process each URL and match with stores
    extractedMapUrls.forEach((url, index) => {
        urlsProcessed++;
        
        const coordinates = extractCoordinatesFromUrl(url);
        const urlStoreName = extractStoreNameFromUrl(url);
        
        if (coordinates && index < stores.length) {
            const store = stores[index];
            
            // Update store with coordinates and map URL
            store.coordinates = coordinates;
            store.mapUrl = url;
            store.hasCoordinates = true;
            store.lastUpdated = new Date().toISOString();
            
            // If the store name from URL is more descriptive, use it
            if (urlStoreName && urlStoreName.length > store.name.length) {
                store.originalName = store.name;
                store.name = urlStoreName;
            }
            
            coordinatesAdded++;
            console.log(`✅ ${store.id}: ${store.name} - ${coordinates.lat}, ${coordinates.lng}`);
        } else if (!coordinates) {
            console.log(`⚠️  URL ${index + 1}: Could not extract coordinates`);
        }
        
        // Progress update every 50 stores
        if ((index + 1) % 50 === 0) {
            console.log(`📍 Processed ${index + 1}/${extractedMapUrls.length} URLs...`);
        }
    });
    
    // Update metadata and statistics
    database.metadata.storesWithCoordinates = coordinatesAdded;
    database.metadata.coordinateCompleteness = Math.round((coordinatesAdded / stores.length) * 100);
    database.metadata.lastUpdated = new Date().toISOString();
    database.metadata.dataSource = 'Seattle Coffee Company Official Website + Browser Extraction + Coordinate Processing';
    
    // Regenerate statistics
    database.statistics = generateStatistics(stores);
    
    // Save updated database
    saveDatabaseFiles(database);
    
    console.log('\n🎉 COORDINATE PROCESSING COMPLETE!');
    console.log('===================================');
    console.log(`📊 Total stores: ${stores.length}`);
    console.log(`🗺️  URLs processed: ${urlsProcessed}`);
    console.log(`✅ Coordinates added: ${coordinatesAdded}`);
    console.log(`📈 Coordinate completeness: ${database.metadata.coordinateCompleteness}%`);
    
    console.log('\n📋 SUMMARY BY CATEGORY:');
    database.statistics.categories.forEach((cat, i) => {
        console.log(`${i + 1}. ${cat.category}: ${cat.count} stores`);
    });
    
    console.log('\n🏆 TOP PROVINCES:');
    database.statistics.topProvinces.slice(0, 5).forEach((prov, i) => {
        console.log(`${i + 1}. ${prov.province}: ${prov.count} stores`);
    });
    
    return database;
}

// Generate updated statistics
function generateStatistics(stores) {
    const stats = {
        total: stores.length,
        withCoordinates: stores.filter(s => s.coordinates).length,
        withoutCoordinates: stores.filter(s => !s.coordinates).length,
        coordinateCompleteness: 0,
        byCategory: {},
        byProvince: {},
        byCountry: {},
        topProvinces: [],
        categories: []
    };
    
    stats.coordinateCompleteness = Math.round((stats.withCoordinates / stats.total) * 100);
    
    stores.forEach(store => {
        // Group by category
        const category = store.category;
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        // Group by province
        const province = store.province || 'Unknown';
        stats.byProvince[province] = (stats.byProvince[province] || 0) + 1;
        
        // Group by country
        const country = store.country || 'Unknown';
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
    });
    
    stats.topProvinces = Object.entries(stats.byProvince)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([province, count]) => ({ province, count }));
    
    stats.categories = Object.entries(stats.byCategory)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => ({ category, count }));
    
    return stats;
}

// Save updated database files
function saveDatabaseFiles(database) {
    const outputDir = 'src/data';
    
    // 1. Complete database
    fs.writeFileSync(
        `${outputDir}/seattleCoffeeComplete.json`, 
        JSON.stringify(database, null, 2)
    );
    console.log('✅ Updated: src/data/seattleCoffeeComplete.json');
    
    // 2. Stores only
    fs.writeFileSync(
        `${outputDir}/storesWithCoordinates.json`, 
        JSON.stringify(database.stores, null, 2)
    );
    console.log('✅ Updated: src/data/storesWithCoordinates.json');
    
    // 3. TypeScript file
    const tsContent = generateTypeScriptFile(database);
    fs.writeFileSync(`${outputDir}/seattleCoffeeComplete.ts`, tsContent);
    console.log('✅ Updated: src/data/seattleCoffeeComplete.ts');
    
    // 4. Lightweight version
    const lightweightStores = database.stores.map(store => ({
        id: store.id,
        name: store.name,
        address: store.address,
        category: store.category,
        province: store.province,
        country: store.country,
        coordinates: store.coordinates,
        hasCoordinates: store.hasCoordinates
    }));
    
    fs.writeFileSync(
        `${outputDir}/storesLightweight.json`, 
        JSON.stringify(lightweightStores, null, 2)
    );
    console.log('✅ Updated: src/data/storesLightweight.json');
}

function generateTypeScriptFile(database) {
    return `// Seattle Coffee Company Complete Database with Coordinates
// Auto-generated on ${new Date().toISOString()}
// Total stores: ${database.stores.length}
// With coordinates: ${database.statistics.withCoordinates} (${database.statistics.coordinateCompleteness}%)

export interface Store {
  id: number;
  name: string;
  address: string;
  type?: string;
  category: string;
  province: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  mapUrl: string | null;
  hasCoordinates: boolean;
  hours?: string;
  phone?: string;
  email?: string;
  amenities: string[];
  slug: string;
  searchKeywords: string[];
  lastUpdated: string;
  dataSource: string;
}

export const stores: Store[] = ${JSON.stringify(database.stores, null, 2)};

export const metadata = ${JSON.stringify(database.metadata, null, 2)};

export const statistics = ${JSON.stringify(database.statistics, null, 2)};

// Helper functions
export function findStoreById(id: number): Store | undefined {
  return stores.find(store => store.id === id);
}

export function findStoresByProvince(province: string): Store[] {
  return stores.filter(store => 
    store.province.toLowerCase().includes(province.toLowerCase())
  );
}

export function findStoresByCategory(category: string): Store[] {
  return stores.filter(store => store.category === category);
}

export function getStoresWithCoordinates(): Store[] {
  return stores.filter(store => store.coordinates !== null);
}

export function findNearestStores(
  userLocation: { lat: number; lng: number }, 
  limit: number = 5
): Store[] {
  const storesWithDistance = stores
    .filter(store => store.coordinates)
    .map(store => ({
      ...store,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.coordinates!.lat,
        store.coordinates!.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance);
    
  return storesWithDistance.slice(0, limit);
}

export function searchStores(query: string): Store[] {
  const searchTerm = query.toLowerCase();
  return stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm) ||
    store.address.toLowerCase().includes(searchTerm) ||
    store.province.toLowerCase().includes(searchTerm) ||
    store.searchKeywords.some(keyword => keyword.includes(searchTerm))
  );
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default { stores, metadata, statistics };
`;
}

// Instructions and test
console.log('🗺️  Seattle Coffee Company URL Processor');
console.log('==========================================');
console.log('⚠️  IMPORTANT: This file contains only 5 sample URLs.');
console.log('📝 To process all 293 URLs:');
console.log('1. Replace the extractedMapUrls array with your complete 293 URLs');
console.log('2. Run: node scripts/processExtractedUrls.js');
console.log('');

// Test with sample URLs
if (extractedMapUrls.length <= 5) {
    console.log('🧪 Testing coordinate extraction with sample URLs...');
    extractedMapUrls.forEach((url, i) => {
        const coords = extractCoordinatesFromUrl(url);
        const name = extractStoreNameFromUrl(url);
        console.log(`Test ${i + 1}: ${name} - ${coords ? `${coords.lat}, ${coords.lng}` : 'No coordinates'}`);
    });
    console.log('\n⚠️  Add all 293 URLs to process the complete database.');
} else {
    processUrlsAndAddCoordinates();
}

module.exports = { 
    processUrlsAndAddCoordinates, 
    extractCoordinatesFromUrl, 
    extractStoreNameFromUrl 
};