export const dynamic = "force-dynamic";

import { KnockoutBracket } from "@/components/dashboard/knockout-bracket";

export default function BracketPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">World Cup 2026</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Knockout Bracket
        </h1>
        <p className="text-pitch-400 text-sm mt-2">
          Teams confirmed after the group stage concludes June 29.
        </p>
      </div>
      <KnockoutBracket />
    </div>
  );
}
