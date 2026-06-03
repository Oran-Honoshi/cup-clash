"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
}

export function BackButton({ fallback = "/" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
      style={{ background: "rgba(15,23,42,0.08)", color: "#0891B2" }}
      aria-label="Go back"
    >
      <ChevronLeft size={18} />
    </button>
  );
}
