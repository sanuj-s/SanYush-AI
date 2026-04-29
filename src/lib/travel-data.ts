// Comprehensive travel destination data for AI recommendations
export interface DestinationData {
  name: string;
  country: string;
  description: string;
  bestTimeToVisit: string;
  avgDailyBudget: { budget: number; midRange: number; luxury: number }; // INR per day
  flightFromDelhi: { budget: number; midRange: number; luxury: number }; // INR approx
  topAttractions: string[];
  foodSpecialties: string[];
  tips: string[];
  activities: { name: string; cost: number; duration: string }[];
}

export const destinations: Record<string, DestinationData> = {
  goa: {
    name: "Goa",
    country: "India",
    description: "India's beach paradise with vibrant nightlife, Portuguese heritage, and stunning coastline.",
    bestTimeToVisit: "November to February (pleasant weather, festive season)",
    avgDailyBudget: { budget: 1500, midRange: 4000, luxury: 12000 },
    flightFromDelhi: { budget: 3500, midRange: 5500, luxury: 12000 },
    topAttractions: ["Baga Beach", "Fort Aguada", "Basilica of Bom Jesus", "Dudhsagar Falls", "Anjuna Flea Market", "Old Goa Churches", "Chapora Fort"],
    foodSpecialties: ["Fish Curry Rice", "Bebinca", "Prawn Balchão", "Feni", "Vindaloo", "Xacuti"],
    tips: [
      "Rent a scooter (₹300-500/day) instead of taxis to save money",
      "Visit North Goa for nightlife, South Goa for peace and quiet",
      "Book beach shacks for budget-friendly stays",
      "Eat at local 'bhatti' restaurants for authentic cheap food",
      "Avoid peak season (Dec 25 - Jan 5) for better hotel rates"
    ],
    activities: [
      { name: "Scuba Diving", cost: 3500, duration: "3 hours" },
      { name: "Dolphin Watching Cruise", cost: 800, duration: "2 hours" },
      { name: "Spice Plantation Tour", cost: 600, duration: "3 hours" },
      { name: "Parasailing", cost: 1200, duration: "30 mins" },
      { name: "Casino Night", cost: 2500, duration: "Evening" },
      { name: "Kayaking in Mangroves", cost: 1000, duration: "2 hours" }
    ]
  },
  manali: {
    name: "Manali",
    country: "India",
    description: "A stunning hill station in the Himalayas, perfect for adventure and natural beauty.",
    bestTimeToVisit: "March to June (summer), December to February (snow)",
    avgDailyBudget: { budget: 1200, midRange: 3500, luxury: 10000 },
    flightFromDelhi: { budget: 2000, midRange: 3500, luxury: 8000 },
    topAttractions: ["Rohtang Pass", "Solang Valley", "Hadimba Temple", "Old Manali", "Jogini Waterfall", "Vashisht Hot Springs", "Mall Road"],
    foodSpecialties: ["Siddu", "Trout Fish", "Tibetan Momos", "Thukpa", "Aktori"],
    tips: [
      "Take a Volvo bus from Delhi (₹1000-1500) instead of flying to Chandigarh",
      "Stay in Old Manali for budget hostels and cafes",
      "Carry warm clothes even in summer - nights are cold",
      "Book Rohtang Pass permits online in advance",
      "Visit during weekdays to avoid weekend tourist rush"
    ],
    activities: [
      { name: "River Rafting", cost: 1500, duration: "2 hours" },
      { name: "Paragliding at Solang", cost: 2500, duration: "30 mins" },
      { name: "Skiing (winter)", cost: 2000, duration: "3 hours" },
      { name: "Trekking to Jogini Falls", cost: 0, duration: "4 hours" },
      { name: "Mountain Biking", cost: 1200, duration: "3 hours" },
      { name: "Camping at Hampta Pass", cost: 3000, duration: "Full day" }
    ]
  },
  jaipur: {
    name: "Jaipur",
    country: "India",
    description: "The Pink City - a royal blend of magnificent palaces, vibrant bazaars, and rich Rajasthani culture.",
    bestTimeToVisit: "October to March (cool and pleasant weather)",
    avgDailyBudget: { budget: 1000, midRange: 3000, luxury: 8000 },
    flightFromDelhi: { budget: 2500, midRange: 4000, luxury: 9000 },
    topAttractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort", "Jal Mahal", "Albert Hall Museum"],
    foodSpecialties: ["Dal Baati Churma", "Laal Maas", "Ghewar", "Pyaaz Kachori", "Mirchi Vada"],
    tips: [
      "Buy a composite ticket for multiple monuments (₹100 for Indians)",
      "Visit forts early morning to avoid heat and crowds",
      "Shop at Johari Bazaar for traditional jewelry",
      "Take an auto-rickshaw instead of taxis within the city",
      "Try street food at Masala Chowk for a safe, hygienic food court experience"
    ],
    activities: [
      { name: "Elephant Ride at Amber Fort", cost: 1200, duration: "1 hour" },
      { name: "Hot Air Balloon Ride", cost: 8000, duration: "1 hour" },
      { name: "Cooking Class", cost: 1500, duration: "3 hours" },
      { name: "Block Printing Workshop", cost: 800, duration: "2 hours" },
      { name: "Night Tour of Nahargarh", cost: 500, duration: "2 hours" },
      { name: "Camel Safari", cost: 2000, duration: "3 hours" }
    ]
  },
  kerala: {
    name: "Kerala",
    country: "India",
    description: "God's Own Country - lush backwaters, tea plantations, and serene beaches.",
    bestTimeToVisit: "September to March (post-monsoon, pleasant weather)",
    avgDailyBudget: { budget: 1500, midRange: 4500, luxury: 15000 },
    flightFromDelhi: { budget: 4000, midRange: 6000, luxury: 14000 },
    topAttractions: ["Alleppey Backwaters", "Munnar Tea Gardens", "Fort Kochi", "Varkala Beach", "Periyar Wildlife Sanctuary", "Kumarakom", "Wayanad"],
    foodSpecialties: ["Kerala Sadya", "Appam with Stew", "Karimeen Pollichathu", "Puttu and Kadala", "Payasam"],
    tips: [
      "Book a shared houseboat instead of private for 60% savings",
      "Use KSRTC buses - reliable and very affordable",
      "Visit Munnar on weekdays to avoid crowds",
      "Carry rain gear year-round",
      "Book Ayurvedic treatments at local centers, not resort spas"
    ],
    activities: [
      { name: "Houseboat Stay (shared)", cost: 3000, duration: "Overnight" },
      { name: "Kathakali Dance Show", cost: 300, duration: "2 hours" },
      { name: "Tea Plantation Tour", cost: 500, duration: "3 hours" },
      { name: "Ayurvedic Massage", cost: 1500, duration: "1.5 hours" },
      { name: "Bamboo Rafting", cost: 1000, duration: "2 hours" },
      { name: "Spice Garden Visit", cost: 400, duration: "2 hours" }
    ]
  },
  dubai: {
    name: "Dubai",
    country: "UAE",
    description: "A futuristic city of luxury, skyscrapers, desert adventures, and world-class shopping.",
    bestTimeToVisit: "November to March (cooler temperatures, 20-30°C)",
    avgDailyBudget: { budget: 5000, midRange: 12000, luxury: 35000 },
    flightFromDelhi: { budget: 8000, midRange: 15000, luxury: 40000 },
    topAttractions: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Dubai Marina", "Gold Souk", "Dubai Frame", "Miracle Garden"],
    foodSpecialties: ["Shawarma", "Al Machboos", "Luqaimat", "Camel Burger", "Arabic Coffee"],
    tips: [
      "Use Dubai Metro (₹150-300 per ride) instead of taxis",
      "Visit attractions on weekdays for fewer crowds",
      "Eat at food courts and local cafeterias (₹500-800 per meal)",
      "Buy Dubai Pass for discounted attraction entries",
      "Shop at Deira and Naif Souks for bargains"
    ],
    activities: [
      { name: "Burj Khalifa Observation Deck", cost: 3000, duration: "1.5 hours" },
      { name: "Desert Safari with BBQ", cost: 4000, duration: "6 hours" },
      { name: "Dhow Cruise Dinner", cost: 3500, duration: "2 hours" },
      { name: "Ski Dubai", cost: 2500, duration: "2 hours" },
      { name: "Aquaventure Waterpark", cost: 4500, duration: "Full day" },
      { name: "Global Village", cost: 500, duration: "4 hours" }
    ]
  },
  bangkok: {
    name: "Bangkok",
    country: "Thailand",
    description: "A vibrant city blending ancient temples, street food paradise, and modern nightlife.",
    bestTimeToVisit: "November to February (cool and dry season)",
    avgDailyBudget: { budget: 2500, midRange: 6000, luxury: 20000 },
    flightFromDelhi: { budget: 7000, midRange: 12000, luxury: 30000 },
    topAttractions: ["Grand Palace", "Wat Pho", "Chatuchak Market", "Khao San Road", "Floating Market", "Wat Arun", "MBK Center"],
    foodSpecialties: ["Pad Thai", "Tom Yum Goong", "Mango Sticky Rice", "Som Tum", "Green Curry"],
    tips: [
      "Use BTS Skytrain and MRT metro instead of tuk-tuks",
      "Eat street food - safe and incredibly cheap (₹100-200 per meal)",
      "Visit temples before 10 AM to avoid crowds and heat",
      "Bargain at markets - start at 50% of asking price",
      "Book temples and palaces online to skip ticket queues"
    ],
    activities: [
      { name: "Grand Palace Tour", cost: 1200, duration: "3 hours" },
      { name: "Floating Market Visit", cost: 800, duration: "4 hours" },
      { name: "Thai Cooking Class", cost: 2000, duration: "4 hours" },
      { name: "Thai Massage", cost: 600, duration: "1.5 hours" },
      { name: "Rooftop Bar Experience", cost: 2500, duration: "Evening" },
      { name: "Muay Thai Show", cost: 1500, duration: "2 hours" }
    ]
  },
  bali: {
    name: "Bali",
    country: "Indonesia",
    description: "Island of the Gods - stunning rice terraces, ancient temples, and world-class surfing.",
    bestTimeToVisit: "April to October (dry season, best weather)",
    avgDailyBudget: { budget: 2000, midRange: 5500, luxury: 18000 },
    flightFromDelhi: { budget: 12000, midRange: 18000, luxury: 45000 },
    topAttractions: ["Ubud Rice Terraces", "Tanah Lot Temple", "Uluwatu Temple", "Seminyak Beach", "Mount Batur", "Tirta Empul", "Nusa Penida"],
    foodSpecialties: ["Nasi Goreng", "Babi Guling", "Sate Lilit", "Lawar", "Jamu (herbal drink)"],
    tips: [
      "Rent a scooter (₹300/day) for the best way to explore",
      "Stay in Ubud for culture, Seminyak for beaches and nightlife",
      "Book tours through local guides, not hotel concierge",
      "Visit temples dressed modestly - sarongs provided free at most temples",
      "Exchange money at authorized money changers only"
    ],
    activities: [
      { name: "Sunrise Trek Mount Batur", cost: 3000, duration: "6 hours" },
      { name: "Surfing Lesson", cost: 1500, duration: "2 hours" },
      { name: "Ubud Monkey Forest", cost: 400, duration: "2 hours" },
      { name: "White Water Rafting", cost: 2500, duration: "3 hours" },
      { name: "Balinese Cooking Class", cost: 1800, duration: "4 hours" },
      { name: "Snorkeling at Nusa Penida", cost: 3000, duration: "Full day" }
    ]
  },
  ladakh: {
    name: "Ladakh",
    country: "India",
    description: "The Land of High Passes - breathtaking landscapes, monasteries, and adventure at extreme altitude.",
    bestTimeToVisit: "June to September (roads open, pleasant weather)",
    avgDailyBudget: { budget: 1800, midRange: 4000, luxury: 10000 },
    flightFromDelhi: { budget: 5000, midRange: 8000, luxury: 15000 },
    topAttractions: ["Pangong Lake", "Nubra Valley", "Magnetic Hill", "Thiksey Monastery", "Khardung La Pass", "Leh Palace", "Zanskar Valley"],
    foodSpecialties: ["Thukpa", "Momos", "Butter Tea", "Skyu", "Chhurpi"],
    tips: [
      "Spend 2 days acclimatizing in Leh before heading to high-altitude areas",
      "Carry altitude sickness medicine (Diamox)",
      "Book inner line permits online in advance for Pangong and Nubra",
      "Share taxis with other travelers to split costs",
      "Carry cash - ATMs are unreliable outside Leh"
    ],
    activities: [
      { name: "Pangong Lake Day Trip", cost: 2500, duration: "Full day" },
      { name: "River Rafting on Zanskar", cost: 2000, duration: "3 hours" },
      { name: "Monastery Tour", cost: 500, duration: "Half day" },
      { name: "Mountain Biking", cost: 1500, duration: "Half day" },
      { name: "Camel Safari in Nubra", cost: 800, duration: "1 hour" },
      { name: "Camping at Pangong", cost: 2000, duration: "Overnight" }
    ]
  },
  paris: {
    name: "Paris",
    country: "France",
    description: "The City of Light - art, architecture, gastronomy, and romance at every corner.",
    bestTimeToVisit: "April to June, September to October (mild weather, fewer crowds)",
    avgDailyBudget: { budget: 6000, midRange: 15000, luxury: 45000 },
    flightFromDelhi: { budget: 25000, midRange: 40000, luxury: 150000 },
    topAttractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées", "Sacré-Cœur", "Versailles", "Musée d'Orsay"],
    foodSpecialties: ["Croissant", "Crêpes", "Coq au Vin", "Macarons", "French Onion Soup", "Escargot"],
    tips: [
      "Buy a Paris Museum Pass for skip-the-line access",
      "Use the Metro - cheapest and fastest way around the city",
      "Eat at local boulangeries for cheap, amazing food",
      "Visit major attractions at opening time",
      "Get a Navigo Découverte weekly pass for unlimited Metro rides"
    ],
    activities: [
      { name: "Eiffel Tower Summit", cost: 2500, duration: "2 hours" },
      { name: "Louvre Museum", cost: 1500, duration: "4 hours" },
      { name: "Seine River Cruise", cost: 1200, duration: "1.5 hours" },
      { name: "Versailles Day Trip", cost: 2000, duration: "Full day" },
      { name: "Wine Tasting", cost: 3500, duration: "2 hours" },
      { name: "Cooking Class", cost: 5000, duration: "3 hours" }
    ]
  },
  singapore: {
    name: "Singapore",
    country: "Singapore",
    description: "A futuristic city-state blending Asian cultures, stunning architecture, and incredible food.",
    bestTimeToVisit: "February to April (least rainfall, comfortable temperatures)",
    avgDailyBudget: { budget: 4000, midRange: 10000, luxury: 30000 },
    flightFromDelhi: { budget: 10000, midRange: 18000, luxury: 50000 },
    topAttractions: ["Marina Bay Sands", "Gardens by the Bay", "Sentosa Island", "Chinatown", "Little India", "Orchard Road", "Universal Studios"],
    foodSpecialties: ["Hainanese Chicken Rice", "Chilli Crab", "Laksa", "Satay", "Kaya Toast"],
    tips: [
      "Eat at hawker centers - Michelin-star food for ₹200-400",
      "Use EZ-Link card for public transport savings",
      "Gardens by the Bay light show is free every evening",
      "Book attractions on Klook for 20-30% discounts",
      "Visit museums on free admission days"
    ],
    activities: [
      { name: "Universal Studios", cost: 5000, duration: "Full day" },
      { name: "Gardens by the Bay", cost: 1500, duration: "3 hours" },
      { name: "Night Safari", cost: 3000, duration: "3 hours" },
      { name: "Marina Bay Sands Observation", cost: 2000, duration: "1 hour" },
      { name: "Sentosa Island", cost: 2500, duration: "Full day" },
      { name: "River Cruise", cost: 800, duration: "40 mins" }
    ]
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    description: "A dazzling blend of ultra-modern technology, ancient temples, and world-class cuisine.",
    bestTimeToVisit: "March to May (cherry blossoms), October to November (autumn foliage)",
    avgDailyBudget: { budget: 5000, midRange: 12000, luxury: 40000 },
    flightFromDelhi: { budget: 15000, midRange: 25000, luxury: 70000 },
    topAttractions: ["Senso-ji Temple", "Shibuya Crossing", "Meiji Shrine", "Tokyo Skytree", "Akihabara", "Tsukiji Outer Market", "Harajuku"],
    foodSpecialties: ["Ramen", "Sushi", "Tempura", "Matcha Desserts", "Takoyaki"],
    tips: [
      "Get a 7-day Japan Rail Pass for unlimited bullet train travel",
      "Eat at conveyor belt sushi restaurants for affordable sushi",
      "Use IC cards (Suica/Pasmo) for seamless metro travel",
      "Visit temples early morning for a peaceful experience",
      "Try convenience store (konbini) food — surprisingly amazing"
    ],
    activities: [
      { name: "Teamlab Borderless", cost: 2500, duration: "2 hours" },
      { name: "Sumo Wrestling Match", cost: 4000, duration: "3 hours" },
      { name: "Sushi Making Class", cost: 5000, duration: "2 hours" },
      { name: "Day Trip to Mt. Fuji", cost: 6000, duration: "Full day" },
      { name: "Robot Restaurant Show", cost: 5500, duration: "1.5 hours" },
      { name: "Kimono Rental & Walk", cost: 3000, duration: "3 hours" }
    ]
  },
  maldives: {
    name: "Maldives",
    country: "Maldives",
    description: "A tropical paradise of crystal-clear lagoons, overwater villas, and vibrant coral reefs.",
    bestTimeToVisit: "November to April (dry season, calm seas, best visibility)",
    avgDailyBudget: { budget: 4000, midRange: 15000, luxury: 50000 },
    flightFromDelhi: { budget: 10000, midRange: 18000, luxury: 45000 },
    topAttractions: ["Overwater Bungalows", "Banana Reef", "Male Fish Market", "Hulhumale Beach", "Bioluminescent Beach", "Underwater Restaurant", "Local Island Hopping"],
    foodSpecialties: ["Mas Huni", "Garudhiya (fish soup)", "Grilled Reef Fish", "Roshi & Curry", "Fresh Coconut"],
    tips: [
      "Stay on local islands (Maafushi, Thulusdhoo) instead of resorts to save 70%",
      "Book guesthouse + excursion combos for best deals",
      "Visit during shoulder season (May/Oct) for lower prices",
      "Bring reef-safe sunscreen — it's expensive locally",
      "Use public ferries instead of speedboats between islands"
    ],
    activities: [
      { name: "Snorkeling Safari", cost: 3000, duration: "3 hours" },
      { name: "Sunset Dolphin Cruise", cost: 2500, duration: "2 hours" },
      { name: "Scuba Diving (2 dives)", cost: 6000, duration: "4 hours" },
      { name: "Night Fishing", cost: 2000, duration: "3 hours" },
      { name: "Sandbank Picnic", cost: 3500, duration: "Half day" },
      { name: "Bioluminescent Beach Tour", cost: 1500, duration: "2 hours" }
    ]
  },
  varanasi: {
    name: "Varanasi",
    country: "India",
    description: "The spiritual capital of India — ancient ghats, mesmerizing aarti ceremonies, and timeless culture.",
    bestTimeToVisit: "October to March (pleasant weather, festival season including Dev Deepawali)",
    avgDailyBudget: { budget: 800, midRange: 2500, luxury: 7000 },
    flightFromDelhi: { budget: 2500, midRange: 4000, luxury: 9000 },
    topAttractions: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath", "Assi Ghat", "Manikarnika Ghat", "Ramnagar Fort", "BHU Campus"],
    foodSpecialties: ["Kachori Sabzi", "Banarasi Paan", "Lassi", "Chaat", "Malaiyo (winter sweet)"],
    tips: [
      "Take a sunrise boat ride on the Ganges — magical experience",
      "Stay near Assi Ghat for a quieter, traveler-friendly area",
      "Attend the Ganga Aarti at Dashashwamedh Ghat every evening",
      "Hire a local guide for the old city lanes — easy to get lost",
      "Buy Banarasi silk directly from weaver families in the old city"
    ],
    activities: [
      { name: "Sunrise Boat Ride", cost: 300, duration: "1.5 hours" },
      { name: "Ganga Aarti Experience", cost: 0, duration: "1 hour" },
      { name: "Sarnath Day Trip", cost: 500, duration: "Half day" },
      { name: "Silk Weaving Workshop", cost: 800, duration: "2 hours" },
      { name: "Old City Walking Tour", cost: 400, duration: "3 hours" },
      { name: "Classical Music Concert", cost: 300, duration: "2 hours" }
    ]
  },
  newyork: {
    name: "New York",
    country: "USA",
    description: "The city that never sleeps — iconic skyline, Broadway, Central Park, and world-class everything.",
    bestTimeToVisit: "April to June, September to November (mild weather, fewer crowds)",
    avgDailyBudget: { budget: 8000, midRange: 18000, luxury: 50000 },
    flightFromDelhi: { budget: 32000, midRange: 55000, luxury: 180000 },
    topAttractions: ["Statue of Liberty", "Central Park", "Times Square", "Brooklyn Bridge", "Empire State Building", "Metropolitan Museum", "Broadway"],
    foodSpecialties: ["New York Pizza", "Bagels", "Cheesecake", "Pastrami Sandwich", "Hot Dogs"],
    tips: [
      "Buy a CityPASS for discounted entry to top attractions",
      "Use the subway — fastest and cheapest way around the city",
      "Eat at halal carts and delis for affordable meals ($5-10)",
      "Visit museums on pay-what-you-wish days",
      "Walk across the Brooklyn Bridge at sunset — free and stunning"
    ],
    activities: [
      { name: "Statue of Liberty Tour", cost: 2000, duration: "4 hours" },
      { name: "Broadway Show", cost: 8000, duration: "2.5 hours" },
      { name: "Top of the Rock", cost: 3500, duration: "1.5 hours" },
      { name: "Food Tour (Chinatown/Little Italy)", cost: 4000, duration: "3 hours" },
      { name: "Central Park Bike Ride", cost: 1500, duration: "2 hours" },
      { name: "9/11 Memorial & Museum", cost: 2500, duration: "2 hours" }
    ]
  },
  bhubaneswar: {
    name: "Bhubaneswar",
    country: "India",
    description: "The Temple City of India — over 700 ancient temples, rich Odia culture, and gateway to Odisha's treasures.",
    bestTimeToVisit: "October to March (cool, pleasant weather ideal for temple hopping)",
    avgDailyBudget: { budget: 800, midRange: 2200, luxury: 6000 },
    flightFromDelhi: { budget: 3000, midRange: 5000, luxury: 11000 },
    topAttractions: ["Lingaraj Temple", "Udayagiri & Khandagiri Caves", "Dhauli Peace Pagoda", "Nandankanan Zoo", "Rajarani Temple", "ISKCON Temple", "Tribal Museum"],
    foodSpecialties: ["Dalma", "Chhena Poda", "Pakhala Bhata", "Machha Jhola", "Rasgulla"],
    tips: [
      "Combine with Puri (60 km) and Konark (65 km) for a full Odisha trip",
      "Visit Lingaraj Temple early morning for fewer crowds",
      "Auto-rickshaws are cheap — negotiate fare before boarding",
      "Try street food near Saheed Nagar market",
      "Visit Nandankanan Zoo on weekdays — it's one of India's best"
    ],
    activities: [
      { name: "Temple Trail Tour", cost: 500, duration: "4 hours" },
      { name: "Udayagiri Caves Exploration", cost: 200, duration: "2 hours" },
      { name: "Day Trip to Puri & Konark", cost: 1500, duration: "Full day" },
      { name: "Nandankanan Zoo Visit", cost: 300, duration: "3 hours" },
      { name: "Odia Cooking Class", cost: 600, duration: "2 hours" },
      { name: "Dhauli Peace Pagoda Sunset", cost: 0, duration: "1.5 hours" }
    ]
  }
};

export function findDestination(query: string): DestinationData | null {
  const normalized = query.toLowerCase().trim();
  for (const [key, dest] of Object.entries(destinations)) {
    if (normalized.includes(key) || normalized.includes(dest.name.toLowerCase())) {
      return dest;
    }
  }
  return null;
}

export function getAllDestinationNames(): string[] {
  return Object.values(destinations).map(d => d.name);
}

export function getDestinationsByBudget(dailyBudget: number, style: string): DestinationData[] {
  return Object.values(destinations).filter(d => {
    const cost = d.avgDailyBudget[style as keyof typeof d.avgDailyBudget] || d.avgDailyBudget.midRange;
    return cost <= dailyBudget * 1.3; // 30% tolerance
  });
}
