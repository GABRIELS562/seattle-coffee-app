// Enhanced Seattle Coffee Store Extractor with Easy Data Export
// Run this in browser console - it handles copying and downloading automatically

console.log('🏪 Enhanced Seattle Coffee Store Extractor');
console.log('==========================================');

// Enhanced extraction function with automatic copying
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
        
        // Log progress every 10 stores
        if ((index + 1) % 10 === 0 || index === mapLinks.length - 1) {
            console.log(`📍 Processed ${index + 1}/${mapLinks.length} stores...`);
        }
    });
    
    // Display results
    console.log('\n🎯 EXTRACTION COMPLETE!');
    console.log('======================');
    console.log(`📊 Total stores: ${allData.length}`);
    console.log(`🗺️  Map links found: ${mapLinkCount}`);
    console.log(`✅ With coordinates: ${coordinateCount}`);
    console.log(`📈 Coordinate success rate: ${Math.round((coordinateCount / mapLinkCount) * 100)}%`);
    
    // Store data globally for easy access
    window.seattleStoreData = allData;
    window.mapUrls = allData.map(store => store.mapUrl);
    
    console.log('\n📋 DATA SAVED TO GLOBAL VARIABLES:');
    console.log('  📊 window.seattleStoreData - Complete store data');
    console.log('  🗺️  window.mapUrls - Just the map URLs');
    
    // Try multiple copy methods
    copyDataToClipboard(allData);
    
    // Offer download options
    console.log('\n💾 DOWNLOAD OPTIONS:');
    console.log('  📁 downloadCompleteData() - Download complete store data');
    console.log('  🗺️  downloadMapUrls() - Download just the map URLs');
    console.log('  📝 downloadForScript() - Download URLs formatted for script');
    
    return allData;
}

// Multiple clipboard copy attempts
function copyDataToClipboard(data) {
    const jsonData = JSON.stringify(data, null, 2);
    
    // Method 1: Modern clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonData).then(() => {
            console.log('✅ Complete store data copied to clipboard!');
        }).catch(() => {
            console.log('⚠️  Clipboard API failed, trying fallback...');
            fallbackCopy(jsonData);
        });
    } else {
        fallbackCopy(jsonData);
    }
    
    // Method 2: Console copy command
    try {
        if (typeof copy === 'function') {
            copy(data);
            console.log('✅ Data also copied using console copy() command');
        }
    } catch (e) {
        // copy() not available in all browsers
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('✅ Data copied using fallback method');
    } catch (err) {
        console.log('❌ Could not copy to clipboard');
        console.log('📝 Please manually copy the JSON data from the console output');
    }
    
    document.body.removeChild(textArea);
}

// Download functions
function downloadCompleteData() {
    if (!window.seattleStoreData) {
        console.log('❌ No data available. Run extractAllStoreData() first.');
        return;
    }
    
    downloadJSON(window.seattleStoreData, 'seattle-coffee-complete-data');
    console.log('📁 Complete store data downloaded!');
}

function downloadMapUrls() {
    if (!window.mapUrls) {
        console.log('❌ No URLs available. Run extractAllStoreData() first.');
        return;
    }
    
    downloadJSON(window.mapUrls, 'seattle-coffee-map-urls');
    console.log('🗺️  Map URLs downloaded!');
}

function downloadForScript() {
    if (!window.mapUrls) {
        console.log('❌ No URLs available. Run extractAllStoreData() first.');
        return;
    }
    
    // Format as JavaScript array for easy pasting into script
    const jsArray = 'const mapUrls = ' + JSON.stringify(window.mapUrls, null, 2) + ';';
    
    downloadText(jsArray, 'seattle-coffee-urls-for-script.js');
    console.log('📝 URLs formatted for script downloaded!');
}

// Utility function to download JSON
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonStr);
    
    const exportFileDefaultName = filename + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Utility function to download text
function downloadText(text, filename) {
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(text);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();
}

// Copy specific data types
function copyMapUrls() {
    if (!window.mapUrls) {
        console.log('❌ No URLs available. Run extractAllStoreData() first.');
        return;
    }
    
    const urlsText = window.mapUrls.join('\n');
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(urlsText).then(() => {
            console.log('✅ Map URLs copied to clipboard (one per line)!');
        });
    } else if (typeof copy === 'function') {
        copy(window.mapUrls);
        console.log('✅ Map URLs copied to clipboard!');
    }
}

function copyForScript() {
    if (!window.mapUrls) {
        console.log('❌ No URLs available. Run extractAllStoreData() first.');
        return;
    }
    
    const jsArray = 'const mapUrls = ' + JSON.stringify(window.mapUrls, null, 2) + ';';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(jsArray).then(() => {
            console.log('✅ JavaScript array copied to clipboard!');
        });
    } else if (typeof copy === 'function') {
        copy(jsArray);
        console.log('✅ JavaScript array copied to clipboard!');
    }
}

// All the extraction helper functions (same as before)
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
            
            if (lat >= -35 && lat <= -15 && lng >= 15 && lng <= 35) {
                return { lat, lng };
            }
        }
    }
    
    return null;
}

function findStoreContainer(mapLink) {
    let container = mapLink;
    
    for (let i = 0; i < 5; i++) {
        container = container.parentElement;
        if (!container) break;
        
        const text = container.textContent || '';
        
        if (text.length > 50 && text.length < 1000 && 
            (text.includes('FreshStop') || text.includes('Coffee') || 
             text.includes('Sasol') || text.includes('Food Lover') ||
             text.includes('Astron') || text.includes('Mall'))) {
            return container;
        }
    }
    
    return mapLink.parentElement || mapLink;
}

function extractStoreInfo(container, id) {
    const text = container.textContent || '';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let name = '';
    let address = '';
    let type = '';
    let hours = '';
    let phone = '';
    let email = '';
    
    // Extract store name
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
    
    // Extract address
    for (const line of lines) {
        if (line.match(/\d+.*(?:street|st|avenue|ave|road|rd|drive|dr|way|blvd|lane|ln|cnr)/i) ||
            line.match(/\d{4}/) || 
            line.includes(',')) {
            address = line;
            break;
        }
    }
    
    // Extract phone, email, hours
    const phoneMatch = text.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}|\(\d{3}\)\s*\d{3}-\d{4}/);
    if (phoneMatch) phone = phoneMatch[0];
    
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];
    
    const hourMatch = text.match(/\d{1,2}:\d{2}\s*(?:am|pm)?\s*-\s*\d{1,2}:\d{2}\s*(?:am|pm)?/i);
    if (hourMatch) hours = hourMatch[0];
    
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

function extractProvince(address) {
    if (!address) return 'Unknown';
    
    const addressLower = address.toLowerCase();
    
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

function extractCountry(address) {
    if (!address) return 'South Africa';
    
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('namibia') || addressLower.includes('windhoek')) return 'Namibia';
    
    return 'South Africa';
}

// Instructions
console.log('📋 AVAILABLE FUNCTIONS:');
console.log('  🔥 extractAllStoreData() - Extract all stores with auto-copy/download');
console.log('  📁 downloadCompleteData() - Download complete JSON data');
console.log('  🗺️  downloadMapUrls() - Download just the map URLs');
console.log('  📝 downloadForScript() - Download URLs formatted for script');
console.log('  📋 copyMapUrls() - Copy URLs to clipboard');
console.log('  📋 copyForScript() - Copy JavaScript array to clipboard');
console.log('');
console.log('💡 START HERE: extractAllStoreData()');
console.log('⚠️  Make sure you\'re on the Seattle Coffee store locator page!');