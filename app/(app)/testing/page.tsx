export const dynamic = "force-dynamic";

import { TestControlPanel } from "@/components/testing/test-control-panel";

export default function TestingPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps mb-1">Development only</div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight">
          Test Control Panel
        </h1>
        <p className="text-pitch-400 text-sm mt-2">
          Simulate match results and watch scores update in real time.
          Pre-filled predictions for Amit, Sarah, John, and Lior.
        </p>
      </div>
      <TestControlPanel />
    </div>
  );
}
