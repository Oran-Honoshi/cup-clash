import { Suspense } from "react";
import { UnsubscribeClient } from "./client";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-pitch-400 text-sm">
        Processing...
      </div>
    }>
      <UnsubscribeClient />
    </Suspense>
  );
}