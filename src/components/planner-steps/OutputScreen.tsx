import { useState, useEffect } from "react";
import { PlannerState } from "./types";
import { Loader2, RefreshCcw, Home, Download, Settings, Map as MapIcon, Calendar as CalendarIcon, Wallet as WalletIcon, BaggageClaim } from "lucide-react";
import { goldenPaths, applyFakeVariability } from "../../lib/golden-paths";
import { motion, AnimatePresence } from "framer-motion";
import BudgetCard from "../BudgetCard";
import BudgetSplitter from "../BudgetSplitter";
import CurrencyConverter from "../CurrencyConverter";
import TimelineItinerary from "../TimelineItinerary";
import PhotoGallery from "../PhotoGallery";
import CultureWidget from "../CultureWidget";
import BookingLinks from "../BookingLinks";
import WeatherWidget from "../WeatherWidget";
import MapView from "../MapView";
import PackingList from "../PackingList";
import MultiPlanSelector from "./MultiPlanSelector";
import ScenarioSimulator from "./ScenarioSimulator";
import ExplainabilityWidget from "./ExplainabilityWidget";
import { PlanningEngine } from "../../lib/planning-engine";

interface Props {
  state: PlannerState;
  onReset: () => void;
}

export default function OutputScreen({ state, onReset }: Props) {
  const [loading, setLoading] = useState(state.destinationMode === "known");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any | null>(null);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (state.destinationMode === "known") {
      generatePlan(state.destination.toLowerCase());
    }
  }, []);

  const handleSelectPlan = (key: string) => {
    setSelectedPlanKey(key);
    generatePlan(key);
  };

  const generatePlan = async (targetDestString: string = "") => {
    setLoading(true);
    setError(null);
    try {
      // --- DEMO HACK: Smart Interception ---
      let matchedPath = null;
      if (targetDestString.includes("goa")) matchedPath = goldenPaths.goa;
      else if (targetDestString.includes("dubai")) matchedPath = goldenPaths.dubai;
      else if (targetDestString.includes("bali")) matchedPath = goldenPaths.bali;

      if (matchedPath) {
        console.log("DEMO MODE: Intercepting query and loading Golden Path JSON.");
        await new Promise(r => setTimeout(r, 1500));
        const dynamicPlan = applyFakeVariability(matchedPath, state.budget);
        setPlan(dynamicPlan);
        setLoading(false);
        return;
      }
      // ------------------------------------

      // --- DETERMINISTIC ENGINE FALLBACK ---
      await new Promise(r => setTimeout(r, 1200)); 
      const generatedPlan = PlanningEngine.run(state, targetDestString);
      setPlan(generatedPlan);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (state.destinationMode === "suggest" && !selectedPlanKey) {
    return <MultiPlanSelector state={state} onSelect={handleSelectPlan} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 pt-20">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <Loader2 className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">Crafting your perfect trip...</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Analyzing {state.destinationMode === "known" ? state.destination : "destinations"} for {state.travelers} within ₹{state.budget.toLocaleString("en-IN")}.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-6 pt-20">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
          <RefreshCcw className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold">Plan Generation Failed</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">{error}</p>
        <button onClick={() => generatePlan(state.destination)} className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity">
          <RefreshCcw className="w-5 h-5" /> Try Again
        </button>
      </div>
    );
  }

  const dest = plan?.budgetCard?.destination;

  const handleSimulate = async (type: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); 
    
    setPlan((prev: any) => {
      const p = JSON.parse(JSON.stringify(prev));
      if (!p?.budgetCard) return p;

      if (type === "add_budget") {
        p.budgetCard.hotel += 10000;
        p.budgetCard.activities += 10000;
        p.budgetCard.total += 20000;
        p.budgetCard.style = "Luxury";
      } else if (type === "add_days") {
        p.budgetCard.days += 2;
        p.budgetCard.hotel += Math.floor(p.budgetCard.hotel * 0.4);
        p.budgetCard.food += Math.floor(p.budgetCard.food * 0.4);
        p.budgetCard.total = p.budgetCard.travel + p.budgetCard.hotel + p.budgetCard.food + p.budgetCard.activities + p.budgetCard.miscellaneous;
      } else if (type === "upgrade_luxury") {
        p.budgetCard.hotel *= 2.5;
        p.budgetCard.style = "Premium Luxury";
        p.budgetCard.total = p.budgetCard.travel + p.budgetCard.hotel + p.budgetCard.food + p.budgetCard.activities + p.budgetCard.miscellaneous;
      } else if (type === "more_activities") {
        p.budgetCard.activities += 15000;
        p.budgetCard.total += 15000;
      }
      return p;
    });
    
    setLoading(false);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "itinerary", label: "Itinerary", icon: CalendarIcon },
    { id: "budget", label: "Budget & Booking", icon: WalletIcon },
    { id: "map", label: "Map & Weather", icon: MapIcon },
    { id: "packing", label: "Packing List", icon: BaggageClaim },
  ];

  return (
    <div className="w-full pb-20">
      
      {/* ── Hero Section ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-xs font-bold text-primary mb-4">
              ✨ PLAN READY
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-2">
              <span className="text-gradient-warm">{dest}</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Tailored {state.intent} plan for {state.travelers} · {plan?.budgetCard?.days} days
            </p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onReset} className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground" title="Start Over">
              <Home className="w-5 h-5" />
            </button>
            <button className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity" title="Export PDF">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs Navigation ── */}
      <div className="flex overflow-x-auto chat-scrollbar gap-1 border-b border-border mb-8 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-all whitespace-nowrap ${isActive ? 'tab-active' : 'tab-inactive'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {dest && <PhotoGallery destination={dest} />}
              
              <ExplainabilityWidget state={state} plan={plan} />
              
              <div className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl">
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">Want to tweak the parameters?</h3>
                  <p className="text-sm text-muted-foreground">Adjust duration, style, or budget to see how it affects the plan.</p>
                </div>
                <button onClick={onReset} className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" /> Refine Plan
                </button>
              </div>

              <ScenarioSimulator onSimulate={handleSimulate} />
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === "itinerary" && plan?.itinerary && (
            <div className="space-y-6">
              <TimelineItinerary itinerary={plan.itinerary} />
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === "budget" && plan?.budgetCard && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BudgetCard budget={plan.budgetCard} />
                <BudgetSplitter budget={plan.budgetCard} />
                <CurrencyConverter amountInr={plan.budgetCard.total} />
              </div>
              
              {dest && <BookingLinks destination={dest} />}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === "map" && dest && (
            <div className="space-y-8">
              <MapView destination={dest} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WeatherWidget destination={dest} />
                <CultureWidget destination={dest} />
              </div>
            </div>
          )}

          {/* Packing Tab */}
          {activeTab === "packing" && dest && (
            <PackingList destination={dest} />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
