"use client";

import { useEffect, useRef } from "react";
import type { DriveStep } from "driver.js";

const STORAGE_KEY = "cupclash_tour_done";

const STEPS: DriveStep[] = [
  {
    element: "#tour-group-selector",
    popover: {
      title: "Switch Groups",
      description: "Switch between your groups here",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "#tour-match-card",
    popover: {
      title: "Predict the Score",
      description: "Predict the score before kickoff — earn +10 for the right outcome, +25 for the exact score",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#tour-group-preds",
    popover: {
      title: "Group Rankings",
      description: "Tap here to see who's leading your group",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#tour-nav-picks",
    popover: {
      title: "My Picks",
      description: "Enter all your predictions here before each match kicks off",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-nav-schedule",
    popover: {
      title: "Full Schedule",
      description: "See all 104 matches, filter by group or stage",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-nav-more",
    popover: {
      title: "Leaderboard & More",
      description: "Track your ranking, chat with your group, and explore the bracket",
      side: "top",
      align: "center",
    },
  },
];

export function OnboardingTour() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    started.current = true;

    import("driver.js").then(({ driver }) => {
      const driverObj = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.65,
        stagePadding: 6,
        stageRadius: 14,
        popoverClass: "cc-tour-popover",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Got it!",
        onDestroyStarted: () => {
          localStorage.setItem(STORAGE_KEY, "1");
          driverObj.destroy();
        },
        steps: STEPS.filter(step => {
          if (!step.element) return true;
          return document.querySelector(step.element as string) !== null;
        }),
      });
      driverObj.drive();
    });
  }, []);

  return null;
}
