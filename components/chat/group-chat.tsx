"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Image as ImageIcon, X, MessageCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { flagUrl } from "@/lib/countries";
import NextImage from "next/image";

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  type: "text" | "gif";
  gif_url?: string;
  created_at: string;
  profiles?: {
    name: string;
    country: string;
    avatar_url: string | null;
  };
}

interface GifResult {
  id: string;
  url: string;
  preview: string;
  title: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "Argentina": "ar", "Brazil": "br", "France": "fr", "England": "gb-eng",
  "Germany": "de",   "Spain": "es",  "Israel": "il",  "USA": "us",
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function Avatar({ name, country, avatarUrl }: { name: string; country: string; avatarUrl: string | null }) {
  const flag = COUNTRY_FLAGS[country];
  if (avatarUrl) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full object-cover shrink-0" />
  );
  return (
    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 relative"
      style={{ border: "2px solid rgba(0,212,255,0.2)" }}>
      {flag ? (
        <NextImage src={flagUrl(flag, 20)} alt={country} fill className="object-cover" unoptimized />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
          {name[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

interface GroupChatProps {
  groupId: string;
  currentUserId: string;
  currentUserName: string;
  isPaid: boolean;
}

export function GroupChat({ groupId, currentUserId, currentUserName, isPaid }: GroupChatProps) {
  const [messages,     setMessages]     = useState<ChatMessage[]>([]);
  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [showGif,      setShowGif]      = useState(false);
  const [gifQuery,     setGifQuery]     = useState("");
  const [gifs,         setGifs]         = useState<GifResult[]>([]);
  const [gifLoading,   setGifLoading]   = useState(false);
  const [isOpen,       setIsOpen]       = useState(false);
  const [unread,       setUnread]       = useState(0);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load messages + subscribe to realtime
  useEffect(() => {
    const sb = getSupabase();

    // Initial load
    sb.from("chat_messages")
      .select("*, profiles(name, country, avatar_url)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[]);
        setTimeout(scrollToBottom, 100);
      });

    // Realtime subscription
    const channel = sb
      .channel(`chat:${groupId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        // Fetch the message with profile
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
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [groupId, scrollToBottom, isOpen]);

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
    const sb = getSupabase();
    await sb.from("chat_messages").insert({
      group_id: groupId,
      user_id:  currentUserId,
      content:  content.trim() || "GIF",
      type,
      gif_url:  gifUrl,
    });
    setInput("");
    setShowGif(false);
    setSending(false);
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) return;
    setGifLoading(true);
    try {
      const key = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? "dc6zaTOxFJmzC"; // public beta key
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=12&rating=g`
      );
      const data = await res.json() as { data: Array<{ id: string; title: string; images: { fixed_height: { url: string }; fixed_height_small: { url: string } } }> };
      setGifs(data.data.map(g => ({
        id:      g.id,
        url:     g.images.fixed_height.url,
        preview: g.images.fixed_height_small.url,
        title:   g.title,
      })));
    } catch { /* ignore */ }
    setGifLoading(false);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

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
            className="fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-40 w-80 sm:w-96 rounded-3xl overflow-hidden flex flex-col"
            style={{
              height: 480,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(0,212,255,0.2)",
              boxShadow: "0 20px 60px rgba(0,212,255,0.15), 0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: "rgba(0,212,255,0.12)", background: "rgba(248,250,252,0.8)" }}>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: "#00FF88" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#00FF88" }} />
                </span>
                <span className="font-display text-lg uppercase" style={{ color: "#0F172A" }}>Group Chat</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X size={16} style={{ color: "#94a3b8" }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <MessageCircle size={32} className="mx-auto mb-2" style={{ color: "#cbd5e1" }} />
                    <p className="text-sm" style={{ color: "#94a3b8" }}>No messages yet. Say hi!</p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                const isOwn = msg.user_id === currentUserId;
                const profile = msg.profiles;
                const showAvatar = !isOwn && (i === 0 || messages[i-1].user_id !== msg.user_id);

                return (
                  <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                    {!isOwn && (
                      <div className="w-8 shrink-0">
                        {showAvatar && profile && (
                          <Avatar name={profile.name} country={profile.country} avatarUrl={profile.avatar_url} />
                        )}
                      </div>
                    )}
                    <div className={cn("max-w-[75%] space-y-0.5", isOwn && "items-end flex flex-col")}>
                      {showAvatar && !isOwn && profile && (
                        <div className="text-[10px] font-bold px-1" style={{ color: "#64748b" }}>{profile.name}</div>
                      )}
                      {msg.type === "gif" && msg.gif_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={msg.gif_url} alt="GIF"
                          className="rounded-2xl max-w-full"
                          style={{ maxHeight: 160 }} />
                      ) : (
                        <div className="px-3 py-2 rounded-2xl text-sm"
                          style={isOwn ? {
                            background: "linear-gradient(135deg, #00D4FF, #00FF88)",
                            color: "#0B141B",
                            borderBottomRightRadius: 4,
                          } : {
                            background: "#f1f5f9",
                            color: "#0F172A",
                            borderBottomLeftRadius: 4,
                          }}>
                          {msg.content}
                        </div>
                      )}
                      <div className="text-[9px] px-1" style={{ color: "#94a3b8" }}>
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
                    placeholder="Search GIFs..." className="flex-1 text-xs px-3 py-1.5 rounded-lg"
                    style={{ border: "1px solid #e2e8f0", color: "#0F172A", background: "white" }} />
                  <button onClick={() => searchGifs(gifQuery)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(0,212,255,0.1)", color: "#0891B2" }}>
                    {gifLoading ? "..." : "Go"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto">
                  {gifs.map(gif => (
                    <button key={gif.id} onClick={() => sendMessage("", "gif", gif.url)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gif.preview} alt={gif.title}
                        className="w-full h-16 object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t shrink-0"
              style={{ borderColor: "rgba(0,212,255,0.12)", background: "rgba(248,250,252,0.8)" }}>
              {!isPaid ? (
                <div className="text-center text-sm py-2" style={{ color: "#94a3b8" }}>
                  Pay the $2 entry fee to join the chat
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <button onClick={() => setShowGif(g => !g)}
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-slate-100"
                    style={{ color: showGif ? "#00D4FF" : "#94a3b8" }}>
                    <ImageIcon size={18} />
                  </button>
                  <input ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Message..."
                    className="flex-1 px-3 py-2 rounded-xl text-sm"
                    style={{ border: "1px solid #e2e8f0", background: "white", color: "#0F172A", outline: "none" }}
                    onFocus={e => (e.target.style.border = "1px solid #00D4FF")}
                    onBlur={e => (e.target.style.border = "1px solid #e2e8f0")} />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || sending}
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #00D4FF, #00FF88)", color: "#0B141B" }}>
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
