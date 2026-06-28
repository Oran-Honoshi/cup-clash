"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AdminFinancePanel } from "@/components/AdminFinancePanel";
import { MOCK_GROUP, MOCK_MEMBERS } from "@/lib/mocks/data";
import type { Member } from "@/lib/types";

export default function AdminPage() {
  useParams();
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);

  function handleTogglePaid(id: string, paid: boolean) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, paid } : m));
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      <header className="border-b border-white/10 px-4 sm:px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a
            href={`/group/${MOCK_GROUP.id}`}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            ← Back
          </a>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-0.5">Admin</p>
            <h1 className="text-xl font-black">Finance Panel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <AdminFinancePanel
          group={MOCK_GROUP}
          members={members}
          onTogglePaid={handleTogglePaid}
        />
      </main>
    </div>
  );
}
