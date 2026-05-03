import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlannerState, initialPlannerState } from "./planner-steps/types";
import StepIntent from "./planner-steps/StepIntent";
import StepDestination from "./planner-steps/StepDestination";
import StepBudget from "./planner-steps/StepBudget";
import StepDuration from "./planner-steps/StepDuration";
import StepTravelers from "./planner-steps/StepTravelers";
import StepStyle from "./planner-steps/StepStyle";
import StepDates from "./planner-steps/StepDates";
import StepPreferences from "./planner-steps/StepPreferences";
import OutputScreen from "./planner-steps/OutputScreen";
import LivePreviewPanel from "./planner-steps/LivePreviewPanel";
import { ChevronLeft, Compass, Menu } from "lucide-react";
import { clearAIEstimateCache } from "../hooks/useAIEstimate";

const steps = [
  "INTENT",
  "DESTINATION",
  "BUDGET",
  "DURATION",
  "TRAVELERS",
  "STYLE",
  "DATES",
  "PREFERENCES",
  "OUTPUT",
];

export default function GuidedPlanner() {
  const [state, setState] = useState<PlannerState>(initialPlannerState);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const updateState = (updates: Partial<PlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      let nextIndex = currentStepIndex + 1;
      
      // Adaptive questioning logic
      if (steps[nextIndex] === "TRAVELERS" && state.intent === "Solo") {
         nextIndex++; // skip travelers if solo
      }
      
      setCurrentStepIndex(nextIndex);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      let prevIndex = currentStepIndex - 1;
      
      if (steps[prevIndex] === "TRAVELERS" && state.intent === "Solo") {
        prevIndex--;
      }
      
      setCurrentStepIndex(prevIndex);
    }
  };

  const currentStepId = steps[currentStepIndex];
  const isOutput = currentStepId === "OUTPUT";

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden text-foreground relative">
      <div className="mesh-bg z-0" />

      {/* Header */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between z-20 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {!isOutput && currentStepIndex > 0 && (
            <button onClick={prevStep} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">SanYush <span className="text-primary">AI</span></h1>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">Travel Architect</p>
            </div>
          </div>
        </div>
        
        {!isOutput && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
              Step {currentStepIndex + 1} / {steps.length - 1}
            </div>
            <button 
              className="md:hidden p-2 rounded-lg bg-secondary text-foreground border border-border"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Progress Bar */}
      {!isOutput && (
        <div className="absolute top-[68px] left-0 right-0 h-1 bg-secondary z-30">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-terracotta"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / (steps.length - 2)) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 relative z-10 flex overflow-hidden">
        
        {/* Left: Questions Area */}
        <div className={`flex-1 relative overflow-y-auto chat-scrollbar flex flex-col ${isOutput ? "w-full" : "md:w-3/5"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepId}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full max-w-2xl mx-auto px-6 py-10 flex-1 flex flex-col ${isOutput ? "justify-start max-w-5xl" : "justify-center"}`}
            >
              {currentStepId === "INTENT" && <StepIntent state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "DESTINATION" && <StepDestination state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "BUDGET" && <StepBudget state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "DURATION" && <StepDuration state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "TRAVELERS" && <StepTravelers state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "STYLE" && <StepStyle state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "DATES" && <StepDates state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "PREFERENCES" && <StepPreferences state={state} updateState={updateState} onNext={nextStep} />}
              {currentStepId === "OUTPUT" && <OutputScreen state={state} onReset={() => { clearAIEstimateCache(); setState(initialPlannerState); setCurrentStepIndex(0); }} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Live Preview Panel (Desktop) */}
        {!isOutput && (
          <div className="hidden md:block w-2/5 preview-panel relative z-20">
            <LivePreviewPanel state={state} />
          </div>
        )}

        {/* Bottom/Drawer: Live Preview Panel (Mobile) */}
        {!isOutput && showMobilePreview && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="md:hidden absolute inset-x-0 bottom-0 h-3/4 preview-panel z-50 rounded-t-3xl border-t border-border"
          >
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mt-4 mb-2" />
            <div className="h-full pb-8">
              <LivePreviewPanel state={state} />
            </div>
            <button 
              onClick={() => setShowMobilePreview(false)}
              className="absolute top-4 right-4 p-2 bg-secondary rounded-full"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
