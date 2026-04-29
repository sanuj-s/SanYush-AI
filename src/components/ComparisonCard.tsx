import type { ComparisonData } from "@/lib/travel-ai";

interface ComparisonCardProps {
  data: ComparisonData;
}

const ComparisonCard = ({ data }: ComparisonCardProps) => {
  const cheapest = Math.min(...data.destinations.map(d => d.totalCost));

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-2 animate-fade-in-up shadow-sm">
      <h3 className="font-semibold text-card-foreground mb-3">⚖️ Destination Comparison</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.destinations.map((dest) => (
          <div
            key={dest.name}
            className={`border rounded-lg p-3 transition-colors ${
              dest.totalCost === cheapest ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-card-foreground">{dest.name}</h4>
              {dest.totalCost === cheapest && (
                <span className="text-[10px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  BEST VALUE
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{dest.bestFor}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-semibold text-card-foreground">₹{dest.totalCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Cost</span>
                <span className="text-card-foreground">₹{dest.dailyCost.toLocaleString("en-IN")}/day</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Top attractions:</p>
              <div className="flex flex-wrap gap-1">
                {dest.highlights.map((h) => (
                  <span key={h} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonCard;
