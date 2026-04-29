export interface PlannerState {
  intent: string;
  destinationMode: "known" | "suggest";
  destination: string;
  budget: number;
  duration: string;
  travelers: string;
  style: string;
  dates: string;
  preferences: string[];
}

export const initialPlannerState: PlannerState = {
  intent: "",
  destinationMode: "known",
  destination: "",
  budget: 50000,
  duration: "",
  travelers: "",
  style: "",
  dates: "",
  preferences: [],
};
