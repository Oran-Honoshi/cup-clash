"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface GroupRow {
  id: string;
  name: string;
  max_members: number;
  buy_in_amount: number;
}

type JoinState = "loading" | "found" | "joining" | "joined" | "full" | "already" | "notfound" | "error";

interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
  maxMembers: number;
  buyInAmount: number;
}

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state, setState] = useState<JoinState>("loading");
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroup() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setState("notfound"); return; }
      const sb = getClient();

      // Try by id first, then invite_code
      let groupData: GroupRow | null = null;
      const { data: byId } = await sb.from("groups")
        .select("id, name, max_members, buy_in_amount")
        .eq("id", code).maybeSingle();
      if (byId) { groupData = byId as GroupRow; }
      else {
        const { data: byCode } = await sb.from("groups")
          .select("id, name, max_members, buy_in_amount")
          .eq("invite_code", code).maybeSingle();
        if (byCode) groupData = byCode as GroupRow;
      }

      if (!groupData) { setState("notfound"); return; }

      const { count } = await sb.from("group_members")
        .select("id", { count: "exact", head: true })
        .eq("group_id", groupData.id);

      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: existing } = await sb.from("group_members")
          .select("id").eq("group_id", groupData.id).eq("user_id", user.id).maybeSingle();
        if (existing) {
          setGroup({ id: groupData.id, name: groupData.name, memberCount: count ?? 0, maxMembers: groupData.max_members, buyInAmount: groupData.buy_in_amount });
          setState("already"); return;
        }
      }

      setGroup({ id: groupData.id, name: groupData.name, memberCount: count ?? 0, maxMembers: groupData.max_members, buyInAmount: groupData.buy_in_amount });
      setState((count ?? 0) >= groupData.max_members ? "full" : "found");
    }
    loadGroup();
  }, [code]);

  const handleJoin = async () => {
    if (!group) return;
    setState("joining");

    const sb = getClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push(`/signin?next=/join/${code}`); return; }

    const { count } = await sb.from("group_members")
      .select("id", { count: "exact", head: true }).eq("group_id", group.id);
    if ((count ?? 0) >= group.maxMembers) { setState("full"); return; }

    const { error } = await sb.from("group_members")
      .insert({ group_id: group.id, user_id: user.id, paid: false } as Record<string, unknown>);

    if (error) {
      if (error.code === "23505") setState("already");
      else { setErrorMsg(error.message); setState("error"); }
      return;
    }
    setState("joined");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo size="lg" /></div>
        <Card variant="glass-strong" className="p-6 sm:p-8">

          {state === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 size={32} className="animate-spin text-pitch-500" />
              <p className="text-pitch-400 text-sm">Looking up group...</p>
            </div>
          )}

          {state === "notfound" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <XCircle size={40} className="text-danger" />
              <h2 className="font-display text-2xl uppercase text-white">Invalid link</h2>
              <p className="text-pitch-400 text-sm">This invite link doesn&apos;t match any group. Ask your admin for a new one.</p>
              <Button onClick={() => router.push("/")} variant="outline" size="sm">Go home</Button>
            </div>
          )}

          {state === "full" && group && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <Users size={40} className="text-warning" />
              <h2 className="font-display text-2xl uppercase text-white">Group is full</h2>
              <p className="text-pitch-400 text-sm"><strong className="text-white">{group.name}</strong> has reached its maximum of {group.maxMembers} members.</p>
              <Button onClick={() => router.push("/")} variant="outline" size="sm">Go home</Button>
            </div>
          )}

          {state === "already" && group && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle size={40} className="text-success" />
              <h2 className="font-display text-2xl uppercase text-white">Already joined</h2>
              <p className="text-pitch-400 text-sm">You&apos;re already a member of <strong className="text-white">{group.name}</strong>.</p>
              <Button onClick={() => router.push("/dashboard")} size="md" rightIcon={<ArrowRight size={15} />}>Go to dashboard</Button>
            </div>
          )}

          {(state === "found" || state === "joining") && group && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="label-caps mb-2">You&apos;re invited</div>
                <h2 className="font-display text-3xl uppercase text-white leading-tight">{group.name}</h2>
              </div>
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pitch-400">Members</span>
                  <span className="font-bold text-white">{group.memberCount} / {group.maxMembers}</span>
                </div>
                {group.buyInAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-pitch-400">Buy-in</span>
                    <span className="font-bold text-white">${group.buyInAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-pitch-400">Spots left</span>
                  <span className="font-bold" style={{ color: "rgb(var(--accent-glow))" }}>{group.maxMembers - group.memberCount}</span>
                </div>
              </div>
              <Button onClick={handleJoin} loading={state === "joining"} size="lg" className="w-full" rightIcon={<ArrowRight size={18} />}>
                Join {group.name}
              </Button>
              <p className="text-center text-[11px] text-pitch-500">By joining you agree to the group&apos;s buy-in amount.</p>
            </div>
          )}

          {state === "joined" && group && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="h-16 w-16 rounded-full flex items-center justify-center"
                style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--brand)), rgb(var(--brand-2)))", boxShadow: "0 0 40px rgb(var(--brand)/0.4)" }}>
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2 className="font-display text-3xl uppercase text-white">You&apos;re in!</h2>
              <p className="text-pitch-400 text-sm">Welcome to <strong className="text-white">{group.name}</strong>. Start entering your predictions!</p>
              <Button onClick={() => router.push("/dashboard")} size="lg" className="w-full" rightIcon={<ArrowRight size={18} />}>Go to dashboard</Button>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <XCircle size={40} className="text-danger" />
              <h2 className="font-display text-2xl uppercase text-white">Something went wrong</h2>
              <p className="text-pitch-400 text-sm">{errorMsg}</p>
              <Button onClick={() => setState("found")} variant="outline" size="sm">Try again</Button>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
