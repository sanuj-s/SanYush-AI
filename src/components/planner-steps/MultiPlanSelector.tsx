import { PlannerState } from "./types";
import { ArrowRight, Wallet, Zap, Sparkles } from "lucide-react";

interface Props {
  state: PlannerState;
  onSelect: (destinationKey: string) => void;
}

export default function MultiPlanSelector({ state, onSelect }: Props) {
  const plans = [
    {
      key: "goa",
      title: "Cheapest Match",
      dest: "Goa, India",
      icon: Wallet,
      desc: "Maximizes your budget with great value.",
      cost: "₹41,000",
      highlight: "High value"
    },
    {
      key: "dubai",
      title: "Fastest Travel",
      dest: "Dubai, UAE",
      icon: Zap,
      desc: "Direct flights and quick transit times.",
      cost: "₹1,10,000",
      highlight: "Quick getaway"
    },
    {
      key: "bali",
      title: "Best Experience",
      dest: "Bali, Indonesia",
      icon: Sparkles,
      desc: "Highest rated match for your preferences.",
      cost: "₹73,000",
      highlight: "98% Match"
    }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          AI Engine Suggestions
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          We found 3 perfect trips.
        </h2>
        <p className="text-muted-foreground mt-3 text-lg">
          Based on your ₹{state.budget.toLocaleString("en-IN")} budget and {state.duration} timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              className="group relative bg-card/50 border-2 border-border hover:border-primary/50 p-6 rounded-3xl text-left transition-all hover:bg-secondary/80 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 bg-background border border-border px-3 py-1 rounded-full text-xs font-bold text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-colors">
                {p.highlight}
              </div>
              
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                <Icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">{p.title}</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{p.dest}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 h-10">
                {p.desc}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="font-extrabold text-lg text-foreground">{p.cost}</div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                  <ArrowRight className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
