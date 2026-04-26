import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Tech Titans World Cup</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          My Predictions
        </h1>
      </div>

      <Card variant="glass" className="p-12 flex flex-col items-center justify-center text-center">
        <Target size={40} className="text-pitch-600 mb-4" />
        <div className="font-display text-2xl uppercase text-white mb-2">
          Coming soon
        </div>
        <p className="text-pitch-400 text-sm max-w-xs">
          Full prediction history, point breakdown per match, and tournament picks will appear here.
        </p>
      </Card>
    </div>
  );
}
