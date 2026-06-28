"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Leaderboard }  from "@/components/Leaderboard";
import { BettingCard }  from "@/components/BettingCard";
import { formatMatchTime } from "@/lib/formatMatchTime";
import { isMatchLocked }   from "@/lib/isMatchLocked";
import { MOCK_GROUP, MOCK_MEMBERS, MOCK_MATCHES } from "@/lib/mocks/data";
import type { Match } from "@/lib/types";

type Tab = "leaderboard" | "my-bets" | "schedule" | "admin";

const TABS: { id: Tab; label: string }[] = [
  { id: "leaderboard", label: "Leaderboard" },
  { id: "my-bets",     label: "My Bets"     },
  { id: "schedule",    label: "Schedule"     },
  { id: "admin",       label: "Admin"        },
];

const IS_ADMIN = true; // wire to real auth in production

export default function GroupPage() {
  useParams(); // consume params (groupId available via useParams().groupId)
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});

  function handleBetSubmit(match: Match, home: number, away: number) {
    setPredictions(prev => ({ ...prev, [match.id]: { home, away } }));
  }

  const visibleTabs = IS_ADMIN ? TABS : TABS.filter(t => t.id !== "admin");

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      {/* group header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-0.5">Group</p>
          <h1 className="text-xl font-black">{MOCK_GROUP.name}</h1>
        </div>
      </header>

      {/* tab bar */}
      <div className="border-b border-white/10 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-3xl mx-auto flex gap-0">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors duration-fast
                ${activeTab === tab.id
                  ? "border-[rgb(var(--accent,0_255_136))] text-[rgb(var(--accent,0_255_136))]"
                  : "border-transparent text-white/50 hover:text-white/80"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* tab content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {activeTab === "leaderboard" && (
          <Leaderboard members={MOCK_MEMBERS} />
        )}

        {activeTab === "my-bets" && (
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">My predictions</h2>
            {MOCK_MATCHES.map(m => (
              <BettingCard
                key={m.id}
                match={m}
                defaultHome={predictions[m.id]?.home}
                defaultAway={predictions[m.id]?.away}
                onSubmit={(h, a) => handleBetSubmit(m, h, a)}
              />
            ))}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">Schedule</h2>
            {MOCK_MATCHES.map(m => {
              const locked = isMatchLocked(m.time);
              const localTime = formatMatchTime(m.time, { showDate: true, showDay: true });
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-[rgba(18,14,38,0.5)]
                             backdrop-blur-[20px] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {m.home} <span className="text-white/40 font-normal">vs</span> {m.away}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">{localTime}</p>
                    </div>
                    {locked
                      ? <span className="text-xs font-bold uppercase tracking-widest text-red-400/80 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">Locked</span>
                      : (
                        <button
                          onClick={() => setActiveTab("my-bets")}
                          className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full
                                     border border-white/20 text-white/70 hover:text-white hover:border-white/40
                                     transition-colors duration-fast"
                        >
                          Predict
                        </button>
                      )
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "admin" && IS_ADMIN && (
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">Admin panel</h2>
            <a
              href={`/group/${MOCK_GROUP.id}/admin`}
              className="inline-block h-10 px-5 rounded-full text-sm font-bold uppercase tracking-widest
                         border border-white/20 text-white hover:bg-white/10 transition-colors duration-fast"
            >
              Open Finance Panel →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
