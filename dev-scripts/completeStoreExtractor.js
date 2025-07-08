// Complete Seattle Coffee Company Store & Info Extractor
// This script extracts coordinates AND detailed store information
// Run this in the browser console on the Seattle Coffee store locator page

async function extractCompleteStoreData() {
  console.log('🏪 Starting complete store data extraction...');
  console.log('This will get coordinates, hours, phone numbers, and all details');
  
  const storeData = [];
  const failedStores = [];
  
  // Find all store elements with "View on map" links
  const storeElements = findAllStoreElements();
  
  if (storeElements.length === 0) {
    console.log('❌ No store elements found. Make sure you\'re on the store locator page.');
    return [];
  }
  
  console.log(`📍 Found ${storeElements.length} stores to process`);
  console.log('⏳ This will take a few minutes to visit each store page...');
  
  // Process each store
  for (let i = 0; i < storeElements.length; i++) {
    const element = storeElements[i];
    console.log(`\n🔄 Processing ${i + 1}/${storeElements.length}...`);
    
    try {
      const storeInfo = await extractCompleteStoreInfo(element, i + 1);
      
      if (storeInfo) {
        storeData.push(storeInfo);
        console.log(`✅ ${storeInfo.name} - Complete`);
        
        // Log what we got
        const details = [];
        if (storeInfo.coordinates) details.push('coordinates');
        if (storeInfo.hours) details.push('hours');
        if (storeInfo.phone) details.push('phone');
        if (storeInfo.email) details.push('email');
        console.log(`   📋 Got: ${details.join(', ')}`);
      } else {
        failedStores.push(`Store ${i + 1} - Could not extract info`);
        console.log(`❌ Store ${i + 1} - Failed to extract`);
      }
    } catch (error) {
      failedStores.push(`Store ${i + 1} - Error: ${error.message}`);
      console.log(`❌ Store ${i + 1} - Error: ${error.message}`);
    }
    
    // Delay between requests to be respectful
    await sleep(2000);
  }
  
  // Display final results
  displayCompleteResults(storeData, failedStores);
  
  return storeData;
}

function findAllStoreElements() {
  // Multiple strategies to find store containers
  const strategies = [
    // Strategy 1: Find containers with both name and "View on map"
    () => {
      const containers = [];
      const mapLinks = document.querySelectorAll('a[href*="maps"], a[href*="directions"], a[href*="google.com/maps"]');
      
      mapLinks.forEach(link => {
        let container = link.closest('div, section, article, li, .store-item, .location-item');
        if (!container) {
          // Go up 3 levels to find a suitable container
          let parent = link.parentElement;
          for (let i = 0; i < 3 && parent; i++) {
            if (parent.textContent.length > 20 && parent.textContent.length < 500) {
              container = parent;
              break;
            }
            parent = parent.parentElement;
          }
        }
        
        if (container && container.textContent.includes('View on map')) {
          containers.push({
            element: container,
            mapLink: link,
            text: container.textContent.trim()
          });
        }
      });
      
      return containers;
    },
    
    // Strategy 2: Look for elements containing store-like text
    () => {
      const allElements = document.querySelectorAll('*');
      const storeContainers = [];
      
      allElements.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('View on map') && 
            (text.includes('FreshStop') || text.includes('Coffee') || 
             text.includes('Sasol') || text.includes('Food Lover') || 
             text.includes('Astron Energy'))) {
          storeContainers.push({
            element: el,
            mapLink: el.querySelector('a[href*="maps"]'),
            text: text.trim()
          });
        }
      });
      
      return storeContainers;
    }
  ];
  
  for (const strategy of strategies) {
    try {
      const results = strategy();
      if (results && results.length > 0) {
        console.log(`Found ${results.length} store containers`);
        return results;
      }
    } catch (e) {
      console.log('Strategy failed:', e);
    }
  }
  
  return [];
}

async function extractCompleteStoreInfo(storeContainer, index) {
  const store = {
    id: index,
    name: '',
    address: '',
    hours: '',
    phone: '',
    email: '',
    website: '',
    coordinates: null,
    mapUrl: '',
    infoUrl: '',
    type: '',
    amenities: [],
    description: '',
    lastUpdated: new Date().toISOString()
  };
  
  const element = storeContainer.element;
  const mapLink = storeContainer.mapLink;
  
  // Extract basic info from the listing
  store.name = extractStoreName(element);
  store.address = extractStoreAddress(element);
  store.type = classifyStore(store.name);
  
  // Get map URL and coordinates
  if (mapLink) {
    store.mapUrl = mapLink.href;
    store.coordinates = extractCoordinatesFromUrl(mapLink.href);
  }
  
  // Look for "Info" link to get detailed information
  const infoLink = element.querySelector('a[href*="info"], a[href*="store"], a[href*="location"], a:contains("Info")');
  
  if (infoLink) {
    store.infoUrl = infoLink.href;
    console.log(`   🔗 Found info link: ${infoLink.href}`);
    
    // Extract detailed info from the store page
    const detailedInfo = await extractDetailedStoreInfo(infoLink.href);
    if (detailedInfo) {
      Object.assign(store, detailedInfo);
    }
  } else {
    // Try to extract available info from the current element
    const basicInfo = extractBasicInfoFromElement(element);
    Object.assign(store, basicInfo);
  }
  
  return store.name ? store : null;
}

function extractStoreName(element) {
  const selectors = [
    'h1, h2, h3, h4, h5, h6',
    '.name, .title, .store-name, .location-name',
    '[class*="name"], [class*="title"]'
  ];
  
  for (const selector of selectors) {
    const nameElement = element.querySelector(selector);
    if (nameElement && nameElement.textContent.trim()) {
      const name = nameElement.textContent.trim();
      // Filter out obviously wrong text
      if (name.length < 100 && !name.includes('View on map') && !name.includes('Info')) {
        return name;
      }
    }
  }
  
  // Fallback: try to extract from text content
  const text = element.textContent || '';
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    if (line.length > 5 && line.length < 80 && 
        (line.includes('FreshStop') || line.includes('Coffee') || 
         line.includes('Sasol') || line.includes('Food Lover') || 
         line.includes('Astron Energy') || line.includes('Mall') ||
         line.includes('Centre') || line.includes('Container'))) {
      return line;
    }
  }
  
  return '';
}

function extractStoreAddress(element) {
  const selectors = [
    '.address, .location, .addr',
    '[class*="address"], [class*="location"]'
  ];
  
  for (const selector of selectors) {
    const addressElement = element.querySelector(selector);
    if (addressElement && addressElement.textContent.trim()) {
      return addressElement.textContent.trim();
    }
  }
  
  // Look for text that looks like an address
  const text = element.textContent || '';
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    if (line.match(/\d+.*(?:street|st|avenue|ave|road|rd|drive|dr|way|blvd|boulevard|lane|ln|place|pl|court|ct|cnr)/i)) {
      return line;
    }
  }
  
  return '';
}

async function extractDetailedStoreInfo(infoUrl) {
  try {
    console.log(`   📄 Fetching store details from: ${infoUrl}`);
    
    // Open the store detail page in a new window
    const newWindow = window.open(infoUrl, '_blank', 'width=1200,height=800');
    
    if (!newWindow) {
      console.log('   ⚠️  Could not open store detail page (popup blocked?)');
      return null;
    }
    
    // Wait for the page to load
    await sleep(3000);
    
    let detailedInfo = null;
    
    try {
      // Extract information from the new window
      const doc = newWindow.document;
      
      detailedInfo = {
        hours: extractHours(doc),
        phone: extractPhone(doc),
        email: extractEmail(doc),
        website: extractWebsite(doc),
        amenities: extractAmenities(doc),
        description: extractDescription(doc),
        coordinates: extractCoordinatesFromPage(doc) || null
      };
      
      console.log('   ✅ Successfully extracted detailed info');
      
    } catch (e) {
      console.log('   ⚠️  Could not access store detail page (cross-origin)');
      // This is expected due to same-origin policy
    }
    
    // Close the window
    newWindow.close();
    
    return detailedInfo;
    
  } catch (error) {
    console.log(`   ❌ Error fetching store details: ${error.message}`);
    return null;
  }
}

function extractHours(doc) {
  const hourSelectors = [
    '.hours, .opening-hours, .store-hours, .time',
    '[class*="hours"], [class*="time"], [class*="opening"]',
    '*:contains("Monday"), *:contains("Mon"), *:contains("Open"), *:contains("hours")'
  ];
  
  for (const selector of hourSelectors) {
    try {
      const element = doc.querySelector(selector);
      if (element && element.textContent.match(/\d{1,2}:\d{2}|open|close|monday|mon/i)) {
        return element.textContent.trim();
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Look for hour patterns in the page text
  const bodyText = doc.body ? doc.body.textContent : '';
  const hourPatterns = [
    /(?:monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)[^.].*?\d{1,2}:\d{2}/gi,
    /\d{1,2}:\d{2}\s*(?:am|pm)\s*-\s*\d{1,2}:\d{2}\s*(?:am|pm)/gi,
    /open[^.]*\d{1,2}:\d{2}/gi
  ];
  
  for (const pattern of hourPatterns) {
    const matches = bodyText.match(pattern);
    if (matches && matches.length > 0) {
      return matches.join(', ');
    }
  }
  
  return '';
}

function extractPhone(doc) {
  const phoneSelectors = [
    '.phone, .tel, .telephone, .contact-phone',
    '[class*="phone"], [class*="tel"]',
    'a[href^="tel:"]'
  ];
  
  for (const selector of phoneSelectors) {
    try {
      const element = doc.querySelector(selector);
      if (element) {
        const text = element.textContent || element.href;
        const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
        if (phoneMatch) {
          return phoneMatch[0].trim();
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Look for phone patterns in the page text
  const bodyText = doc.body ? doc.body.textContent : '';
  const phonePattern = /(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}|\(\d{3}\)\s*\d{3}-\d{4}/g;
  const phoneMatch = bodyText.match(phonePattern);
  
  return phoneMatch ? phoneMatch[0] : '';
}

function extractEmail(doc) {
  const emailSelectors = [
    '.email, .contact-email',
    '[class*="email"]',
    'a[href^="mailto:"]'
  ];
  
  for (const selector of emailSelectors) {
    try {
      const element = doc.querySelector(selector);
      if (element) {
        const text = element.textContent || element.href;
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          return emailMatch[0];
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  return '';
}

function extractWebsite(doc) {
  try {
    return doc.location ? doc.location.href : '';
  } catch (e) {
    return '';
  }
}

function extractAmenities(doc) {
  const amenities = [];
  const amenityKeywords = [
    'wifi', 'parking', 'drive-through', 'drive thru', 'outdoor seating',
    'takeaway', 'dine-in', 'delivery', 'air conditioning', 'disabled access'
  ];
  
  const bodyText = doc.body ? doc.body.textContent.toLowerCase() : '';
  
  amenityKeywords.forEach(keyword => {
    if (bodyText.includes(keyword)) {
      amenities.push(keyword);
    }
  });
  
  return amenities;
}

function extractDescription(doc) {
  const descSelectors = [
    '.description, .about, .store-info',
    '[class*="description"], [class*="about"], [class*="info"]',
    'p, .content'
  ];
  
  for (const selector of descSelectors) {
    try {
      const element = doc.querySelector(selector);
      if (element && element.textContent.length > 50 && element.textContent.length < 500) {
        return element.textContent.trim();
      }
    } catch (e) {
      // Continue
    }
  }
  
  return '';
}

function extractCoordinatesFromPage(doc) {
  // Look for coordinates in script tags or data attributes
  const scripts = doc.querySelectorAll('script');
  
  for (const script of scripts) {
    const text = script.textContent || '';
    const coordMatch = text.match(/[-]?\d+\.\d+,\s*[-]?\d+\.\d+/);
    if (coordMatch) {
      const [lat, lng] = coordMatch[0].split(',').map(c => parseFloat(c.trim()));
      if (lat >= -35 && lat <= -15 && lng >= 15 && lng <= 35) {
        return { lat, lng };
      }
    }
  }
  
  return null;
}

function extractBasicInfoFromElement(element) {
  const info = {
    hours: '',
    phone: '',
    email: ''
  };
  
  const text = element.textContent || '';
  
  // Look for phone numbers
  const phoneMatch = text.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}|\(\d{3}\)\s*\d{3}-\d{4}/);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }
  
  // Look for email addresses
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    info.email = emailMatch[0];
  }
  
  // Look for hour patterns
  const hourMatch = text.match(/\d{1,2}:\d{2}\s*(?:am|pm)\s*-\s*\d{1,2}:\d{2}\s*(?:am|pm)/i);
  if (hourMatch) {
    info.hours = hourMatch[0];
  }
  
  return info;
}

function extractCoordinatesFromUrl(url) {
  if (!url) return null;
  
  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /lat=(-?\d+\.?\d*).*lng=(-?\d+\.?\d*)/,
    /latitude=(-?\d+\.?\d*).*longitude=(-?\d+\.?\d*)/,
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

function classifyStore(name) {
  if (!name) return 'unknown';
  
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('freshstop')) return 'freshstop';
  if (nameLower.includes('food lover')) return 'food_lovers_market';
  if (nameLower.includes('astron energy')) return 'petrol_station';
  if (nameLower.includes('sasol delight')) return 'petrol_station';
  if (nameLower.includes('container')) return 'container_store';
  if (nameLower.includes('exclusive books')) return 'bookstore';
  if (nameLower.includes('mall') || nameLower.includes('centre')) return 'shopping_center';
  
  return 'cafe';
}

function displayCompleteResults(storeData, failedStores) {
  const withCoords = storeData.filter(s => s.coordinates);
  const withHours = storeData.filter(s => s.hours);
  const withPhone = storeData.filter(s => s.phone);
  const withEmail = storeData.filter(s => s.email);
  
  console.log('\n🎯 COMPLETE STORE EXTRACTION RESULTS:');
  console.log('===================================');
  console.log(`📊 Total stores processed: ${storeData.length}`);
  console.log(`✅ Successful extractions: ${storeData.length}`);
  console.log(`❌ Failed extractions: ${failedStores.length}`);
  console.log('');
  console.log('📋 DATA COMPLETENESS:');
  console.log(`🗺️  With coordinates: ${withCoords.length} (${Math.round((withCoords.length / storeData.length) * 100)}%)`);
  console.log(`🕐 With hours: ${withHours.length} (${Math.round((withHours.length / storeData.length) * 100)}%)`);
  console.log(`📞 With phone: ${withPhone.length} (${Math.round((withPhone.length / storeData.length) * 100)}%)`);
  console.log(`📧 With email: ${withEmail.length} (${Math.round((withEmail.length / storeData.length) * 100)}%)`);
  
  console.log('\n📍 SAMPLE COMPLETE STORES:');
  storeData.slice(0, 5).forEach((store, i) => {
    console.log(`\n${i + 1}. ${store.name}`);
    console.log(`   📍 Address: ${store.address || 'Not available'}`);
    console.log(`   🗺️  Coordinates: ${store.coordinates ? `${store.coordinates.lat}, ${store.coordinates.lng}` : 'Not available'}`);
    console.log(`   🕐 Hours: ${store.hours || 'Not available'}`);
    console.log(`   📞 Phone: ${store.phone || 'Not available'}`);
    console.log(`   📧 Email: ${store.email || 'Not available'}`);
    console.log(`   🏷️  Type: ${store.type}`);
  });
  
  if (failedStores.length > 0) {
    console.log('\n⚠️  FAILED EXTRACTIONS:');
    failedStores.forEach(failure => console.log(`   ${failure}`));
  }
  
  console.log('\n📤 COMPLETE JSON DATA:');
  console.log(JSON.stringify(storeData, null, 2));
  
  // Try to copy to clipboard
  if (navigator.clipboard) {
    const dataStr = JSON.stringify(storeData, null, 2);
    navigator.clipboard.writeText(dataStr)
      .then(() => console.log('\n📋 Complete data copied to clipboard!'))
      .catch(() => console.log('\n⚠️  Could not copy to clipboard'));
  }
  
  console.log('\n🔗 NEXT STEPS:');
  console.log('1. Save this JSON data to your database');
  console.log('2. Update your app to use the complete store information');
  console.log('3. For stores missing coordinates, try the coordinate-only extractor');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Quick extraction function for coordinates only
function quickExtractCoordinates() {
  console.log('🚀 Quick coordinate extraction from map links...');
  
  const mapLinks = document.querySelectorAll('a[href*="maps"], a[href*="directions"]');
  const results = [];
  
  mapLinks.forEach((link, index) => {
    const coords = extractCoordinatesFromUrl(link.href);
    
    if (coords) {
      // Find store name
      let name = '';
      let parent = link.parentElement;
      
      for (let i = 0; i < 3 && parent; i++) {
        const text = parent.textContent;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        for (const line of lines) {
          if (line.length > 5 && line.length < 100 && 
              !line.includes('View on map') && !line.includes('Info') &&
              (line.includes('FreshStop') || line.includes('Coffee') || 
               line.includes('Sasol') || line.includes('Food Lover') || 
               line.includes('Astron'))) {
            name = line;
            break;
          }
        }
        
        if (name) break;
        parent = parent.parentElement;
      }
      
      results.push({
        id: index + 1,
        name: name || `Store ${index + 1}`,
        coordinates: coords,
        mapUrl: link.href
      });
    }
  });
  
  console.log(`✅ Found ${results.length} stores with coordinates`);
  console.log(JSON.stringify(results, null, 2));
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
      .then(() => console.log('📋 Coordinate data copied to clipboard!'));
  }
  
  return results;
}

// Auto-run message
console.log('🏪 Seattle Coffee Company COMPLETE Store & Info Extractor loaded!');
console.log('====================================================================');
console.log('📋 Available functions:');
console.log('  🔥 extractCompleteStoreData() - Get coordinates + hours + phone + all details');
console.log('  ⚡ quickExtractCoordinates() - Get coordinates only (faster)');
console.log('');
console.log('💡 For complete data (recommended): extractCompleteStoreData()');
console.log('💡 For coordinates only (quick): quickExtractCoordinates()');
console.log('');
console.log('⚠️  Note: The complete extraction visits each store page and takes 5-10 minutes');

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    extractCompleteStoreData, 
    quickExtractCoordinates,
    extractCoordinatesFromUrl 
  };
}