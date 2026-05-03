import { PlannerState } from "../components/planner-steps/types";

export class PlanningEngine {
  
  static getTravelerCount(travelersStr: string) {
    let travelerCount = 1;
    if (travelersStr.includes("Couple")) travelerCount = 2;
    if (travelersStr.includes("Family")) travelerCount = 4;
    if (travelersStr.includes("Group") || travelersStr.includes("Friends")) travelerCount = 4;
    return travelerCount;
  }

  static calculateEstimatedBudget(destination: string, days: number, travelers: number, style: string, maxBudget: number) {
    const destKey = destination.toLowerCase().trim();
    let index = 1.0;
    
    // Destination Cost Multiplier
    if (destKey.includes("paris") || destKey.includes("london") || destKey.includes("york") || destKey.includes("swiss")) index = 2.5;
    else if (destKey.includes("dubai") || destKey.includes("tokyo") || destKey.includes("singapore")) index = 2.0;
    else if (destKey.includes("maldives")) index = 3.5;
    else if (destKey.includes("bali") || destKey.includes("phuket") || destKey.includes("bangkok")) index = 0.8;
    else if (destKey.includes("goa") || destKey.includes("kerala") || destKey.includes("india")) index = 0.6;
    
    let styleMult = 1.0;
    if (style === "Luxury") styleMult = 2.5;
    if (style === "Budget-friendly" || style === "Budget") styleMult = 0.6;
    if (style === "Backpacking") styleMult = 0.4;
    
    // Base costs per person (INR)
    const baseTravel = 12000 * index * (styleMult > 1 ? 1.5 : 1); 
    const baseHotelPerDay = 3500 * index * styleMult;
    const baseFoodPerDay = 1500 * index * styleMult;
    const baseActPerDay = 1200 * index * styleMult;
    const baseMiscPerDay = 500 * index;
    
    let travel = Math.round(baseTravel * travelers);
    let hotel = Math.round(baseHotelPerDay * days * travelers);
    let food = Math.round(baseFoodPerDay * days * travelers);
    let activities = Math.round(baseActPerDay * days * travelers);
    let miscellaneous = Math.round(baseMiscPerDay * days * travelers);
    
    // Ensure numbers end nicely (e.g. nearest 500)
    travel = Math.round(travel / 500) * 500;
    hotel = Math.round(hotel / 500) * 500;
    food = Math.round(food / 500) * 500;
    activities = Math.round(activities / 500) * 500;
    miscellaneous = Math.round(miscellaneous / 500) * 500;

    let total = travel + hotel + food + activities + miscellaneous;
    
    return {
      travel,
      hotel,
      food,
      activities,
      miscellaneous,
      total
    };
  }

  static generateItinerary(destination: string, days: number, dailyActivityFoodBudget: number, preferences: string[]) {
    const itinerary = [];
    
    const mainActivity = preferences && preferences.length > 0 ? `${preferences[0]} Exploration` : "City Sightseeing";
    const altActivity = preferences && preferences.length > 1 ? preferences[1] : "Local Culture";

    for (let i = 1; i <= days; i++) {
      if (i === 1) {
        itinerary.push({ 
          day: 1, 
          title: `Arrival in ${destination}`, 
          activities: ["Airport Transfer", "Hotel Check-in", "Light local walking tour", "Welcome Dinner"], 
          estimatedCost: Math.round(dailyActivityFoodBudget * 0.7) 
        });
      } else if (i === days) {
        itinerary.push({ 
          day: days, 
          title: "Departure Day", 
          activities: ["Morning Cafe Breakfast", "Last minute souvenir shopping", "Airport Transfer"], 
          estimatedCost: Math.round(dailyActivityFoodBudget * 0.4) 
        });
      } else if (i % 2 === 0) {
        itinerary.push({ 
          day: i, 
          title: `${mainActivity} Day`, 
          activities: [`Morning ${mainActivity.toLowerCase()} tour`, "Local cuisine lunch", "Afternoon leisure", "Evening entertainment"], 
          estimatedCost: Math.round(dailyActivityFoodBudget * 1.2) 
        });
      } else {
        itinerary.push({ 
          day: i, 
          title: `${altActivity} & Discovery`, 
          activities: ["Guided morning experience", "Street food / casual lunch", `Afternoon ${altActivity.toLowerCase()}`, "Relaxing dinner"], 
          estimatedCost: dailyActivityFoodBudget 
        });
      }
    }
    
    return itinerary;
  }

  static run(state: PlannerState, targetDest: string) {
    const days = parseInt(state.duration.split(" ")[0]) || 3;
    const travelerCount = this.getTravelerCount(state.travelers);
    
    const dest = targetDest || state.destination || "Unknown Destination";
    
    const budgetSplit = this.calculateEstimatedBudget(dest, days, travelerCount, state.style || "Balanced", state.budget);
    
    const dailyActivityFoodBudget = Math.round((budgetSplit.food + budgetSplit.activities) / days);
    const itinerary = this.generateItinerary(dest, days, dailyActivityFoodBudget, state.preferences || []);

    return {
      budgetCard: {
        destination: dest.charAt(0).toUpperCase() + dest.slice(1),
        days: days,
        style: state.style || "Balanced",
        ...budgetSplit
      },
      itinerary: itinerary,
      confidenceScore: 92
    };
  }
}
