// Generate Complete Seattle Coffee Database with All 297 Stores
// This script processes all stores from the parsed data file

const fs = require('fs');

// Load the complete parsed store data
let parsedData;
try {
    parsedData = JSON.parse(fs.readFileSync('scripts/complete-parsed-stores.json', 'utf8'));
} catch (error) {
    console.error('❌ Error loading parsed store data:', error.message);
    process.exit(1);
}

const stores = parsedData.stores;
console.log(`🏗️ Processing ${stores.length} stores from complete dataset...`);

// Create the complete database
function createCompleteDatabase() {
    const completeStores = stores.map(store => {
        // Generate a slug from the store name
        const slug = store.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Generate search keywords
        const searchKeywords = new Set();
        
        if (store.name) {
            store.name.toLowerCase().split(/\s+/).forEach(word => {
                if (word.length > 2) searchKeywords.add(word);
            });
        }
        
        if (store.address) {
            store.address.toLowerCase().split(/[,\s]+/).forEach(word => {
                if (word.length > 2 && !word.match(/^\d+$/)) searchKeywords.add(word);
            });
        }

        // Categorize store type
        const category = categorizeStore(store.name, store.type);

        return {
            id: store.id,
            name: store.name,
            address: store.address,
            type: store.type,
            category: category,
            province: store.province,
            country: store.country,
            coordinates: store.coordinates, // Will be null for now
            mapUrl: null, // Will be added when map URLs are available
            hasCoordinates: false,
            hours: 'Mon-Sun: Hours vary by location',
            phone: null,
            email: null,
            amenities: [],
            slug: slug,
            searchKeywords: Array.from(searchKeywords).filter(k => k.length > 2),
            lastUpdated: new Date().toISOString(),
            dataSource: 'Seattle Coffee Official Website + Manual Extraction'
        };
    });

    // Generate statistics
    const statistics = generateStatistics(completeStores);
    
    // Generate metadata
    const metadata = {
        totalStores: completeStores.length,
        storesWithCoordinates: completeStores.filter(s => s.coordinates).length,
        coordinateCompleteness: Math.round((completeStores.filter(s => s.coordinates).length / completeStores.length) * 100),
        lastUpdated: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        dataSource: 'Seattle Coffee Company Official Website + Manual Extraction',
        countries: [...new Set(completeStores.map(s => s.country))].filter(Boolean),
        provinces: [...new Set(completeStores.map(s => s.province))].filter(Boolean)
    };

    return {
        metadata,
        statistics,
        stores: completeStores
    };
}

// Function to categorize store type
function categorizeStore(name, type) {
    const nameLower = (name || '').toLowerCase();
    const typeLower = (type || '').toLowerCase();
    
    if (typeLower.includes('cafe') || nameLower.includes('seattle coffee')) return 'cafe';
    if (nameLower.includes('freshstop')) return 'freshstop';
    if (nameLower.includes('food lover')) return 'food_lovers_market';
    if (nameLower.includes('astron energy')) return 'petrol_station';
    if (nameLower.includes('sasol')) return 'petrol_station';
    if (nameLower.includes('container')) return 'container_store';
    if (nameLower.includes('exclusive books')) return 'bookstore';
    if (nameLower.includes('mall') || nameLower.includes('centre')) return 'shopping_center';
    
    return 'coffee_shop';
}

// Generate statistics
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

// Function to save database files
function saveDatabaseFiles(database) {
    const outputDir = 'src/data';
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 1. Complete database
    fs.writeFileSync(
        `${outputDir}/seattleCoffeeComplete.json`, 
        JSON.stringify(database, null, 2)
    );
    console.log('✅ Generated: src/data/seattleCoffeeComplete.json');
    
    // 2. Stores only
    fs.writeFileSync(
        `${outputDir}/storesWithCoordinates.json`, 
        JSON.stringify(database.stores, null, 2)
    );
    console.log('✅ Generated: src/data/storesWithCoordinates.json');
    
    // 3. TypeScript file
    const tsContent = generateTypeScriptFile(database);
    fs.writeFileSync(`${outputDir}/seattleCoffeeComplete.ts`, tsContent);
    console.log('✅ Generated: src/data/seattleCoffeeComplete.ts');
    
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
    console.log('✅ Generated: src/data/storesLightweight.json');
}

function generateTypeScriptFile(database) {
    return `// Seattle Coffee Company Complete Database
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

export function searchStores(query: string): Store[] {
  const searchTerm = query.toLowerCase();
  return stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm) ||
    store.address.toLowerCase().includes(searchTerm) ||
    store.province.toLowerCase().includes(searchTerm) ||
    store.searchKeywords.some(keyword => keyword.includes(searchTerm))
  );
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

// Run the complete database generation
console.log('🚀 Creating complete Seattle Coffee database with all stores...');

try {
    const completeDatabase = createCompleteDatabase();
    
    console.log('\n🎉 DATABASE CREATION COMPLETE!');
    console.log('==============================');
    console.log(`📊 Total stores: ${completeDatabase.statistics.total}`);
    console.log(`🗺️  With coordinates: ${completeDatabase.statistics.withCoordinates}`);
    console.log(`📈 Coordinate completeness: ${completeDatabase.statistics.coordinateCompleteness}%`);
    console.log(`🌍 Countries: ${completeDatabase.metadata.countries.join(', ')}`);
    console.log(`📍 Provinces: ${completeDatabase.metadata.provinces.length}`);
    
    // Show top provinces
    console.log('\n🏆 Top 10 Provinces:');
    completeDatabase.statistics.topProvinces.forEach((p, i) => {
        console.log(`${i + 1}. ${p.province}: ${p.count} stores`);
    });
    
    // Show categories
    console.log('\n🏪 Store Categories:');
    completeDatabase.statistics.categories.forEach((c, i) => {
        console.log(`${i + 1}. ${c.category}: ${c.count} stores`);
    });
    
    // Save all database files
    saveDatabaseFiles(completeDatabase);
    
    console.log('\n📁 Generated files:');
    console.log('  - src/data/seattleCoffeeComplete.json (full database)');
    console.log('  - src/data/storesWithCoordinates.json (stores array)');
    console.log('  - src/data/seattleCoffeeComplete.ts (TypeScript)');
    console.log('  - src/data/storesLightweight.json (essential data)');
    
    console.log('\n✅ Your complete Seattle Coffee database is ready!');
    console.log(`🎯 Successfully processed all ${completeDatabase.stores.length} stores.`);
    console.log('\n📝 Next steps:');
    console.log('1. To add coordinates, run the coordinate extraction script with your 293 map URLs');
    console.log('2. The database is ready for use in your app');
    
} catch (error) {
    console.error('❌ Error creating database:', error.message);
}