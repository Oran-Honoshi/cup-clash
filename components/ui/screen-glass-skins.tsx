// components/ui/screen-glass-skins.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Glass skin wrappers for all inner app screens.
// Each export is a cosmetic shell — drop your existing JSX content inside.
// Zero functional logic inside these components.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassCard, GlassPanel, ScreenHeader } from "@/components/ui/glass-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PREDICTIONS SCREEN SKIN (slide 5 — "My Predictions")
// ─────────────────────────────────────────────────────────────────────────────
export function PredictionsScreenSkin({
  children,
  title = "My Predictions",
  subtitle,
  onBack,
  headerAction,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  headerAction?: ReactNode;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader title={title} subtitle={subtitle} onBack={onBack} action={headerAction} />
      <GlassCard accent="green" className="p-5 space-y-3">
        {children}
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STANDINGS SCREEN SKIN (slide 4 — "Standings / Group Table")
// ─────────────────────────────────────────────────────────────────────────────
export function StandingsScreenSkin({
  children,
  onBack,
  headerAction,
}: {
  children: ReactNode;
  onBack?: () => void;
  headerAction?: ReactNode;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader title="Standings" subtitle="Group stage tables" onBack={onBack} action={headerAction} />
      <GlassCard accent="purple" className="p-5 space-y-3">
        {children}
      </GlassCard>
    </div>
  );
}

// Section header for group tables (e.g. "GROUP A")
export function StandingsGroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 pt-1">
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 px-2">{label}</span>
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}

// Standing row — P W D L GD PTS
export function StandingRow({
  pos, flagCode, name, played, won, drawn, lost, gd, points, isHighlighted,
}: {
  pos: number; flagCode?: string; name: string;
  played: number; won: number; drawn: number; lost: number;
  gd: number | string; points: number; isHighlighted?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs",
      isHighlighted ? "bg-emerald-500/8 border border-emerald-500/15" : "hover:bg-white/5",
      "transition-all"
    )}>
      <span className="w-4 text-center text-slate-500 font-bold shrink-0">{pos}</span>
      {flagCode && (
        <span className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
          <img src={`/flags/${flagCode}.svg`} alt="" className="w-full h-full object-cover"/>
        </span>
      )}
      <span className="flex-1 font-semibold text-slate-200 truncate">{name}</span>
      {[played, won, drawn, lost, gd].map((v, i) => (
        <span key={i} className="w-5 text-center text-slate-500 shrink-0">{v}</span>
      ))}
      <span className="w-6 text-center font-black text-white shrink-0">{points}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BRACKET SCREEN SKIN (slide 6 — "Bracket")
// ─────────────────────────────────────────────────────────────────────────────
export function BracketScreenSkin({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader title="Bracket" subtitle="Knockout stage predictions" onBack={onBack} />
      <GlassCard accent="purple" className="p-4">
        {children}
      </GlassCard>
    </div>
  );
}

// Bracket match pair component
export function BracketMatchPair({
  teamA, teamAFlag, teamAScore,
  teamB, teamBFlag, teamBScore,
  winnerTeam, round,
}: {
  teamA: string; teamAFlag?: string; teamAScore?: number;
  teamB: string; teamBFlag?: string; teamBScore?: number;
  winnerTeam?: "A" | "B"; round?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/8 bg-slate-950/40">
      {round && (
        <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-violet-400 border-b border-white/5">
          {round}
        </div>
      )}
      {/* Team A */}
      <div className={cn(
        "flex items-center gap-2 px-2.5 py-2",
        winnerTeam === "A" && "bg-emerald-500/8",
        winnerTeam === "B" && "opacity-40"
      )}>
        {teamAFlag && (
          <span className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
            <img src={`/flags/${teamAFlag}.svg`} alt="" className="w-full h-full object-cover"/>
          </span>
        )}
        <span className={cn("flex-1 text-xs font-semibold", winnerTeam === "A" ? "text-emerald-300" : "text-slate-300")}>
          {teamA}
        </span>
        {teamAScore !== undefined && (
          <span className={cn("font-display font-bold text-sm", winnerTeam === "A" ? "text-emerald-400" : "text-slate-400")}>
            {teamAScore}
          </span>
        )}
      </div>
      {/* Divider */}
      <div className="h-px bg-white/5 mx-2" />
      {/* Team B */}
      <div className={cn(
        "flex items-center gap-2 px-2.5 py-2",
        winnerTeam === "B" && "bg-emerald-500/8",
        winnerTeam === "A" && "opacity-40"
      )}>
        {teamBFlag && (
          <span className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
            <img src={`/flags/${teamBFlag}.svg`} alt="" className="w-full h-full object-cover"/>
          </span>
        )}
        <span className={cn("flex-1 text-xs font-semibold", winnerTeam === "B" ? "text-emerald-300" : "text-slate-300")}>
          {teamB}
        </span>
        {teamBScore !== undefined && (
          <span className={cn("font-display font-bold text-sm", winnerTeam === "B" ? "text-emerald-400" : "text-slate-400")}>
            {teamBScore}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRIVIA CHALLENGE SCREEN SKIN (slide 7)
// ─────────────────────────────────────────────────────────────────────────────
export function TriviaScreenSkin({
  children,
  onBack,
  currentScore,
}: {
  children: ReactNode;
  onBack?: () => void;
  currentScore?: number;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader
        title="Trivia Challenge"
        onBack={onBack}
        action={
          currentScore !== undefined ? (
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Score</div>
              <div className="font-display font-black text-lg text-emerald-400">{currentScore}</div>
            </div>
          ) : undefined
        }
      />
      <GlassCard accent="purple" className="p-5 space-y-4">
        {children}
      </GlassCard>
    </div>
  );
}

// Trivia answer option button
export function TriviaOption({
  label, value, selected, correct, revealed, onClick,
}: {
  label: string; value: string; selected?: boolean;
  correct?: boolean; revealed?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold text-left",
        "transition-all duration-200",
        !selected && !revealed && "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20",
        selected && !revealed && "border-violet-500/50 bg-violet-500/15 text-violet-200",
        revealed && correct && "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
        revealed && selected && !correct && "border-red-500/40 bg-red-500/10 text-red-300",
        revealed && !selected && !correct && "border-white/5 bg-white/3 text-slate-600",
      )}
    >
      <span className={cn(
        "flex items-center justify-center h-6 w-6 rounded-lg text-xs font-black shrink-0 border",
        !selected && !revealed && "bg-white/5 border-white/10 text-slate-400",
        selected && !revealed && "bg-violet-500/30 border-violet-500/50 text-violet-300",
        revealed && correct && "bg-emerald-500/30 border-emerald-500/50 text-emerald-300",
      )}>
        {label}
      </span>
      {value}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NOTIFICATIONS SCREEN SKIN (slide 8)
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationsScreenSkin({
  children,
  onBack,
  unreadCount,
}: {
  children: ReactNode;
  onBack?: () => void;
  unreadCount?: number;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader
        title="Notifications"
        onBack={onBack}
        action={
          unreadCount ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              {unreadCount} new
            </span>
          ) : undefined
        }
      />
      <GlassCard accent="green" className="divide-y divide-white/5">
        {children}
      </GlassCard>
    </div>
  );
}

// Individual notification row
export function NotificationRow({
  icon, title, body, time, unread, onClick,
}: {
  icon: ReactNode; title: string; body: string; time: string;
  unread?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-5 py-4 text-left",
        "transition-all hover:bg-white/5",
        unread && "bg-emerald-500/4"
      )}
    >
      <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-800/80 border border-white/8 shrink-0 mt-0.5 text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-sm font-semibold truncate", unread ? "text-white" : "text-slate-300")}>
            {title}
          </span>
          {unread && <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />}
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{body}</p>
      </div>
      <span className="text-[10px] text-slate-600 shrink-0 mt-1">{time}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN PANEL SCREEN SKIN (slide 9)
// ─────────────────────────────────────────────────────────────────────────────
export function AdminPanelScreenSkin({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader
        title="Admin Panel"
        subtitle="Group management"
        onBack={onBack}
        action={
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 uppercase tracking-wider">
            Admin
          </span>
        }
      />
      <GlassCard accent="purple" className="p-5 space-y-4">
        {children}
      </GlassCard>
    </div>
  );
}

// Admin section block
export function AdminSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-violet-400">{title}</h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <GlassPanel className="p-3 space-y-2">
        {children}
      </GlassPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GROUP CHAT SCREEN SKIN (slide 10)
// ─────────────────────────────────────────────────────────────────────────────
export function GroupChatScreenSkin({
  children,
  groupName,
  memberCount,
  onBack,
}: {
  children: ReactNode;
  groupName: string;
  memberCount?: number;
  onBack?: () => void;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader
        title={groupName}
        subtitle={memberCount ? `${memberCount} members` : undefined}
        onBack={onBack}
        action={
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">Live</span>
          </div>
        }
      />
      <GlassCard accent="green" className="overflow-hidden">
        {/* Message thread area */}
        <div className="flex flex-col">
          {children}
        </div>
      </GlassCard>
    </div>
  );
}

// Chat message bubble
export function ChatBubble({
  senderName, message, time, isMine, avatarLetter, gifUrl,
}: {
  senderName: string; message?: string; time: string;
  isMine?: boolean; avatarLetter?: string; gifUrl?: string;
}) {
  return (
    <div className={cn("flex gap-2.5 px-4 py-2", isMine ? "flex-row-reverse" : "flex-row")}>
      {!isMine && (
        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-700/60 border border-white/8 text-xs font-bold text-slate-300 shrink-0 mt-1">
          {avatarLetter ?? senderName[0]}
        </div>
      )}
      <div className={cn("max-w-[75%] space-y-0.5", isMine && "items-end flex flex-col")}>
        {!isMine && (
          <span className="text-[10px] text-slate-500 font-semibold ml-1">{senderName}</span>
        )}
        <div className={cn(
          "rounded-2xl px-3.5 py-2.5 text-sm",
          isMine
            ? "rounded-tr-sm bg-violet-600/30 border border-violet-500/30 text-violet-100"
            : "rounded-tl-sm bg-slate-800/70 border border-white/8 text-slate-200"
        )}>
          {gifUrl && (
            <img src={gifUrl} alt="GIF" className="rounded-lg max-w-full mb-1" />
          )}
          {message && <p className="leading-relaxed">{message}</p>}
        </div>
        <span className="text-[9px] text-slate-600 px-1">{time}</span>
      </div>
    </div>
  );
}

// Chat input bar (cosmetic only — your existing state/onSend logic passes through)
export function ChatInputBar({
  value, onChange, onSend, onKeyDown, placeholder = "Message the group…",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-slate-950/40">
      <input
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-slate-800/50 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
      />
      <button
        onClick={onSend}
        className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. USER PROFILE SCREEN SKIN (slide 11)
// ─────────────────────────────────────────────────────────────────────────────
export function UserProfileScreenSkin({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      <ScreenHeader title="Profile" onBack={onBack} />
      <GlassCard accent="green" className="p-6 space-y-5">
        {children}
      </GlassCard>
    </div>
  );
}

// Profile avatar header
export function ProfileHero({
  name, tier, avatarUrl, avatarLetter, flagCode, points, rank, predictions,
}: {
  name: string; tier?: string; avatarUrl?: string; avatarLetter?: string;
  flagCode?: string; points?: number; rank?: number; predictions?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      {/* Avatar */}
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-2 border-emerald-500/50 overflow-hidden bg-slate-700/60 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-black text-3xl text-white">
              {avatarLetter ?? name[0]}
            </span>
          )}
        </div>
        {flagCode && (
          <div className="absolute -bottom-1 -right-1 h-7 w-9 rounded-md overflow-hidden border-2 border-slate-900">
            <img src={`/flags/${flagCode}.svg`} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      {/* Name + tier */}
      <div className="text-center">
        <h2 className="font-display font-black uppercase text-xl text-white">{name}</h2>
        {tier && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {tier}
          </span>
        )}
      </div>
      {/* Stats row */}
      {(points !== undefined || rank !== undefined || predictions !== undefined) && (
        <div className="flex gap-4 pt-1">
          {rank !== undefined && (
            <div className="text-center">
              <div className="font-display font-black text-2xl text-amber-400">{rank}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Rank</div>
            </div>
          )}
          {points !== undefined && (
            <div className="text-center">
              <div className="font-display font-black text-2xl text-emerald-400">{points}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Points</div>
            </div>
          )}
          {predictions !== undefined && (
            <div className="text-center">
              <div className="font-display font-black text-2xl text-white">{predictions}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Predictions</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}