"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";

const DRAG_CLOSE_THRESHOLD = 100;

interface BottomSheetProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  closeLabel: string;
  children:   ReactNode;
}

// First shared bottom-sheet primitive in the app — every prior sheet
// (JoinPreviewSheet, the Duel opponent picker, ...) reimplemented this
// createPortal + backdrop + rounded-t-3xl panel markup independently.
// Modeled on JoinPreviewSheet (app/(app)/groups/search/page.tsx) since
// that's the cleanest existing instance, with swipe-to-dismiss added.
export function BottomSheet({ open, onClose, title, closeLabel, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleDragEnd = (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex flex-col justify-end"
          style={{ zIndex: 9998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="rounded-t-3xl w-full max-w-lg mx-auto"
            style={{ background: "var(--nv)", border: "1px solid var(--br)", boxShadow: "0 -8px 40px var(--shad)" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--mt)" }} />
            </div>

            <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b" style={{ borderColor: "var(--dv)" }}>
              <span className="font-display text-lg uppercase font-black tracking-wide" style={{ color: "var(--tx)" }}>
                {title}
              </span>
              <button
                onClick={onClose}
                aria-label={closeLabel}
                className="h-8 w-8 flex items-center justify-center rounded-xl"
                style={{ background: "var(--ip)", color: "var(--mt)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {children}
            </div>

            <div style={{ height: "env(safe-area-inset-bottom, 12px)", minHeight: 12 }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
