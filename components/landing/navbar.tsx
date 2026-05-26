"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works",  label: "How It Works"  },
  { href: "#features",      label: "Features"      },
  { href: "/schedule",      label: "Schedule"      },
  { href: "#pricing",       label: "Pricing"       },
  { href: "#for-companies", label: "For Companies" },
  { href: "#faq",           label: "FAQ"           },
];

const BUNTING_FLAGS = [
  { code: "us", name: "USA"        },
  { code: "mx", name: "Mexico"     },
  { code: "ca", name: "Canada"     },
  { code: "ar", name: "Argentina"  },
  { code: "br", name: "Brazil"     },
  { code: "fr", name: "France"     },
  { code: "de", name: "Germany"    },
  { code: "gb-eng", name: "England"   },
  { code: "es", name: "Spain"      },
  { code: "pt", name: "Portugal"   },
  { code: "nl", name: "Netherlands"},
  { code: "jp", name: "Japan"      },
  { code: "ma", name: "Morocco"    },
  { code: "ng", name: "Nigeria"    },
  { code: "kr", name: "South Korea"},
  { code: "au", name: "Australia"  },
];

function BuntingStrip() {
  const flags = [...BUNTING_FLAGS, ...BUNTING_FLAGS, ...BUNTING_FLAGS];
  return (
    <div className="relative overflow-hidden w-full h-[34px] bg-[rgba(5,8,16,0.6)] border-b border-white/[0.06]">
      <div
        className="absolute inset-x-0 pointer-events-none top-[10px] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.2) 10%, rgba(0,212,255,0.2) 90%, transparent)" }}
      />
      <div className="flex items-start animate-bunting absolute top-0 gap-0 will-change-transform">
        {flags.map((f, i) => (
          <BuntingFlag key={`${f.code}-${i}`} code={f.code} name={f.name} index={i} />
        ))}
      </div>
      <style>{`
        @keyframes buntingScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${BUNTING_FLAGS.length * 52}px); }
        }
        .animate-bunting {
          animation: buntingScroll ${BUNTING_FLAGS.length * 1.8}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-bunting {
            animation: none;
            transform: translateX(-${(BUNTING_FLAGS.length / 2) * 52}px);
          }
        }
      `}</style>
    </div>
  );
}

function BuntingFlag({ code, name, index }: { code: string; name: string; index: number }) {
  const tiltLeft = index % 2 === 0;
  return (
    <div className="relative flex flex-col items-center shrink-0 w-[52px] pt-0" title={name}>
      <div
        className="w-1 h-1 rounded-full bg-[rgba(0,212,255,0.4)] mb-0.5 mt-2"
        style={{ boxShadow: "0 1px 3px rgba(0,212,255,0.3)" }}
      />
      <div
        className="w-8 h-5 relative overflow-hidden shrink-0 [clip-path:polygon(0_0,100%_0,50%_100%)]"
        style={{ transform: `rotate(${tiltLeft ? -3 : 3}deg)`, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/flags/${code}.svg`}
          alt={name}
          width={32}
          height={20}
          className="w-full h-full object-cover object-center opacity-90"
        />
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(5,8,16,0.95)] backdrop-blur-[24px] border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          : "bg-[rgba(5,8,16,0.7)] backdrop-blur-[24px] border-b border-white/[0.06]"
      )}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/"><Logo /></Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors text-white/65 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/signin">
              <button className="text-sm font-semibold px-4 py-2 rounded-full transition-colors text-white/70 hover:text-white">
                Sign in
              </button>
            </Link>
            <Link href="/dashboard">
              <button
                className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 text-[#050e08]"
                style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)", boxShadow: "0 8px 30px rgba(0,255,136,0.4)" }}
              >
                Let&apos;s Play <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              "md:hidden flex items-center justify-center h-10 w-10 rounded-xl transition-all text-white",
              open
                ? "bg-[rgba(0,255,136,0.14)] border border-[rgba(0,255,136,0.4)]"
                : "bg-white/[0.06] border border-white/[0.14]"
            )}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="md:hidden pb-6 rounded-b-2xl"
            style={{
              background: "rgba(5,8,16,0.96)",
              backdropFilter: "blur(28px) saturate(180%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex flex-col gap-0 pt-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-3.5 text-base font-bold text-white border-b border-white/[0.05]"
                >
                  {link.label}
                  <ArrowRight size={14} className="text-white/35" />
                </a>
              ))}
              <div className="flex flex-col gap-2.5 pt-5 px-3">
                <Link href="/dashboard">
                  <button
                    className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-[#050e08]"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00D4FF)" }}
                  >
                    Let&apos;s Play <ArrowRight size={14} />
                  </button>
                </Link>
                <Link href="/signin">
                  <button className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center border border-white/[0.18] bg-white/[0.06] text-white">
                    Sign in
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bunting flags strip */}
      <BuntingStrip />
    </header>
  );
}