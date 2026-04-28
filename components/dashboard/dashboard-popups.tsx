"use client";

import { useState, useEffect } from "react";
import { WelcomePopup } from "@/components/popups/welcome-popup";
import { FirstPredictionPopup } from "@/components/popups/first-prediction-popup";
import { PostMatchPopup } from "@/components/popups/post-match-popup";

// Last finished match — in production this comes from Supabase
// For now using a mock result to demonstrate the popup
const LAST_MATCH_RESULT = {
  home: "Israel",
  away: "France",
  homeFlagCode: "il",
  awayFlagCode: "fr",
  homeScore: 1,
  awayScore: 2,
};

const LAST_MATCH_WINNERS = [
  { name: "Amit",  flagCode: "ar", country: "Argentina", points: 25, isExact: true,  predicted: "1-2" },
  { name: "Sarah", flagCode: "br", country: "Brazil",    points: 10, isExact: false, predicted: "0-2" },
];

interface DashboardPopupsProps {
  memberName: string;
  groupName: string;
}

export function DashboardPopups({ memberName, groupName }: DashboardPopupsProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFirstPred, setShowFirstPred] = useState(false);
  const [showPostMatch, setShowPostMatch] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Welcome popup: show once per member
    const welcomed = localStorage.getItem(`cupclash_welcomed_${memberName}`);
    if (!welcomed) {
      const t = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(t);
    }

    // Post-match popup: show once after a match completes
    const seenLastMatch = localStorage.getItem("cupclash_seen_last_match");
    if (!seenLastMatch) {
      const t = setTimeout(() => setShowPostMatch(true), 1200);
      return () => clearTimeout(t);
    }
  }, [memberName]);

  const dismissWelcome = () => {
    localStorage.setItem(`cupclash_welcomed_${memberName}`, "true");
    setShowWelcome(false);
  };

  const dismissPostMatch = () => {
    localStorage.setItem("cupclash_seen_last_match", "true");
    setShowPostMatch(false);
  };

  // First prediction popup is triggered by the match card via a custom event
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const alreadySeen = localStorage.getItem("cupclash_first_pred");
      if (!alreadySeen) setShowFirstPred(true);
    };
    window.addEventListener("cupclash:first_prediction" as any, handler);
    return () => window.removeEventListener("cupclash:first_prediction" as any, handler);
  }, []);

  const dismissFirstPred = () => {
    localStorage.setItem("cupclash_first_pred", "true");
    setShowFirstPred(false);
  };

  return (
    <>
      <WelcomePopup
        visible={showWelcome}
        memberName={memberName}
        groupName={groupName}
        onDismiss={dismissWelcome}
      />
      <FirstPredictionPopup
        visible={showFirstPred}
        onDismiss={dismissFirstPred}
        matchLabel="Israel vs France"
        prediction="1–2"
      />
      <PostMatchPopup
        visible={showPostMatch}
        onDismiss={dismissPostMatch}
        match={LAST_MATCH_RESULT}
        winners={LAST_MATCH_WINNERS}
      />
    </>
  );
}
