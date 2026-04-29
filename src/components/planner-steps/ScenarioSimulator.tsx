import { PlusCircle, CalendarPlus, Gem, Activity } from "lucide-react";

interface Props {
  onSimulate: (type: string) => void;
}

export default function ScenarioSimulator({ onSimulate }: Props) {
  const scenarios = [
    { id: "add_budget", label: "+₹20k Budget", icon: PlusCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { id: "add_days", label: "Add 2 Days", icon: CalendarPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "upgrade_luxury", label: "Upgrade to Luxury", icon: Gem, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "more_activities", label: "More Activities", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="w-full bg-card/30 border border-border rounded-3xl p-6 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Scenario Simulation</h3>
          <p className="text-sm text-muted-foreground">Instantly recalculate your trip parameters.</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full w-max">
          AI Decision Engine
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSimulate(s.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all text-left"
          >
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <span className="text-sm font-semibold text-foreground leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
