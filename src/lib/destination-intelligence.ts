// ============================================================
// DESTINATION INTELLIGENCE ENGINE
// Handles ANY destination worldwide using smart classification
// and generalized cost/itinerary generation
// ============================================================

import { type DestinationData, findDestination } from "./travel-data";

// ── City type classification ──────────────────────────────

export type CityType = "beach" | "mountain" | "urban" | "religious" | "heritage" | "adventure" | "island" | "desert";

interface CityClassification {
  type: CityType;
  country: string;
  region: "india" | "south-asia" | "southeast-asia" | "east-asia" | "middle-east" | "europe" | "americas" | "africa" | "oceania";
  costMultiplier: number; // relative to Indian mid-range
}

// ── Keyword-based city type hints ─────────────────────────

const typeKeywords: Record<CityType, RegExp> = {
  beach: /beach|coast|shore|island|sea|ocean|surf|coral|bay|cove|port|goa|puri|vizag|varkala|pondicherry|maldiv|phuket|cancun|nice|santorini|hawaii|fiji|zanzibar|bora/i,
  mountain: /hill|mountain|peak|valley|trek|himalay|alpine|manali|shimla|munnar|darjeel|mussoorie|nainital|ooty|kodaikanal|leh|ladakh|swiss|alps|everest|andes|aspen|banff|chamonix/i,
  urban: /city|metro|downtown|skyscraper|mall|nightlife|new york|london|tokyo|mumbai|delhi|bangalore|hyderabad|shanghai|dubai|singapore|hong kong|los angeles|chicago|berlin|sydney|toronto|san francisco/i,
  religious: /temple|church|mosque|shrine|pilgrim|holy|varanasi|amritsar|tirupati|haridwar|rishikesh|bodh gaya|mathura|jerusalem|mecca|vatican|lourdes|bhubaneswar/i,
  heritage: /fort|palace|heritage|ruins|ancient|museum|hawa|agra|jaipur|jodhpur|udaipur|hampi|khajuraho|rome|athens|cairo|petra|angkor|machu picchu|kyoto|istanbul|prague|florence/i,
  adventure: /adventure|safari|wild|jungle|rafting|bungee|skydive|dive|camp|rishikesh|andaman|coorg|jim corbett|kruger|costa rica|queenstown|interlaken/i,
  island: /island|isle|andaman|lakshadweep|sri lanka|bali|maldiv|mauritius|seychelles|hawaii|fiji|madagascar|zanzibar|galápagos|nusa/i,
  desert: /desert|sand|dune|thar|jaisalmer|jodhpur|sahara|rajasthan|dubai|abu dhabi|morocco|atacama|mojave|wadi rum/i,
};

// ── Country/region detection ──────────────────────────────

const regionKeywords: Record<CityClassification["region"], RegExp> = {
  india: /india|goa|manali|jaipur|delhi|mumbai|bangalore|chennai|kolkata|hyderabad|pune|kerala|kashmir|ladakh|shimla|ooty|darjeel|varanasi|agra|amritsar|rishikesh|udaipur|jodhpur|jaisalmer|andaman|bhubaneswar|puri|konark|cuttack|vizag|coorg|hampi|mysore|kodaikanal|munnar|alleppey|pondicherry|kochi|lucknow|nainital|mussoorie|gangtok|shillong|guwahati|ranchi|raipur|bhopal|indore|surat|ahmedabad|rajkot|vadodara|chandigarh|dehradun|haridwar|tirupati|madurai|rameswaram|thanjavur/i,
  "south-asia": /nepal|kathmandu|pokhara|sri lanka|colombo|bhutan|thimphu|bangladesh|dhaka|pakistan|lahore|karachi/i,
  "southeast-asia": /thailand|bangkok|phuket|chiang mai|vietnam|hanoi|ho chi minh|cambodia|siem reap|indonesia|bali|jakarta|malaysia|kuala lumpur|philippines|manila|cebu|myanmar|laos|singapore/i,
  "east-asia": /japan|tokyo|osaka|kyoto|china|beijing|shanghai|korea|seoul|busan|taiwan|taipei|hong kong|macau|mongolia/i,
  "middle-east": /dubai|abu dhabi|uae|qatar|doha|saudi|oman|muscat|bahrain|jordan|amman|petra|israel|jerusalem|turkey|istanbul|cappadocia|iran/i,
  europe: /france|paris|italy|rome|florence|venice|spain|barcelona|madrid|germany|berlin|munich|uk|london|edinburgh|greece|athens|santorini|switzerland|zurich|geneva|netherlands|amsterdam|portugal|lisbon|austria|vienna|czech|prague|hungary|budapest|croatia|dubrovnik|norway|sweden|denmark|iceland|ireland|belgium|poland|russia|moscow/i,
  americas: /usa|new york|los angeles|san francisco|miami|las vegas|chicago|boston|washington|hawaii|canada|toronto|vancouver|montreal|mexico|cancun|brazil|rio|sao paulo|argentina|buenos aires|peru|lima|colombia|bogota|chile|santiago|costa rica|cuba|havana|jamaica|ecuador/i,
  africa: /egypt|cairo|south africa|cape town|kenya|nairobi|tanzania|morocco|marrakech|tunisia|ethiopia|ghana|nigeria|zanzibar|madagascar|mauritius|seychelles|rwanda/i,
  oceania: /australia|sydney|melbourne|perth|new zealand|auckland|queenstown|fiji|tahiti|samoa|bora bora/i,
};

// ── Cost multipliers by region ────────────────────────────

const regionCostMultipliers: Record<CityClassification["region"], { budget: number; midRange: number; luxury: number }> = {
  india:           { budget: 1,    midRange: 1,    luxury: 1 },
  "south-asia":    { budget: 1.1,  midRange: 1.2,  luxury: 1.3 },
  "southeast-asia":{ budget: 1.5,  midRange: 2,    luxury: 2.5 },
  "east-asia":     { budget: 3,    midRange: 4,    luxury: 6 },
  "middle-east":   { budget: 2.5,  midRange: 3.5,  luxury: 5 },
  europe:          { budget: 4,    midRange: 5.5,  luxury: 8 },
  americas:        { budget: 3.5,  midRange: 5,    luxury: 8 },
  africa:          { budget: 2,    midRange: 3,    luxury: 5 },
  oceania:         { budget: 3.5,  midRange: 5,    luxury: 7 },
};

// ── Flight cost estimates from Delhi (INR) ────────────────

const regionFlightCosts: Record<CityClassification["region"], { budget: number; midRange: number; luxury: number }> = {
  india:            { budget: 3000,  midRange: 5000,  luxury: 12000 },
  "south-asia":     { budget: 5000,  midRange: 8000,  luxury: 18000 },
  "southeast-asia": { budget: 8000,  midRange: 14000, luxury: 35000 },
  "east-asia":      { budget: 12000, midRange: 22000, luxury: 60000 },
  "middle-east":    { budget: 8000,  midRange: 15000, luxury: 40000 },
  europe:           { budget: 25000, midRange: 40000, luxury: 150000 },
  americas:         { budget: 30000, midRange: 50000, luxury: 180000 },
  africa:           { budget: 20000, midRange: 35000, luxury: 120000 },
  oceania:          { budget: 28000, midRange: 45000, luxury: 160000 },
};

// ── Generic attraction templates by city type ─────────────

const genericAttractions: Record<CityType, string[]> = {
  beach: ["Main Beach & Promenade", "Sunset Point", "Water Sports Zone", "Seaside Market", "Lighthouse / Cliff View", "Marine Aquarium", "Fishing Village Walk"],
  mountain: ["Main Viewpoint / Peak", "Nature Trail / Trek", "Waterfall Hike", "Local Village Walk", "Sunrise Point", "Pine Forest Walk", "Mountain Lake"],
  urban: ["City Center & Landmarks", "Famous Market / Shopping District", "Museum / Art Gallery", "Food Street Tour", "Nightlife District", "Riverfront / Waterfront", "Historic Neighborhood"],
  religious: ["Main Temple / Shrine", "Morning Prayer / Aarti", "Old Town Walk", "Sacred River / Lake", "Monastery / Ashram Visit", "Heritage Walk", "Evening Ceremony"],
  heritage: ["Historic Fort / Palace", "Museum Tour", "Old City Walking Tour", "Royal Garden / Park", "Artisan Workshop", "Sound & Light Show", "Bazaar / Souk"],
  adventure: ["River Rafting / Kayaking", "Trekking Trail", "Zip-line / Bungee", "Camping Site", "Wildlife Safari", "Rock Climbing", "Mountain Biking"],
  island: ["Beach Hopping Tour", "Snorkeling / Diving", "Island Cruise", "Coral Reef Visit", "Mangrove Kayaking", "Sunset Sail", "Local Village Tour"],
  desert: ["Desert Safari", "Sand Dune Exploration", "Camel Ride", "Desert Camp Night", "Stargazing", "Oasis Visit", "Local Heritage Tour"],
};

const genericActivities: Record<CityType, { name: string; costFactor: number; duration: string }[]> = {
  beach: [
    { name: "Scuba Diving / Snorkeling", costFactor: 2.5, duration: "3 hours" },
    { name: "Parasailing", costFactor: 1, duration: "30 mins" },
    { name: "Boat Cruise", costFactor: 0.8, duration: "2 hours" },
    { name: "Beach Yoga Session", costFactor: 0.5, duration: "1 hour" },
    { name: "Jet Ski Ride", costFactor: 1.2, duration: "30 mins" },
  ],
  mountain: [
    { name: "Guided Trek", costFactor: 1.5, duration: "5 hours" },
    { name: "Paragliding", costFactor: 2.5, duration: "30 mins" },
    { name: "Camping Experience", costFactor: 2, duration: "Overnight" },
    { name: "River Crossing", costFactor: 1, duration: "2 hours" },
    { name: "Mountain Biking", costFactor: 1.2, duration: "3 hours" },
  ],
  urban: [
    { name: "City Walking Tour", costFactor: 1, duration: "3 hours" },
    { name: "Food Tour", costFactor: 1.5, duration: "3 hours" },
    { name: "Rooftop Bar Experience", costFactor: 2, duration: "Evening" },
    { name: "Museum / Gallery Visit", costFactor: 1.2, duration: "2 hours" },
    { name: "Cooking Class", costFactor: 2, duration: "3 hours" },
  ],
  religious: [
    { name: "Guided Temple Tour", costFactor: 0.5, duration: "3 hours" },
    { name: "Meditation / Yoga Session", costFactor: 0.8, duration: "2 hours" },
    { name: "Heritage Walk", costFactor: 0.6, duration: "3 hours" },
    { name: "Evening Aarti / Ceremony", costFactor: 0.3, duration: "1.5 hours" },
    { name: "Boat Ride (if river)", costFactor: 0.5, duration: "1 hour" },
  ],
  heritage: [
    { name: "Guided Fort / Palace Tour", costFactor: 1, duration: "3 hours" },
    { name: "Sound & Light Show", costFactor: 0.5, duration: "1 hour" },
    { name: "Artisan Workshop Visit", costFactor: 0.8, duration: "2 hours" },
    { name: "Heritage Cooking Class", costFactor: 1.5, duration: "3 hours" },
    { name: "Vintage Car / Cart Ride", costFactor: 1.2, duration: "1 hour" },
  ],
  adventure: [
    { name: "White Water Rafting", costFactor: 2, duration: "3 hours" },
    { name: "Bungee Jumping", costFactor: 3, duration: "30 mins" },
    { name: "Zip-lining", costFactor: 1.5, duration: "1 hour" },
    { name: "Wildlife Safari", costFactor: 2.5, duration: "4 hours" },
    { name: "Rock Climbing", costFactor: 1.5, duration: "2 hours" },
  ],
  island: [
    { name: "Island Hopping Tour", costFactor: 2.5, duration: "Full day" },
    { name: "Scuba Diving", costFactor: 3, duration: "3 hours" },
    { name: "Glass Bottom Boat", costFactor: 1, duration: "1 hour" },
    { name: "Sunset Cruise", costFactor: 2, duration: "2 hours" },
    { name: "Kayaking", costFactor: 1, duration: "2 hours" },
  ],
  desert: [
    { name: "Desert Safari (Jeep)", costFactor: 2, duration: "4 hours" },
    { name: "Camel Ride", costFactor: 0.8, duration: "1 hour" },
    { name: "Desert Camping + BBQ", costFactor: 3, duration: "Overnight" },
    { name: "Sandboarding", costFactor: 1.5, duration: "2 hours" },
    { name: "Stargazing Tour", costFactor: 1, duration: "2 hours" },
  ],
};

const genericFoodByRegion: Record<CityClassification["region"], string[]> = {
  india: ["Local Thali", "Street Food Tour", "Regional Biryani", "Lassi & Chai", "Sweets & Desserts"],
  "south-asia": ["Local Curry & Rice", "Momos / Dumplings", "Fresh Seafood", "Street Snacks", "Traditional Sweets"],
  "southeast-asia": ["Pad Thai / Noodles", "Street Food Markets", "Fresh Tropical Fruits", "Coconut Curries", "Night Market Eats"],
  "east-asia": ["Ramen / Sushi", "Dim Sum", "Street Food Stalls", "Matcha / Bubble Tea", "Hot Pot"],
  "middle-east": ["Shawarma & Falafel", "Hummus & Pita", "Arabic Coffee & Dates", "Grilled Kebabs", "Baklava"],
  europe: ["Local Bakery Visit", "Wine & Cheese Tasting", "Café Culture", "Traditional Local Dish", "Gelato / Patisserie"],
  americas: ["Local BBQ / Grill", "Tacos / Burritos", "Brunch Culture", "Craft Beer & Burgers", "Street Vendor Specials"],
  africa: ["Tagine / Couscous", "Grilled Meat Platter", "Tropical Fruits", "Local Market Bites", "Spiced Tea"],
  oceania: ["Meat Pie / Fish & Chips", "Café Brunch", "Seafood Platter", "Indigenous Cuisine", "Pavlova"],
};

const genericTipsByRegion: Record<CityClassification["region"], string[]> = {
  india: [
    "Use local trains or buses to save on transport",
    "Eat at local dhabas for authentic, cheap food",
    "Book accommodation on MakeMyTrip or Goibibo for deals",
    "Carry cash — many small shops don't accept cards",
    "Travel on weekdays for lower prices",
  ],
  "south-asia": [
    "Negotiate prices at local markets",
    "Use local transport instead of tourist shuttles",
    "Book guesthouses for budget stays",
    "Learn a few local phrases — locals appreciate it",
    "Carry a refillable water bottle and purification tablets",
  ],
  "southeast-asia": [
    "Eat at street stalls and local markets for the best food and prices",
    "Use Grab (ride-hailing app) instead of metered taxis",
    "Visit temples early morning to avoid crowds",
    "Haggle at markets — start at 40% of asking price",
    "Book accommodations on Agoda for best Southeast Asia deals",
  ],
  "east-asia": [
    "Get a transit pass for unlimited train/metro rides",
    "Eat at convenience stores (7-Eleven, FamilyMart) for budget meals",
    "Visit free shrines and parks — many attractions are free",
    "Book accommodation in capsule hotels or hostels to save",
    "Carry a pocket WiFi or get a local SIM",
  ],
  "middle-east": [
    "Visit during shoulder season (Oct-Nov or Mar-Apr) for lower prices",
    "Eat at local cafeterias instead of hotel restaurants",
    "Use public metro where available",
    "Book attraction tickets online in advance for discounts",
    "Dress modestly to respect local customs",
  ],
  europe: [
    "Buy a city pass for free public transport and museum entry",
    "Eat at local markets and bakeries instead of restaurants",
    "Use Flixbus or trains for inter-city travel instead of flights",
    "Visit free museums on designated free-entry days",
    "Book Airbnb or hostels instead of hotels to save significantly",
  ],
  americas: [
    "Use public transit or rent bikes instead of ride-shares",
    "Look for free walking tours (tip-based)",
    "Eat at food trucks and delis for affordable meals",
    "Book accommodations outside city center for lower rates",
    "Buy attraction combo passes for savings",
  ],
  africa: [
    "Book safari lodges during green/low season for 50% off",
    "Use local minibus transport (matatu, dala-dala) for cheap travel",
    "Negotiate prices at local markets — it's expected",
    "Carry USD or EUR in small bills for easy exchange",
    "Stay in guesthouses or Airbnbs for budget accommodation",
  ],
  oceania: [
    "Cook your own meals — groceries are cheaper than eating out",
    "Use campervan rentals for accommodation + transport combo",
    "Visit free beaches, parks, and hiking trails",
    "Book inter-city buses instead of domestic flights",
    "Get a Hop-on Hop-off pass for sightseeing cities",
  ],
};

// ── Main classification function ──────────────────────────

export function classifyDestination(query: string): CityClassification {
  const lower = query.toLowerCase();

  // Detect region
  let region: CityClassification["region"] = "india"; // default
  for (const [r, regex] of Object.entries(regionKeywords)) {
    if (regex.test(lower)) {
      region = r as CityClassification["region"];
      break;
    }
  }

  // Detect city type
  let type: CityType = "urban"; // default
  for (const [t, regex] of Object.entries(typeKeywords)) {
    if (regex.test(lower)) {
      type = t as CityType;
      break;
    }
  }

  // Determine country name
  const country = detectCountry(lower, region);

  const costMult = regionCostMultipliers[region];

  return { type, country, region, costMultiplier: costMult.midRange };
}

function detectCountry(lower: string, region: CityClassification["region"]): string {
  const countryMap: Record<string, string> = {
    india: "India", nepal: "Nepal", "sri lanka": "Sri Lanka", bhutan: "Bhutan",
    thailand: "Thailand", vietnam: "Vietnam", cambodia: "Cambodia", indonesia: "Indonesia",
    malaysia: "Malaysia", philippines: "Philippines", singapore: "Singapore", myanmar: "Myanmar",
    japan: "Japan", china: "China", korea: "South Korea", taiwan: "Taiwan",
    uae: "UAE", dubai: "UAE", qatar: "Qatar", jordan: "Jordan", turkey: "Turkey", israel: "Israel",
    france: "France", italy: "Italy", spain: "Spain", germany: "Germany", uk: "United Kingdom",
    greece: "Greece", switzerland: "Switzerland", netherlands: "Netherlands", portugal: "Portugal",
    austria: "Austria", czech: "Czech Republic", hungary: "Hungary", croatia: "Croatia",
    usa: "USA", canada: "Canada", mexico: "Mexico", brazil: "Brazil", argentina: "Argentina",
    peru: "Peru", colombia: "Colombia", chile: "Chile", "costa rica": "Costa Rica",
    egypt: "Egypt", "south africa": "South Africa", kenya: "Kenya", tanzania: "Tanzania",
    morocco: "Morocco", mauritius: "Mauritius",
    australia: "Australia", "new zealand": "New Zealand", fiji: "Fiji",
  };
  for (const [key, value] of Object.entries(countryMap)) {
    if (lower.includes(key)) return value;
  }
  const regionCountryDefaults: Record<string, string> = {
    india: "India", "south-asia": "South Asia", "southeast-asia": "Southeast Asia",
    "east-asia": "East Asia", "middle-east": "Middle East", europe: "Europe",
    americas: "Americas", africa: "Africa", oceania: "Oceania",
  };
  return regionCountryDefaults[region] || "Unknown";
}

// ── Generate a synthetic DestinationData for any city ─────

export function generateFallbackDestination(cityName: string): DestinationData {
  const classification = classifyDestination(cityName);
  const { type, country, region } = classification;
  const costs = regionCostMultipliers[region];
  const flights = regionFlightCosts[region];

  // Base daily costs in INR (India baseline)
  const baseBudget = 1500;
  const baseMid = 4000;
  const baseLux = 12000;

  const typeDescriptions: Record<CityType, string> = {
    beach: `A beautiful coastal destination known for its beaches, seafood, and relaxed vibes.`,
    mountain: `A scenic mountain retreat offering stunning views, trekking, and cool climate.`,
    urban: `A vibrant metropolitan city with modern attractions, shopping, and diverse cuisine.`,
    religious: `A sacred destination rich in spiritual heritage, temples, and peaceful ambiance.`,
    heritage: `A historic city with magnificent forts, palaces, and centuries of cultural legacy.`,
    adventure: `An adventure hub offering thrilling activities amid stunning natural landscapes.`,
    island: `A tropical island paradise with crystal waters, coral reefs, and pristine beaches.`,
    desert: `A mesmerizing desert destination with golden dunes, starlit skies, and cultural charm.`,
  };

  const bestTimes: Record<CityType, string> = {
    beach: "October to March (pleasant weather, calm seas)",
    mountain: "March to June (summer), October to November (post-monsoon clear skies)",
    urban: "October to March (cooler months, festival season)",
    religious: "October to March (comfortable for walking and exploration)",
    heritage: "October to February (cool and pleasant for sightseeing)",
    adventure: "March to June (summer), September to November (post-monsoon)",
    island: "November to April (dry season, calm waters)",
    desert: "October to March (cool desert nights, pleasant days)",
  };

  // Add some randomness to costs so they don't feel identical
  const jitter = () => 0.85 + Math.random() * 0.3; // 0.85 to 1.15

  const attractions = genericAttractions[type].map(a => a.replace("Main", cityName));
  const activities = genericActivities[type].map(a => ({
    name: a.name,
    cost: Math.round(baseMid * a.costFactor * costs.midRange * 0.15 * jitter()),
    duration: a.duration,
  }));

  return {
    name: capitalize(cityName),
    country,
    description: `${capitalize(cityName)} — ${typeDescriptions[type]}`,
    bestTimeToVisit: bestTimes[type],
    avgDailyBudget: {
      budget: Math.round(baseBudget * costs.budget * jitter()),
      midRange: Math.round(baseMid * costs.midRange * jitter()),
      luxury: Math.round(baseLux * costs.luxury * jitter()),
    },
    flightFromDelhi: {
      budget: Math.round(flights.budget * jitter()),
      midRange: Math.round(flights.midRange * jitter()),
      luxury: Math.round(flights.luxury * jitter()),
    },
    topAttractions: attractions,
    foodSpecialties: genericFoodByRegion[region],
    tips: genericTipsByRegion[region],
    activities,
  };
}

// ── Extract destination name from natural language ────────

export function extractDestinationName(text: string): string | null {
  const lower = text.toLowerCase().trim();

  // Patterns: "trip to X", "visit X", "plan X", "go to X", "X trip", "X for N days", "days in X"
  const patterns = [
    /(?:trip|travel|go|visit|plan|fly|heading|going)\s+to\s+([a-z\s]+?)(?:\s+(?:for|under|in|with|budget|luxury|mid|cheap|\d))/i,
    /(?:trip|travel|go|visit|plan|fly|heading|going)\s+to\s+([a-z\s]+)/i,
    /(?:plan|create|make|generate|build)\s+(?:a\s+)?(?:\d+\s*day\s+)?(?:trip\s+)?(?:to\s+)?([a-z\s]+?)(?:\s+(?:for|under|in|with|budget|luxury|mid|cheap|\d))/i,
    /\d+\s*days?\s+(?:in|at|to)\s+([a-z\s]+)/i,
    /([a-z\s]+?)\s+(?:trip|tour|vacation|holiday)/i,
    /(?:in|at)\s+([a-z\s]+?)(?:\s+(?:for|under|budget|luxury|mid|cheap|\d))/i,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      const name = match[1].trim()
        .replace(/\b(a|an|the|my|our|for|and|or|with|please|pls)\b/g, "")
        .trim();
      if (name.length >= 2 && name.length <= 40) {
        return name;
      }
    }
  }

  // Fallback: check if any word is a known place (2+ chars, not a common English word)
  const commonWords = new Set(["i", "me", "my", "want", "need", "plan", "trip", "travel", "go", "help", "please", "day", "days", "budget", "cheap", "luxury", "mid", "range", "the", "a", "an", "to", "in", "for", "with", "under", "around", "about", "best", "time", "visit", "would", "like", "can", "you", "tell", "show", "give", "make", "create", "suggest", "how", "much", "what", "where", "when", "is", "are", "it", "do", "does", "hi", "hello", "hey", "thanks", "thank", "ok", "yes", "no", "new", "compare", "vs", "or", "between"]);
  
  const words = lower.split(/\s+/).filter(w => w.length >= 3 && !commonWords.has(w) && !/^\d+$/.test(w));
  
  // Check consecutive word combinations (for multi-word cities like "New York", "Sri Lanka")
  const allWords = lower.split(/\s+/);
  for (let len = 3; len >= 2; len--) {
    for (let i = 0; i <= allWords.length - len; i++) {
      const phrase = allWords.slice(i, i + len).join(" ");
      if (phrase.length >= 4 && !commonWords.has(phrase)) {
        // Check if this phrase looks like a place name (has at least one non-common word)
        const hasNonCommon = allWords.slice(i, i + len).some(w => !commonWords.has(w) && w.length >= 3);
        if (hasNonCommon && isLikelyPlaceName(phrase)) {
          return phrase;
        }
      }
    }
  }

  // Single word fallback
  if (words.length > 0) {
    const candidate = words[words.length - 1]; // usually destination is last meaningful word
    if (isLikelyPlaceName(candidate)) return candidate;
  }

  return null;
}

function isLikelyPlaceName(word: string): boolean {
  // Check against all region keywords to see if it's a known place
  for (const regex of Object.values(regionKeywords)) {
    if (regex.test(word)) return true;
  }
  for (const regex of Object.values(typeKeywords)) {
    if (regex.test(word)) return true;
  }
  // If not in any keyword list, still allow it (could be any city)
  // but filter out very common English words
  const nonPlace = /^(want|need|help|plan|tell|show|give|make|create|would|could|should|about|really|very|nice|good|great|some|thing|know|think)$/;
  return !nonPlace.test(word);
}

function capitalize(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Smart destination resolver: known OR fallback ─────────

export function resolveDestination(query: string): { data: DestinationData; isKnown: boolean } {
  // First try known destinations
  const known = findDestination(query);
  if (known) return { data: known, isKnown: true };

  // Extract destination name and generate fallback
  const name = extractDestinationName(query);
  if (name) {
    // Double-check known destinations with extracted name
    const knownFromName = findDestination(name);
    if (knownFromName) return { data: knownFromName, isKnown: true };

    return { data: generateFallbackDestination(name), isKnown: false };
  }

  return { data: generateFallbackDestination(query), isKnown: false };
}
