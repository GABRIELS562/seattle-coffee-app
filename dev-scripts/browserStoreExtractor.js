// Seattle Coffee Company Complete Store & Coordinate Extractor
// Run this script in the browser console on the Seattle Coffee store locator page
// This will extract all store info + coordinates from map links

console.log('🏪 Seattle Coffee Company Store & Coordinate Extractor');
console.log('=======================================================');

// Function to extract all store data including coordinates
function extractAllStoreData() {
    console.log('🚀 Starting complete store extraction...');
    
    const allData = [];
    let mapLinkCount = 0;
    let coordinateCount = 0;
    
    // Find all "View on map" links
    const mapLinks = document.querySelectorAll('a[href*="google.com/maps"], a[href*="maps.google.com"]');
    
    console.log(`📍 Found ${mapLinks.length} map links`);
    
    if (mapLinks.length === 0) {
        console.log('❌ No map links found. Make sure you\'re on the store locator page.');
        return [];
    }
    
    mapLinks.forEach((link, index) => {
        mapLinkCount++;
        
        // Extract coordinates from the URL
        const coordinates = extractCoordinatesFromUrl(link.href);
        if (coordinates) coordinateCount++;
        
        // Find the store container
        const storeContainer = findStoreContainer(link);
        
        // Extract store information
        const storeInfo = extractStoreInfo(storeContainer, index + 1);
        
        const store = {
            id: index + 1,
            name: storeInfo.name,
            address: storeInfo.address,
            type: storeInfo.type,
            category: categorizeStore(storeInfo.name),
            province: extractProvince(storeInfo.address),
            country: extractCountry(storeInfo.address),
            coordinates: coordinates,
            mapUrl: link.href,
            hasCoordinates: !!coordinates,
            hours: storeInfo.hours,
            phone: storeInfo.phone,
            email: storeInfo.email,
            amenities: [],
            lastUpdated: new Date().toISOString(),
            dataSource: 'Seattle Coffee Company Official Website - Browser Extraction'
        };
        
        allData.push(store);
        
        // Log progress
        const coordText = coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'No coordinates';
        console.log(`${index + 1}. ${store.name} - ${coordText}`);
    });
    
    // Display results
    console.log('\n🎯 EXTRACTION COMPLETE!');
    console.log('======================');
    console.log(`📊 Total stores: ${allData.length}`);
    console.log(`🗺️  Map links found: ${mapLinkCount}`);
    console.log(`✅ With coordinates: ${coordinateCount}`);
    console.log(`📈 Coordinate success rate: ${Math.round((coordinateCount / mapLinkCount) * 100)}%`);
    
    // Copy to clipboard if possible
    try {
        const jsonData = JSON.stringify(allData, null, 2);
        navigator.clipboard.writeText(jsonData).then(() => {
            console.log('\n📋 Complete store data copied to clipboard!');
        }).catch(() => {
            console.log('\n⚠️  Could not copy to clipboard');
        });
    } catch (e) {
        console.log('\n⚠️  Clipboard not available');
    }
    
    console.log('\n📤 COMPLETE JSON DATA:');
    console.log(JSON.stringify(allData, null, 2));
    
    return allData;
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
            
            // Validate coordinates are in South Africa/Namibia region
            if (lat >= -35 && lat <= -15 && lng >= 15 && lng <= 35) {
                return { lat, lng };
            }
        }
    }
    
    return null;
}

// Find the store container for a map link
function findStoreContainer(mapLink) {
    let container = mapLink;
    
    // Go up the DOM tree to find a suitable container
    for (let i = 0; i < 5; i++) {
        container = container.parentElement;
        if (!container) break;
        
        const text = container.textContent || '';
        
        // Check if this looks like a store container
        if (text.length > 50 && text.length < 1000 && 
            (text.includes('FreshStop') || text.includes('Coffee') || 
             text.includes('Sasol') || text.includes('Food Lover') ||
             text.includes('Astron') || text.includes('Mall'))) {
            return container;
        }
    }
    
    return mapLink.parentElement || mapLink;
}

// Extract store information from container
function extractStoreInfo(container, id) {
    const text = container.textContent || '';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let name = '';
    let address = '';
    let type = '';
    let hours = '';
    let phone = '';
    let email = '';
    
    // Extract store name (usually the first substantial line)
    for (const line of lines) {
        if (line.length > 5 && line.length < 100 && 
            !line.includes('View on map') && !line.includes('Info') &&
            (line.includes('FreshStop') || line.includes('Coffee') || 
             line.includes('Sasol') || line.includes('Food Lover') ||
             line.includes('Astron') || line.includes('Mall') ||
             line.includes('Centre') || line.includes('Container') ||
             line.includes('Books'))) {
            name = line;
            break;
        }
    }
    
    // Extract address (look for patterns with numbers and street names)
    for (const line of lines) {
        if (line.match(/\d+.*(?:street|st|avenue|ave|road|rd|drive|dr|way|blvd|lane|ln|cnr)/i) ||
            line.match(/\d{4}/) || // Postal code
            line.includes(',')) { // Address usually has commas
            address = line;
            break;
        }
    }
    
    // Extract phone number
    const phoneMatch = text.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}|\(\d{3}\)\s*\d{3}-\d{4}/);
    if (phoneMatch) {
        phone = phoneMatch[0];
    }
    
    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        email = emailMatch[0];
    }
    
    // Extract hours
    const hourMatch = text.match(/\d{1,2}:\d{2}\s*(?:am|pm)?\s*-\s*\d{1,2}:\d{2}\s*(?:am|pm)?/i);
    if (hourMatch) {
        hours = hourMatch[0];
    }
    
    // Determine type from context
    if (text.toLowerCase().includes('take away')) type = 'take away';
    else if (text.toLowerCase().includes('cafe')) type = 'cafe';
    else type = 'store';
    
    return {
        name: name || `Store ${id}`,
        address: address || 'Address not available',
        type: type,
        hours: hours,
        phone: phone,
        email: email
    };
}

// Categorize store type
function categorizeStore(name) {
    if (!name) return 'coffee_shop';
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('freshstop')) return 'freshstop';
    if (nameLower.includes('food lover')) return 'food_lovers_market';
    if (nameLower.includes('astron energy')) return 'petrol_station';
    if (nameLower.includes('sasol')) return 'petrol_station';
    if (nameLower.includes('container')) return 'container_store';
    if (nameLower.includes('exclusive books')) return 'bookstore';
    if (nameLower.includes('mall') || nameLower.includes('centre')) return 'shopping_center';
    if (nameLower.includes('seattle coffee')) return 'cafe';
    
    return 'coffee_shop';
}

// Extract province from address
function extractProvince(address) {
    if (!address) return 'Unknown';
    
    const addressLower = address.toLowerCase();
    
    // Direct province matches
    if (addressLower.includes('western cape')) return 'Western Cape';
    if (addressLower.includes('gauteng')) return 'Gauteng';
    if (addressLower.includes('kwazulu-natal')) return 'KwaZulu-Natal';
    if (addressLower.includes('eastern cape')) return 'Eastern Cape';
    if (addressLower.includes('free state')) return 'Free State';
    if (addressLower.includes('northern cape')) return 'Northern Cape';
    if (addressLower.includes('north west')) return 'North West';
    if (addressLower.includes('limpopo')) return 'Limpopo';
    if (addressLower.includes('mpumalanga')) return 'Mpumalanga';
    if (addressLower.includes('namibia')) return 'Namibia';
    
    // City-based province inference
    if (addressLower.includes('cape town') || addressLower.includes('stellenbosch')) return 'Western Cape';
    if (addressLower.includes('johannesburg') || addressLower.includes('pretoria') || 
        addressLower.includes('sandton') || addressLower.includes('midrand')) return 'Gauteng';
    if (addressLower.includes('durban') || addressLower.includes('pietermaritzburg')) return 'KwaZulu-Natal';
    if (addressLower.includes('port elizabeth') || addressLower.includes('east london')) return 'Eastern Cape';
    if (addressLower.includes('bloemfontein')) return 'Free State';
    if (addressLower.includes('kimberley')) return 'Northern Cape';
    if (addressLower.includes('polokwane')) return 'Limpopo';
    if (addressLower.includes('nelspruit')) return 'Mpumalanga';
    if (addressLower.includes('windhoek')) return 'Namibia';
    
    return 'Unknown';
}

// Extract country from address
function extractCountry(address) {
    if (!address) return 'South Africa';
    
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('namibia') || addressLower.includes('windhoek')) return 'Namibia';
    
    return 'South Africa';
}

// Quick test function
function quickTest() {
    console.log('🧪 Testing coordinate extraction...');
    
    const testUrls = [
        "https://www.google.com/maps/place/20+Vineyard+Rd,+Claremont,+Cape+Town,+7708/@-33.9793815,18.4614803,17z",
        "https://www.google.com/maps/place/Seattle+Coffee+Company/@-26.133489,28.06893,21z"
    ];
    
    testUrls.forEach((url, i) => {
        const coords = extractCoordinatesFromUrl(url);
        console.log(`Test ${i + 1}: ${coords ? `${coords.lat}, ${coords.lng}` : 'No coordinates'}`);
    });
}

// Auto-run instructions
console.log('📋 Available functions:');
console.log('  🔥 extractAllStoreData() - Extract all stores with coordinates and info');
console.log('  🧪 quickTest() - Test coordinate extraction');
console.log('');
console.log('💡 To extract all data: extractAllStoreData()');
console.log('⚠️  Make sure you\'re on the Seattle Coffee store locator page!');

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        extractAllStoreData, 
        extractCoordinatesFromUrl, 
        quickTest 
    };
}