// ============================================================
// AI TRAVEL BUDGET PLANNER — CONVERSATION ENGINE
// Handles smart multi-turn conversation, budget calculations,
// itinerary generation, and global destination support.
// ============================================================

import { findDestination, getAllDestinationNames, getDestinationsByBudget, type DestinationData } from "./travel-data";
import { resolveDestination, extractDestinationName, classifyDestination } from "./destination-intelligence";

// ── Types ─────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  budgetCard?: BudgetBreakdown;
  itinerary?: ItineraryDay[];
  comparison?: ComparisonData;
}

export interface BudgetBreakdown {
  destination: string;
  days: number;
  style: string;
  travel: number;
  hotel: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  estimatedCost: number;
}

export interface ComparisonData {
  destinations: {
    name: string;
    totalCost: number;
    dailyCost: number;
    highlights: string[];
    bestFor: string;
  }[];
}

// ── Conversation State ────────────────────────────────────

interface ConversationState {
  destination: string | null;
  days: number | null;
  budget: number | null;
  style: "budget" | "midRange" | "luxury" | null;
  stage: "greeting" | "destination" | "days" | "budget" | "style" | "generating" | "followup";
  destinationData: DestinationData | null;
  isKnownDestination: boolean;
  compareMode: boolean;
  compareDestinations: string[];
}

let state: ConversationState = {
  destination: null, days: null, budget: null, style: null,
  stage: "greeting", destinationData: null, isKnownDestination: true,
  compareMode: false, compareDestinations: [],
};

export function resetConversation() {
  state = {
    destination: null, days: null, budget: null, style: null,
    stage: "greeting", destinationData: null, isKnownDestination: true,
    compareMode: false, compareDestinations: [],
  };
}

// ── Utility Functions ─────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/** Parse numeric values including lakh/k/comma/₹ notations */
function extractNumber(text: string): number | null {
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/i);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const cleaned = text.replace(/[₹,\s]/g, "");
  const numMatch = cleaned.match(/(\d+)/);
  return numMatch ? parseInt(numMatch[1]) : null;
}

/** Extract day count specifically (handles "5 day", "for 3 days", etc.) */
function extractDays(text: string): number | null {
  const dayMatch = text.match(/(\d+)\s*(?:day|night)/i);
  if (dayMatch) {
    const d = parseInt(dayMatch[1]);
    if (d >= 1 && d <= 30) return d;
  }
  return null;
}

/** Detect travel style from text */
function detectStyle(text: string): "budget" | "midRange" | "luxury" | null {
  if (/budget|cheap|econom|backpack|hostel|save|low.?cost|frugal/i.test(text)) return "budget";
  if (/luxury|premium|5\s*star|lavish|vip|splurge|high.?end/i.test(text)) return "luxury";
  if (/mid|moderate|comfort|standard|normal|average/i.test(text)) return "midRange";
  return null;
}

function detectCompare(text: string): boolean {
  return /compare|vs\.?|versus|or\b.*\bor\b|between|which.*better/i.test(text);
}

/** Pick a random variant from an array for human-like responses */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Budget Calculation Engine ─────────────────────────────

function generateBudget(dest: DestinationData, days: number, style: string): BudgetBreakdown {
  const s = style as keyof typeof dest.avgDailyBudget;
  const dailyCost = dest.avgDailyBudget[s] || dest.avgDailyBudget.midRange;
  const flightCost = dest.flightFromDelhi[s] || dest.flightFromDelhi.midRange;

  const hotelPerDay = dailyCost * 0.4;
  const foodPerDay = dailyCost * 0.25;
  const activitiesPerDay = dailyCost * 0.25;
  const miscPerDay = dailyCost * 0.1;

  return {
    destination: dest.name,
    days,
    style,
    travel: flightCost * 2,
    hotel: Math.round(hotelPerDay * days),
    food: Math.round(foodPerDay * days),
    activities: Math.round(activitiesPerDay * days),
    miscellaneous: Math.round(miscPerDay * days),
    total: Math.round(flightCost * 2 + dailyCost * days),
  };
}

// ── Itinerary Generation Engine ───────────────────────────

function generateItinerary(dest: DestinationData, days: number, style: string): ItineraryDay[] {
  const itinerary: ItineraryDay[] = [];
  const attractions = [...dest.topAttractions];
  const activities = [...dest.activities];
  const dailyBudget = dest.avgDailyBudget[style as keyof typeof dest.avgDailyBudget] || dest.avgDailyBudget.midRange;

  for (let d = 1; d <= days; d++) {
    const dayActivities: string[] = [];
    let dayCost = 0;

    if (d === 1) {
      dayActivities.push("✈️ Arrive and check into hotel");
      dayActivities.push("🏨 Rest and freshen up");
      if (attractions.length > 0) {
        dayActivities.push(`🌆 Evening: Explore ${attractions.shift()}`);
      }
      dayActivities.push(`🍽️ Dinner: Try local ${dest.foodSpecialties[0] || "cuisine"}`);
      dayCost = dailyBudget * 0.6;
    } else if (d === days) {
      if (attractions.length > 0) {
        dayActivities.push(`📸 Morning: Visit ${attractions.shift()}`);
      }
      dayActivities.push("🛍️ Last-minute shopping and souvenirs");
      dayActivities.push(`🍽️ Farewell lunch: ${dest.foodSpecialties[Math.min(d, dest.foodSpecialties.length - 1)] || "local specialty"}`);
      dayActivities.push("✈️ Check out and depart");
      dayCost = dailyBudget * 0.5;
    } else {
      // Full day exploration
      const morningAttraction = attractions.shift();
      if (morningAttraction) {
        dayActivities.push(`🌅 Morning: ${morningAttraction}`);
      }
      const activity = activities.shift();
      if (activity) {
        dayActivities.push(`🎯 ${activity.name} (${activity.duration}) — ₹${activity.cost.toLocaleString("en-IN")}`);
        dayCost += activity.cost;
      }
      const afternoonAttraction = attractions.shift();
      if (afternoonAttraction) {
        dayActivities.push(`🏛️ Afternoon: ${afternoonAttraction}`);
      }
      dayActivities.push(`🍽️ Food: ${dest.foodSpecialties[d % dest.foodSpecialties.length] || "local cuisine"}`);
      dayCost += dailyBudget * 0.6;
    }

    const titles = [
      "Arrival & Exploration", "Cultural Immersion", "Adventure Day",
      "Nature & Relaxation", "Hidden Gems", "Local Experience",
      "Shopping & Sights", "Departure Day",
    ];

    itinerary.push({
      day: d,
      title: d === 1 ? "Arrival & First Impressions" : d === days ? "Farewell Day" : titles[d % (titles.length - 2) + 1],
      activities: dayActivities,
      estimatedCost: Math.round(dayCost),
    });
  }
  return itinerary;
}

// ── Full-input parser: extract everything at once ─────────

interface ParsedInput {
  destination: string | null;
  destinationData: DestinationData | null;
  isKnown: boolean;
  days: number | null;
  budget: number | null;
  style: "budget" | "midRange" | "luxury" | null;
}

function parseUserInput(text: string): ParsedInput {
  const days = extractDays(text);
  const style = detectStyle(text);

  // Try to extract budget — but don't confuse day count with budget
  let budget: number | null = null;
  // Look for explicit budget indicators
  const budgetMatch = text.match(/(?:budget|under|within|around|about|max|total|spend|₹)\s*[₹]?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:lakh|lac|l|k)?/i);
  if (budgetMatch) {
    budget = extractNumber(budgetMatch[0]);
  } else {
    // Extract numbers that look like budgets (>100 and not matching days)
    const allNums = text.match(/\d[\d,]*(?:\.\d+)?\s*(?:lakh|lac|l|k)?/gi) || [];
    for (const n of allNums) {
      const val = extractNumber(n);
      if (val && val > 100 && val !== days) {
        budget = val;
        break;
      }
    }
  }

  // Resolve destination
  const resolved = resolveDestination(text);
  const destName = extractDestinationName(text);

  // Only use fallback if we got a meaningful destination name
  if (destName || findDestination(text)) {
    return {
      destination: resolved.data.name,
      destinationData: resolved.data,
      isKnown: resolved.isKnown,
      days,
      budget,
      style,
    };
  }

  return { destination: null, destinationData: null, isKnown: false, days, budget, style };
}

// ── Main Message Processor ────────────────────────────────

export function processMessage(userText: string): Message {
  const text = userText.trim();
  const lower = text.toLowerCase();

  // ── Handle comparison requests ──────────────────────────
  if (detectCompare(text)) {
    return handleComparison(text, lower);
  }

  // ── Handle reset / new trip ─────────────────────────────
  if (/new trip|start over|reset|plan another/i.test(lower)) {
    resetConversation();
    state.stage = "destination";
    return reply(pick([
      "Fresh start! 🌟 Where would you like to go? Tell me your dream destination!",
      "Let's plan something amazing! 🗺️ Where to this time?",
      "New adventure awaits! ✨ Name any destination in the world!",
    ]));
  }

  // ── Handle best-time-to-visit queries ───────────────────
  if (/best time|when.*visit|when.*go/i.test(lower)) {
    const dest = resolveFromText(text);
    if (dest) {
      return reply(`🗓️ **Best Time to Visit ${dest.name}:**\n\n${dest.bestTimeToVisit}\n\n${dest.tips[0]}\n\nWould you like me to plan a trip to ${dest.name}?`);
    }
  }

  // ── Handle tips request ─────────────────────────────────
  if (/tips|advice|suggest|recommend|save.*money/i.test(lower) && state.destinationData) {
    const dest = state.destinationData;
    const tipsText = dest.tips.map((t, i) => `${i + 1}. ${t}`).join("\n");
    return reply(`💡 **Money-Saving Tips for ${dest.name}:**\n\n${tipsText}\n\nWant me to adjust your budget plan with these savings in mind?`);
  }

  // ── Handle download request ─────────────────────────────
  if (/download|save|export|pdf/i.test(lower)) {
    return reply(`📥 You can download your trip plan using the **Download** button (⬇️) in the header! It'll save as a text file with all your budget details and itinerary.`);
  }

  // ── Main Conversation Flow ──────────────────────────────
  switch (state.stage) {
    case "greeting":
      return handleGreeting(text, lower);
    case "destination":
      return handleDestinationInput(text, lower);
    case "days":
      return handleDaysInput(text);
    case "budget":
      return handleBudgetInput(text);
    case "style":
      return handleStyleInput(text);
    case "followup":
    case "generating":
      return handleFollowup(text, lower);
  }

  return reply("I'm here to help plan your perfect trip! Tell me where you'd like to go — anywhere in the world! 🌍");
}

// ── Stage Handlers ────────────────────────────────────────

function handleGreeting(text: string, lower: string): Message {
  const parsed = parseUserInput(text);

  // User gave a rich input like "Plan a 5 day trip to Bhubaneswar under 30k"
  if (parsed.destination && parsed.destinationData) {
    state.destination = parsed.destination;
    state.destinationData = parsed.destinationData;
    state.isKnownDestination = parsed.isKnown;

    if (parsed.days) state.days = parsed.days;
    if (parsed.budget) state.budget = parsed.budget;
    if (parsed.style) state.style = parsed.style;

    // If we have enough to generate a plan
    if (state.days && (state.style || state.budget)) {
      if (!state.style) state.style = "midRange";
      state.stage = "generating";
      return generatePlan();
    }
    if (state.days) {
      state.stage = "budget";
      const dest = state.destinationData;
      const knownTag = state.isKnownDestination ? "" : "\n\n📝 *I've estimated costs based on the region and destination type.*";
      return reply(`${dest.name} for ${state.days} days — great choice! 🎉\n\n${dest.description}\n\n💰 What's your total budget for this trip? (in INR, e.g., "50000" or "1.5 lakh")${knownTag}`);
    }
    state.stage = "days";
    return reply(`${parsed.destination} — ${pick(["excellent", "wonderful", "amazing", "great"])} choice! 🌟\n\n${parsed.destinationData.description}\n\n📅 How many days are you planning to spend there?`);
  }

  // No destination detected — ask
  state.stage = "destination";
  return reply(`Where would you like to go? 🌍\n\nI can plan trips to **any destination worldwide**! I have detailed data for: **${getAllDestinationNames().join(", ")}**\n\nBut feel free to name *any* city — I'll create a smart plan for it! You can also say *"Compare Goa vs Bangkok"*.`);
}

function handleDestinationInput(text: string, lower: string): Message {
  const parsed = parseUserInput(text);

  if (parsed.destination && parsed.destinationData) {
    state.destination = parsed.destination;
    state.destinationData = parsed.destinationData;
    state.isKnownDestination = parsed.isKnown;

    if (parsed.days) state.days = parsed.days;
    if (parsed.budget) state.budget = parsed.budget;
    if (parsed.style) state.style = parsed.style;

    // Check if enough info to skip ahead
    if (state.days && (state.style || state.budget)) {
      if (!state.style) state.style = "midRange";
      state.stage = "generating";
      return generatePlan();
    }
    if (state.days) {
      state.stage = "budget";
      return reply(`${state.days} days in ${state.destination} — perfect! 👌\n\n💰 What's your total budget? (in INR)`);
    }

    state.stage = "days";
    const dest = parsed.destinationData;
    const knownNote = parsed.isKnown
      ? `\n\n🗓️ **Best time to visit:** ${dest.bestTimeToVisit}`
      : `\n\n📝 *I'll generate a smart plan based on the destination's region and type.*`;
    return reply(`${parsed.destination} — ${pick(["wonderful", "amazing", "great", "fantastic"])}! 🎯\n\n${dest.description}${knownNote}\n\n📅 How many days do you want to spend there?`);
  }

  // Budget-based suggestions
  const budget = extractNumber(text);
  if (budget) {
    const suggestions = getDestinationsByBudget(budget / 5, "midRange");
    if (suggestions.length > 0) {
      return reply(`With a budget around ₹${budget.toLocaleString("en-IN")}, here are some great options:\n\n${suggestions.map(s => `• **${s.name}** — ${s.description.split(" - ")[0]}`).join("\n")}\n\nWhich one interests you? Or name any other destination!`);
    }
  }

  return reply(`I'd love to help! Just tell me a destination — it can be **any city in the world**.\n\nFor example:\n• *"Plan a trip to Bhubaneswar"*\n• *"5 days in Tokyo"*\n• *"Budget trip to Paris"*\n\nOr pick from: **${getAllDestinationNames().join(", ")}**`);
}

function handleDaysInput(text: string): Message {
  const days = extractDays(text) || extractNumber(text);
  if (days && days >= 1 && days <= 30) {
    state.days = days;
    state.stage = "budget";
    const dest = state.destinationData!;
    return reply(`${days} days in ${state.destination} — perfect duration! 👌\n\n💰 What's your total budget for this trip? (in INR)\n\nFor reference, estimated costs:\n• 💚 Budget: ~₹${((dest.avgDailyBudget.budget * days) + dest.flightFromDelhi.budget * 2).toLocaleString("en-IN")}\n• 💛 Mid-range: ~₹${((dest.avgDailyBudget.midRange * days) + dest.flightFromDelhi.midRange * 2).toLocaleString("en-IN")}\n• 💎 Luxury: ~₹${((dest.avgDailyBudget.luxury * days) + dest.flightFromDelhi.luxury * 2).toLocaleString("en-IN")}`);
  }
  return reply(`How many days would you like to spend in ${state.destination}? (1–30 days)\n\nI'd recommend:\n• Weekend getaway: 2–3 days\n• Short trip: 4–5 days\n• Full experience: 7+ days`);
}

function handleBudgetInput(text: string): Message {
  const budget = extractNumber(text);
  const style = detectStyle(text);
  if (budget) {
    state.budget = budget;
    if (style) {
      state.style = style;
      state.stage = "generating";
      return generatePlan();
    }
    state.stage = "style";
    return reply(`Great, ₹${budget.toLocaleString("en-IN")} total budget noted! 📝\n\nWhat's your travel style?\n\n🎒 **Budget** — Hostels, street food, local transport\n🏨 **Mid-Range** — 3-star hotels, restaurants, some activities\n💎 **Luxury** — 5-star resorts, fine dining, premium experiences`);
  }
  if (style) {
    state.style = style;
    const dest = state.destinationData!;
    const days = state.days!;
    const estimated = generateBudget(dest, days, style);
    state.budget = estimated.total;
    state.stage = "generating";
    return generatePlan();
  }
  return reply(`Please enter your total budget in INR. For example:\n• "20000" or "20k"\n• "1.5 lakh"\n• Or just say "budget", "mid-range", or "luxury" and I'll estimate for you!`);
}

function handleStyleInput(text: string): Message {
  const style = detectStyle(text) || "midRange";
  state.style = style;
  state.stage = "generating";
  return generatePlan();
}

function handleFollowup(text: string, lower: string): Message {
  // Activities
  if (/more.*activit|what.*do|things.*do/i.test(lower) && state.destinationData) {
    const acts = state.destinationData.activities;
    const actText = acts.map(a => `• **${a.name}** — ₹${a.cost.toLocaleString("en-IN")} (${a.duration})`).join("\n");
    return reply(`🎯 **Activities in ${state.destination}:**\n\n${actText}\n\nWould you like me to add any of these to your itinerary?`);
  }
  // Food
  if (/food|eat|restaurant|cuisine/i.test(lower) && state.destinationData) {
    return reply(`🍽️ **Must-Try Food in ${state.destination}:**\n\n${state.destinationData.foodSpecialties.map(f => `• ${f}`).join("\n")}\n\n${state.destinationData.tips.find(t => /eat|food|restaurant/i.test(t)) || "Ask locals for the best hidden gems!"}`);
  }

  // Try parsing a completely new request
  const parsed = parseUserInput(text);
  if (parsed.destination && parsed.destinationData) {
    state.destination = parsed.destination;
    state.destinationData = parsed.destinationData;
    state.isKnownDestination = parsed.isKnown;
    state.days = parsed.days || null;
    state.budget = parsed.budget || null;
    state.style = parsed.style || null;

    if (state.days && (state.style || state.budget)) {
      if (!state.style) state.style = "midRange";
      state.stage = "generating";
      return generatePlan();
    }
    if (state.days) {
      state.stage = "budget";
      return reply(`Let's plan **${state.destination}** for ${state.days} days! 🌟\n\n${parsed.destinationData.description}\n\n💰 What's your budget? (in INR)`);
    }
    state.stage = "days";
    return reply(`Let's plan a trip to **${parsed.destination}**! 🌟\n\n${parsed.destinationData.description}\n\n📅 How many days are you planning?`);
  }

  return reply(`I can help you with more! Try:\n\n• 🔄 *"Compare Goa vs Bangkok"*\n• 📋 *"Tips for ${state.destination || "my trip"}"*\n• 🍽️ *"What to eat in ${state.destination || "the destination"}"*\n• 🗓️ *"Best time to visit ${state.destination || "..."}"*\n• 🆕 *"Plan a new trip"* or name any destination\n• 📥 *"Download my plan"*`);
}

// ── Comparison Handler ────────────────────────────────────

function handleComparison(text: string, lower: string): Message {
  // Find all destinations mentioned
  const found: { data: DestinationData; name: string }[] = [];

  // Check known destinations first
  for (const name of getAllDestinationNames()) {
    if (lower.includes(name.toLowerCase())) {
      const d = findDestination(name);
      if (d) found.push({ data: d, name: d.name });
    }
  }

  // Try to extract additional unknown destinations from "X vs Y" pattern
  const vsMatch = lower.match(/(.+?)(?:\s+vs\.?\s+|\s+or\s+|\s+versus\s+|\s+compared?\s+(?:to|with)\s+)(.+)/i);
  if (vsMatch && found.length < 2) {
    const parts = [vsMatch[1].trim(), vsMatch[2].trim()];
    for (const part of parts) {
      const alreadyFound = found.some(f => part.includes(f.name.toLowerCase()));
      if (!alreadyFound) {
        const resolved = resolveDestination(part);
        if (resolved.data) found.push({ data: resolved.data, name: resolved.data.name });
      }
    }
  }

  if (found.length >= 2) {
    const days = state.days || 5;
    const style = state.style || "midRange";
    const comparison: ComparisonData = {
      destinations: found.slice(0, 3).map(f => {
        const budget = generateBudget(f.data, days, style);
        return {
          name: f.data.name,
          totalCost: budget.total,
          dailyCost: f.data.avgDailyBudget[style as keyof typeof f.data.avgDailyBudget],
          highlights: f.data.topAttractions.slice(0, 3),
          bestFor: f.data.description.split(" — ")[1] || f.data.description.split(" - ")[1] || f.data.description.substring(0, 60),
        };
      }),
    };
    return {
      id: makeId(), role: "bot", timestamp: new Date(),
      content: `Here's a comparison of **${found.map(f => f.name).join(" vs ")}** for ${days} days (${style === "midRange" ? "Mid-Range" : style === "budget" ? "Budget" : "Luxury"} style):`,
      comparison,
    };
  }

  return reply(`I'd love to help you compare! Please mention two destinations. For example:\n• *"Compare Goa vs Manali"*\n• *"Bangkok vs Bali"*\n• *"Paris vs Tokyo"*\n\nYou can use **any** destination — not just the ones I have detailed data for!`);
}

// ── Plan Generator ────────────────────────────────────────

function generatePlan(): Message {
  const dest = state.destinationData!;
  const days = state.days!;
  const style = state.style!;
  const budget = generateBudget(dest, days, style);
  const itinerary = generateItinerary(dest, days, style);

  state.stage = "followup";

  const styleLabel = style === "budget" ? "Budget" : style === "luxury" ? "Luxury" : "Mid-Range";

  let budgetWarning = "";
  if (state.budget && state.budget < budget.total * 0.8) {
    budgetWarning = `\n\n⚠️ **Note:** Your budget of ₹${state.budget.toLocaleString("en-IN")} is a bit tight for this plan. Consider:\n• Reducing days\n• Switching to budget style\n• Choosing a closer destination`;
  } else if (state.budget && state.budget > budget.total * 1.5) {
    budgetWarning = `\n\n🎉 **Great news:** You have plenty of budget! Consider upgrading to luxury or adding extra activities.`;
  }

  const knownNote = state.isKnownDestination
    ? ""
    : "\n\n📝 *Costs are estimated based on the destination's region and type. Actual prices may vary.*";

  return {
    id: makeId(), role: "bot", timestamp: new Date(),
    content: `Here's your complete **${styleLabel}** trip plan for **${dest.name}** (${days} days)! 🎉${budgetWarning}${knownNote}\n\nScroll through the budget breakdown and day-wise itinerary below. Ask me anything else — tips, food, or plan a new trip!`,
    budgetCard: budget,
    itinerary,
  };
}

// ── Helpers ───────────────────────────────────────────────

function reply(content: string): Message {
  return { id: makeId(), role: "bot", content, timestamp: new Date() };
}

function resolveFromText(text: string): DestinationData | null {
  const known = findDestination(text);
  if (known) return known;
  if (state.destinationData) return state.destinationData;
  const name = extractDestinationName(text);
  if (name) return resolveDestination(name).data;
  return null;
}

// ── Greeting ──────────────────────────────────────────────

export function getGreetingMessage(): Message {
  return {
    id: makeId(), role: "bot", timestamp: new Date(),
    content: `Hey there! I'm your **AI Travel Budget Planner** ✈️🌍\n\nI'll help you plan the perfect trip with:\n• 💰 Detailed budget breakdown\n• 📅 Day-wise itinerary\n• 🏖️ Destination recommendations\n• 💡 Money-saving tips\n\nI can handle **any destination worldwide** — just tell me where you want to go!\n\nTry: *"Plan a 5 day trip to Bhubaneswar"* or *"3 days in Tokyo budget"*`,
  };
}

// ── Download / Export ─────────────────────────────────────

export function generateDownloadText(): string {
  if (!state.destinationData || !state.days || !state.style) {
    return "No trip plan generated yet. Start a conversation first!";
  }
  const dest = state.destinationData;
  const budget = generateBudget(dest, state.days, state.style);
  const itinerary = generateItinerary(dest, state.days, state.style);
  const styleLabel = state.style === "budget" ? "Budget" : state.style === "luxury" ? "Luxury" : "Mid-Range";

  let text = `╔══════════════════════════════════════╗\n`;
  text += `║   AI TRAVEL BUDGET PLANNER REPORT    ║\n`;
  text += `╚══════════════════════════════════════╝\n\n`;
  text += `📍 Destination: ${dest.name}, ${dest.country}\n`;
  text += `📅 Duration: ${state.days} days\n`;
  text += `💎 Style: ${styleLabel}\n`;
  text += `🗓️ Best Time: ${dest.bestTimeToVisit}\n\n`;
  text += `━━━━━━━ BUDGET BREAKDOWN ━━━━━━━\n`;
  text += `✈️ Travel (flights):  ₹${budget.travel.toLocaleString("en-IN")}\n`;
  text += `🏨 Accommodation:     ₹${budget.hotel.toLocaleString("en-IN")}\n`;
  text += `🍽️ Food & Dining:     ₹${budget.food.toLocaleString("en-IN")}\n`;
  text += `🎯 Activities:        ₹${budget.activities.toLocaleString("en-IN")}\n`;
  text += `📦 Miscellaneous:     ₹${budget.miscellaneous.toLocaleString("en-IN")}\n`;
  text += `─────────────────────────────────\n`;
  text += `💰 TOTAL:             ₹${budget.total.toLocaleString("en-IN")}\n\n`;
  text += `━━━━━━━ DAY-WISE ITINERARY ━━━━━━━\n\n`;
  for (const day of itinerary) {
    text += `📌 Day ${day.day}: ${day.title}\n`;
    for (const act of day.activities) {
      text += `   ${act}\n`;
    }
    text += `   💵 Est. Cost: ₹${day.estimatedCost.toLocaleString("en-IN")}\n\n`;
  }
  text += `━━━━━━━ TOP ATTRACTIONS ━━━━━━━\n`;
  dest.topAttractions.forEach(a => { text += `• ${a}\n`; });
  text += `\n━━━━━━━ MONEY-SAVING TIPS ━━━━━━━\n`;
  dest.tips.forEach(t => { text += `💡 ${t}\n`; });
  text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated by AI Travel Budget Planner\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  return text;
}
