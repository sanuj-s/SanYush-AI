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
import { ChevronLeft } from "lucide-react";

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

  const updateState = (updates: Partial<PlannerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      // Logic for adaptive questioning
      let nextIndex = currentStepIndex + 1;
      
      // Example: If solo traveler, skip certain steps if needed (or adjust logic)
      if (steps[currentStepIndex] === "TRAVELERS" && state.intent === "Solo") {
         // Maybe skip? For now, we go linearly.
      }
      
      setCurrentStepIndex(nextIndex);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const currentStepId = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between z-20 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {currentStepIndex > 0 && currentStepIndex < steps.length - 1 && (
            <button onClick={prevStep} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">SanYush <span className="text-primary">AI</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Guided Planner</p>
          </div>
        </div>
        {currentStepIndex < steps.length - 1 && (
          <div className="text-sm font-medium text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length - 1}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-2xl px-6 py-8 h-full flex flex-col justify-center overflow-y-auto chat-scrollbar"
          >
            {currentStepId === "INTENT" && <StepIntent state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "DESTINATION" && <StepDestination state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "BUDGET" && <StepBudget state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "DURATION" && <StepDuration state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "TRAVELERS" && <StepTravelers state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "STYLE" && <StepStyle state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "DATES" && <StepDates state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "PREFERENCES" && <StepPreferences state={state} updateState={updateState} onNext={nextStep} />}
            {currentStepId === "OUTPUT" && <OutputScreen state={state} onReset={() => { setState(initialPlannerState); setCurrentStepIndex(0); }} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      {currentStepIndex < steps.length - 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-secondary z-30">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `\${((currentStepIndex) / (steps.length - 2)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
