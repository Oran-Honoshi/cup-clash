"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Check, AlertCircle, Building2 } from "lucide-react";

interface EnterpriseModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function EnterpriseModal({ isOpen, onClose }: EnterpriseModalProps) {
  const [form, setForm] = useState({
    name:      "",
    email:     "",
    phone:     "",
    notes:     "",
  });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, type: "enterprise" }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch {
      setError("Failed to send. Please email us directly at support@cupclash.live");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    background: "white",
    borderColor: "#e2e8f0",
    color: "#0F172A",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{   scale: 0.9, opacity: 0, y: 20  }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>

            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #00D4FF, #00FF88)" }} />

            <button onClick={onClose}
              className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: "#f1f5f9", color: "#64748b" }}>
              <X size={15} />
            </button>

            <div className="p-7">
              {sent ? (
                <div className="text-center py-6 space-y-3">
                  <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}>
                    <Check size={28} style={{ color: "#059669" }} />
                  </div>
                  <h2 className="font-display text-2xl uppercase font-black" style={{ color: "#0F172A" }}>
                    Message sent!
                  </h2>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    We'll get back to you within 24 hours to set up your corporate group.
                  </p>
                  <button onClick={onClose}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider mt-2"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                      <Building2 size={20} style={{ color: "#0891B2" }} />
                    </div>
                    <div>
                      <h2 className="font-display text-xl uppercase font-black" style={{ color: "#0F172A" }}>
                        Enterprise Enquiry
                      </h2>
                      <p className="text-xs" style={{ color: "#64748b" }}>We'll reply within 24 hours</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: "name",  label: "Contact Name *",      type: "text",  placeholder: "Your full name"          },
                      { key: "email", label: "Corporate Email *",    type: "email", placeholder: "you@company.com"          },
                      { key: "phone", label: "Phone Number *",       type: "tel",   placeholder: "+1 234 567 8900"          },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                          style={{ color: "#64748b" }}>{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form] as string}
                          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all"
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = "#00D4FF"}
                          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: "#64748b" }}>Team Notes / Group Size (Optional)</label>
                      <textarea
                        placeholder="e.g. 200 employees across 3 offices, need custom setup..."
                        value={form.notes}
                        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none resize-none transition-all"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#00D4FF"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
                        style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                        <AlertCircle size={13} />{error}
                      </div>
                    )}

                    <button onClick={handleSubmit} disabled={sending}
                      className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:-translate-y-0.5"
                      style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", color: "#0B141B" }}>
                      <Send size={15} />
                      {sending ? "Sending..." : "Send Enquiry"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}