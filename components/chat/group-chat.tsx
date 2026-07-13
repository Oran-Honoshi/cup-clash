"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, X, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface ChatMessage {
  id: string;
  user_id: string | null;
  content: string;
  type: "text" | "gif" | "system" | "moment";
  gif_url?: string;
  created_at: string;
  profiles?: { name: string; country: string; avatar_url: string | null };
}

// The limited emoji picker for reacting to a "moment" message (migration
// 052) — deliberately a fixed small set, not a full emoji keyboard.
const REACTION_EMOJI = ["🔥", "⚽", "😂", "👏"] as const;

interface ReactionState {
  // emoji -> set of user_ids who reacted with it
  byEmoji: Record<string, Set<string>>;
}

// A "system" message (migration 049 — e.g. the Daily Challenge "Dave
// solved today's puzzle" nudge) has no author, so it renders as a plain
// centered line instead of the usual left/right chat-bubble row.
function SystemMessageRow({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-center px-2">
      <div
        className="text-[11px] font-bold px-3 py-1.5 rounded-full text-center"
        style={{ background: "rgba(0,212,255,0.08)", color: "rgba(255,255,255,0.6)" }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// A "moment" message (migration 052 — e.g. an exact-score prediction) is a
// shareable highlight: same no-author centered layout as a system message,
// but with its own accent styling and a reaction bar underneath.
function MomentMessageRow({
  msg, reactions, currentUserId, onToggle,
}: {
  msg: ChatMessage;
  reactions: ReactionState;
  currentUserId: string;
  onToggle: (emoji: string) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center gap-1.5 px-2">
      <div
        className="text-[12px] font-bold px-3.5 py-2 rounded-2xl text-center max-w-[85%]"
        style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.16), rgba(0,255,136,0.10))",
          border: "1px solid rgba(0,255,136,0.25)",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {msg.content}
      </div>
      <div className="flex gap-1" role="group" aria-label={t("chat_react_aria")}>
        {REACTION_EMOJI.map(emoji => {
          const users = reactions.byEmoji[emoji];
          const count = users?.size ?? 0;
          const mine  = users?.has(currentUserId) ?? false;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggle(emoji)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors"
              style={{
                background: mine ? "rgba(0,212,255,0.18)" : "rgba(255,255,255,0.06)",
                border: mine ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: mine ? "#00D4FF" : "rgba(255,255,255,0.55)",
              }}
            >
              <span>{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface GifResult {
  id: string; url: string; preview: string; title: string;
}

interface GroupChatProps {
  groupId:         string;
  currentUserId:   string;
  currentUserName: string;
  isPaid:          boolean;
  inline?:         boolean;
}

export function GroupChat({ groupId, currentUserId, currentUserName, isPaid, inline = false }: GroupChatProps) {
  const { t } = useLocale();
  const [messages,   setMessages]   = useState<ChatMessage[]>([]);
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [showGif,    setShowGif]    = useState(false);
  const [gifQuery,   setGifQuery]   = useState("");
  const [gifs,       setGifs]       = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [gifError,   setGifError]   = useState<string | null>(null);
  const [isOpen,     setIsOpen]     = useState(false);
  const [unread,     setUnread]     = useState(0);
  const [sendError,  setSendError]  = useState<string | null>(null);
  // message_id -> emoji -> set of user_ids who reacted with it
  const [reactions, setReactions] = useState<Record<string, Record<string, Set<string>>>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const addReaction = useCallback((messageId: string, emoji: string, userId: string) => {
    setReactions(prev => {
      const forMsg = { ...(prev[messageId] ?? {}) };
      const users  = new Set(forMsg[emoji] ?? []);
      users.add(userId);
      forMsg[emoji] = users;
      return { ...prev, [messageId]: forMsg };
    });
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string, userId: string) => {
    setReactions(prev => {
      const forMsg = prev[messageId];
      if (!forMsg?.[emoji]) return prev;
      const users = new Set(forMsg[emoji]);
      users.delete(userId);
      return { ...prev, [messageId]: { ...forMsg, [emoji]: users } };
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Use SSR-aware client that has the session cookie
    const sb = createClient();

    sb.from("chat_messages")
      .select("*, profiles(name, country, avatar_url)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(async ({ data, error }) => {
        if (error) console.error("Chat load error:", error.message);
        if (data) setMessages(data as ChatMessage[]);
        setTimeout(scrollToBottom, 100);

        const momentIds = (data ?? []).filter(m => m.type === "moment").map(m => m.id);
        if (momentIds.length > 0) {
          const { data: reactionRows } = await sb
            .from("message_reactions")
            .select("message_id, emoji, user_id")
            .in("message_id", momentIds);
          const byMessage: Record<string, Record<string, Set<string>>> = {};
          for (const r of (reactionRows ?? []) as Array<{ message_id: string; emoji: string; user_id: string }>) {
            const forMsg = byMessage[r.message_id] ?? (byMessage[r.message_id] = {});
            (forMsg[r.emoji] ?? (forMsg[r.emoji] = new Set())).add(r.user_id);
          }
          setReactions(byMessage);
        }
      });

    const channel = sb
      .channel(`chat:${groupId}`)
      .on("postgres_changes", {
        event:  "INSERT",
        schema: "public",
        table:  "chat_messages",
        filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        const { data } = await sb
          .from("chat_messages")
          .select("*, profiles(name, country, avatar_url)")
          .eq("id", payload.new.id)
          .single();
        if (data) {
          setMessages(prev => [...prev, data as ChatMessage]);
          if (!isOpen) setUnread(u => u + 1);
          setTimeout(scrollToBottom, 50);
        }
      })
      .on("postgres_changes", {
        event:  "INSERT",
        schema: "public",
        table:  "message_reactions",
        filter: `group_id=eq.${groupId}`,
      }, (payload) => {
        const row = payload.new as { message_id: string; emoji: string; user_id: string };
        addReaction(row.message_id, row.emoji, row.user_id);
      })
      .on("postgres_changes", {
        event:  "DELETE",
        schema: "public",
        table:  "message_reactions",
        filter: `group_id=eq.${groupId}`,
      }, (payload) => {
        const row = payload.old as { message_id: string; emoji: string; user_id: string };
        removeReaction(row.message_id, row.emoji, row.user_id);
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [groupId, scrollToBottom, addReaction, removeReaction]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const alreadyReacted = reactions[messageId]?.[emoji]?.has(user.id) ?? false;
    if (alreadyReacted) {
      removeReaction(messageId, emoji, user.id); // optimistic
      const { error } = await sb.from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);
      if (error) addReaction(messageId, emoji, user.id); // revert
    } else {
      addReaction(messageId, emoji, user.id); // optimistic
      const { error } = await sb.from("message_reactions").insert({
        message_id: messageId, group_id: groupId, user_id: user.id, emoji,
      });
      if (error) removeReaction(messageId, emoji, user.id); // revert
    }
  }, [groupId, reactions, addReaction, removeReaction]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(scrollToBottom, 100);
      inputRef.current?.focus();
    }
  }, [isOpen, scrollToBottom]);

  const sendMessage = async (content: string, type: "text" | "gif" = "text", gifUrl?: string) => {
    if (!content.trim() && !gifUrl) return;
    if (!isPaid) return;
    setSending(true);
    setSendError(null);

    const sb = createClient();

    // Verify session first
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      setSendError(t("chat_not_signed"));
      setSending(false);
      return;
    }

    const { error } = await sb.from("chat_messages").insert({
      group_id: groupId,
      user_id:  user.id, // use verified user.id, not prop
      content:  content.trim() || "GIF",
      type,
      gif_url:  gifUrl,
    });

    if (error) {
      console.error("Chat send error:", error.message);
      setSendError(t("chat_send_failed"));
    } else {
      setInput("");
      setShowGif(false);
    }
    setSending(false);
  };

  const giphyKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  const searchGifs = async (query: string) => {
    if (!query.trim()) return;
    if (!giphyKey) { setGifError("GIF search is not configured."); return; }
    setGifLoading(true);
    setGifError(null);
    setGifs([]);
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`
      );
      if (!res.ok) throw new Error(`Giphy error ${res.status}`);
      const data = await res.json() as {
        data: Array<{ id: string; title: string; images: { fixed_height: { url: string }; fixed_height_small: { url: string } } }>
      };
      const results = data.data.map(g => ({
        id: g.id, url: g.images.fixed_height.url,
        preview: g.images.fixed_height_small.url, title: g.title,
      }));
      setGifs(results);
      if (results.length === 0) setGifError("No GIFs found. Try a different search.");
    } catch {
      setGifError("Couldn't load GIFs. Check your connection and try again.");
    }
    setGifLoading(false);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (inline) {
    return (
      <div className="flex flex-col w-full" style={{ height: 480 }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <MessageCircle size={32} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{t("chat_no_messages")}</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => {
            if (msg.type === "system") return <SystemMessageRow key={msg.id} msg={msg} />;
            if (msg.type === "moment") {
              return (
                <MomentMessageRow
                  key={msg.id} msg={msg}
                  reactions={{ byEmoji: reactions[msg.id] ?? {} }}
                  currentUserId={currentUserId}
                  onToggle={emoji => toggleReaction(msg.id, emoji)}
                />
              );
            }
            const isOwn      = msg.user_id === currentUserId;
            const profile    = msg.profiles;
            const showAvatar = !isOwn && (i === 0 || messages[i-1].user_id !== msg.user_id);
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                {!isOwn && (
                  <div className="w-8 shrink-0">
                    {showAvatar && profile && (
                      <UserAvatar name={profile.name} avatarUrl={profile.avatar_url} size="sm" teamCountry={profile.country} />
                    )}
                  </div>
                )}
                <div className={cn("max-w-[75%] space-y-0.5", isOwn && "items-end flex flex-col")}>
                  {showAvatar && !isOwn && profile && (
                    <div className="text-[10px] font-bold px-1" style={{ color: "rgba(255,255,255,0.45)" }}>{profile.name}</div>
                  )}
                  {msg.type === "gif" && msg.gif_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={msg.gif_url} alt="GIF" className="rounded-2xl max-w-full" style={{ maxHeight: 160 }} />
                  ) : (
                    <div className="px-3 py-2 rounded-2xl text-sm"
                      style={isOwn ? {
                        background: "linear-gradient(135deg, #00D4FF, #00FF88)",
                        color: "#0B141B", borderBottomRightRadius: 4,
                      } : {
                        background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderBottomLeftRadius: 4,
                      }}>
                      {msg.content}
                    </div>
                  )}
                  <div className="text-[9px] px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* GIF picker */}
        {showGif && (
          <div className="px-3 py-2 border-t shrink-0" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
            <div className="flex gap-2 mb-2">
              <input value={gifQuery} onChange={e => setGifQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchGifs(gifQuery)}
                placeholder={t("chat_search_gifs")}
                className="flex-1 text-xs px-3 py-2 rounded-lg"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.06)" }} />
              <button onClick={() => searchGifs(gifQuery)}
                className="px-3 py-2 rounded-lg text-xs font-bold"
                style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>
                {gifLoading ? "..." : t("chat_gif_go")}
              </button>
            </div>
            {gifError && (
              <div className="text-[11px] py-1 text-center" style={{ color: "#f87171" }}>{gifError}</div>
            )}
            <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto">
              {gifs.map(gif => (
                <button key={gif.id} onClick={() => sendMessage("", "gif", gif.url)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gif.preview} alt={gif.title} className="w-full h-16 object-cover rounded-lg" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: "rgba(0,212,255,0.12)" }}>
          {!isPaid ? (
            <div className="text-center text-sm py-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              {t("chat_join")}
            </div>
          ) : (
            <>
              {sendError && (
                <div className="text-xs text-center mb-2 rounded-lg px-3 py-1"
                  style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626" }}>
                  {sendError}
                </div>
              )}
              <div className="flex gap-2 items-center">
                {giphyKey && (
                  <button onClick={() => setShowGif(g => !g)}
                    className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{ color: showGif ? "#00D4FF" : "rgba(255,255,255,0.4)" }}>
                    <ImageIcon size={18} />
                  </button>
                )}
                <input ref={inputRef} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder={t("chat_placeholder")}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#ffffff", outline: "none" }}
                  onFocus={e => (e.target.style.border = "1px solid #00D4FF")}
                  onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.12)")} />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || sending}
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating chat button */}
      <button onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
            style={{ background: "#dc2626" }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 rounded-3xl overflow-hidden flex flex-col"
            style={{
              height: 480,
              maxHeight: "calc(100dvh - 200px)",
              background: "rgba(8,6,20,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(0,212,255,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)",
            }}>

            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: "rgba(0,212,255,0.12)", background: "rgba(18,14,38,0.6)" }}>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: "#00FF88" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#00FF88" }} />
                </span>
                <span className="font-display text-lg uppercase" style={{ color: "white" }}>{t("chat_title")}</span>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="h-9 w-9 flex items-center justify-center rounded-lg -mr-1 transition-colors hover:bg-white/[0.08]">
                <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <MessageCircle size={32} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{t("chat_no_messages")}</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => {
                if (msg.type === "system") return <SystemMessageRow key={msg.id} msg={msg} />;
                if (msg.type === "moment") {
                  return (
                    <MomentMessageRow
                      key={msg.id} msg={msg}
                      reactions={{ byEmoji: reactions[msg.id] ?? {} }}
                      currentUserId={currentUserId}
                      onToggle={emoji => toggleReaction(msg.id, emoji)}
                    />
                  );
                }
                const isOwn     = msg.user_id === currentUserId;
                const profile   = msg.profiles;
                const showAvatar = !isOwn && (i === 0 || messages[i-1].user_id !== msg.user_id);
                return (
                  <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                    {!isOwn && (
                      <div className="w-8 shrink-0">
                        {showAvatar && profile && (
                          <UserAvatar name={profile.name} avatarUrl={profile.avatar_url} size="sm" teamCountry={profile.country} />
                        )}
                      </div>
                    )}
                    <div className={cn("max-w-[75%] space-y-0.5", isOwn && "items-end flex flex-col")}>
                      {showAvatar && !isOwn && profile && (
                        <div className="text-[10px] font-bold px-1" style={{ color: "rgba(255,255,255,0.45)" }}>{profile.name}</div>
                      )}
                      {msg.type === "gif" && msg.gif_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={msg.gif_url} alt="GIF" className="rounded-2xl max-w-full" style={{ maxHeight: 160 }} />
                      ) : (
                        <div className="px-3 py-2 rounded-2xl text-sm"
                          style={isOwn ? {
                            background: "linear-gradient(135deg, #00D4FF, #00FF88)",
                            color: "#0B141B", borderBottomRightRadius: 4,
                          } : {
                            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderBottomLeftRadius: 4,
                          }}>
                          {msg.content}
                        </div>
                      )}
                      <div className="text-[9px] px-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* GIF picker */}
            {showGif && (
              <div className="px-3 py-2 border-t shrink-0" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
                <div className="flex gap-2 mb-2">
                  <input value={gifQuery} onChange={e => setGifQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && searchGifs(gifQuery)}
                    placeholder={t("chat_search_gifs")}
                    className="flex-1 text-xs px-3 py-2 rounded-lg"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.06)" }} />
                  <button onClick={() => searchGifs(gifQuery)}
                    className="px-3 py-2 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF" }}>
                    {gifLoading ? "..." : t("chat_gif_go")}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto">
                  {gifs.map(gif => (
                    <button key={gif.id} onClick={() => sendMessage("", "gif", gif.url)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gif.preview} alt={gif.title} className="w-full h-16 object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t shrink-0"
              style={{ borderColor: "rgba(0,212,255,0.12)", background: "rgba(18,14,38,0.6)" }}>
              {!isPaid ? (
                <div className="text-center text-sm py-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {t("chat_join")}
                </div>
              ) : (
                <>
                  {sendError && (
                    <div className="text-xs text-center mb-2 rounded-lg px-3 py-1"
                      style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626" }}>
                      {sendError}
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    {giphyKey && (
                      <button onClick={() => setShowGif(g => !g)}
                        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                        style={{ color: showGif ? "#00D4FF" : "rgba(255,255,255,0.4)" }}>
                        <ImageIcon size={18} />
                      </button>
                    )}
                    <input ref={inputRef} value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                      placeholder={t("chat_placeholder")}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm"
                      style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#ffffff", outline: "none" }}
                      onFocus={e => (e.target.style.border = "1px solid #00D4FF")}
                      onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.12)")} />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || sending}
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                      <Send size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}