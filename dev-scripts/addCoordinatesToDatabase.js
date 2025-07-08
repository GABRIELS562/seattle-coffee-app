// Add Coordinates to Seattle Coffee Database
// This script takes map URLs and updates the database with coordinates

const fs = require('fs');

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

// Add your 293 map URLs here
const mapUrls = [
    // PASTE YOUR MAP URLs HERE
    // Format: "https://www.google.com/maps/place/...",
    // Example URLs (replace with your actual 293 URLs):
    "https://www.google.com/maps/place/20+Vineyard+Rd,+Claremont,+Cape+Town,+7708/@-33.9793815,18.4614803,17z/data=!3m1!4b1!4m5!3m4!1s0x1dcc42d1f8de77f7:0x7cb9a2754659731d!8m2!3d-33.979386!4d18.463669",
    // Add all 293 URLs here...
];

// Function to update database with coordinates
function addCoordinatesToDatabase() {
    console.log('🗺️  Adding coordinates to Seattle Coffee database...');
    
    const database = loadDatabase();
    const stores = database.stores;
    
    console.log(`📊 Database has ${stores.length} stores`);
    console.log(`📍 Processing ${mapUrls.length} map URLs`);
    
    if (mapUrls.length === 0) {
        console.log('❌ No map URLs provided. Please add your 293 URLs to the mapUrls array.');
        return;
    }
    
    let coordinatesAdded = 0;
    let urlsProcessed = 0;
    
    // Process each URL and try to match with stores
    mapUrls.forEach((url, index) => {
        urlsProcessed++;
        const coordinates = extractCoordinatesFromUrl(url);
        
        if (coordinates && index < stores.length) {
            const store = stores[index];
            
            // Update store with coordinates
            store.coordinates = coordinates;
            store.mapUrl = url;
            store.hasCoordinates = true;
            store.lastUpdated = new Date().toISOString();
            
            coordinatesAdded++;
            console.log(`✅ ${store.id}: ${store.name} - ${coordinates.lat}, ${coordinates.lng}`);
        } else if (!coordinates) {
            console.log(`⚠️  URL ${index + 1}: Could not extract coordinates`);
        }
    });
    
    // Update metadata and statistics
    database.metadata.storesWithCoordinates = coordinatesAdded;
    database.metadata.coordinateCompleteness = Math.round((coordinatesAdded / stores.length) * 100);
    database.metadata.lastUpdated = new Date().toISOString();
    
    // Regenerate statistics
    database.statistics = generateStatistics(stores);
    
    // Save updated database
    saveDatabaseFiles(database);
    
    console.log('\n🎉 COORDINATE UPDATE COMPLETE!');
    console.log('==============================');
    console.log(`📊 Total stores: ${stores.length}`);
    console.log(`🗺️  URLs processed: ${urlsProcessed}`);
    console.log(`✅ Coordinates added: ${coordinatesAdded}`);
    console.log(`📈 Coordinate completeness: ${database.metadata.coordinateCompleteness}%`);
    
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

// Test function with sample URLs
function testCoordinateExtraction() {
    console.log('🧪 Testing coordinate extraction...');
    
    const testUrls = [
        "https://www.google.com/maps/place/20+Vineyard+Rd,+Claremont,+Cape+Town,+7708/@-33.9793815,18.4614803,17z/data=!3m1!4b1!4m5!3m4!1s0x1dcc42d1f8de77f7:0x7cb9a2754659731d!8m2!3d-33.979386!4d18.463669",
        "https://www.google.com/maps/place/Seattle+Coffee+Company/@-26.133489,28.06893,21z/data=!4m5!3m4!1s0x1e950d1e82a3f45b:0xf3e44dc53bfc3d81!8m2!3d-26.1335004!4d28.0688962"
    ];
    
    testUrls.forEach((url, i) => {
        const coords = extractCoordinatesFromUrl(url);
        console.log(`Test ${i + 1}: ${coords ? `${coords.lat}, ${coords.lng}` : 'No coordinates'}`);
    });
}

// Instructions
console.log('🗺️  Seattle Coffee Company Coordinate Updater');
console.log('==============================================');
console.log('📝 To add coordinates to your database:');
console.log('');
console.log('1. Edit this file and add your 293 map URLs to the mapUrls array');
console.log('2. Run: node scripts/addCoordinatesToDatabase.js');
console.log('');
console.log('🧪 To test coordinate extraction: testCoordinateExtraction()');

// Run test by default
testCoordinateExtraction();

// Export for use
if (require.main === module) {
    if (mapUrls.length > 1) {
        addCoordinatesToDatabase();
    } else {
        console.log('\n⚠️  Add your 293 map URLs to the mapUrls array and run again.');
    }
}

module.exports = { 
    addCoordinatesToDatabase, 
    extractCoordinatesFromUrl, 
    testCoordinateExtraction 
};