"use client";

import { motion } from "framer-motion";

interface TrophyProps {
  className?: string;
  size?: number;
}

/**
 * FIFA World Cup Trophy — SVG illustration.
 * Rendered in gold with a subtle glow that picks up the page accent color.
 * Used as a decorative element in the hero section.
 */
export function WCTrophy({ className, size = 280 }: TrophyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      style={{ width: size, height: "auto" }}
    >
      <svg
        viewBox="0 0 200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 0 32px rgba(212, 175, 55, 0.5)) drop-shadow(0 0 64px rgba(212, 175, 55, 0.2))`,
        }}
      >
        <defs>
          <linearGradient id="gold-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#F5E06E" />
            <stop offset="25%"  stopColor="#D4AF37" />
            <stop offset="50%"  stopColor="#F5E06E" />
            <stop offset="75%"  stopColor="#B8860B" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="gold-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#B8860B" />
            <stop offset="50%"  stopColor="#8B6914" />
            <stop offset="100%" stopColor="#6B4F10" />
          </linearGradient>
          <linearGradient id="gold-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFF176" />
            <stop offset="100%" stopColor="#F5E06E" />
          </linearGradient>
          <linearGradient id="base-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="100%" r="50%">
            <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"   />
          </radialGradient>
        </defs>

        {/* Base glow */}
        <ellipse cx="100" cy="305" rx="60" ry="10" fill="url(#glow)" />

        {/* ── BASE PLATFORM ── */}
        {/* Bottom step */}
        <rect x="45" y="290" width="110" height="18" rx="3" fill="url(#base-grad)" />
        <rect x="45" y="290" width="110" height="4"  rx="2" fill="#F5E06E" opacity="0.4" />
        {/* Middle step */}
        <rect x="55" y="275" width="90"  height="16" rx="2" fill="url(#gold-main)" />
        <rect x="55" y="275" width="90"  height="3"  rx="1" fill="#FFF176" opacity="0.5" />
        {/* Top step */}
        <rect x="65" y="263" width="70"  height="13" rx="2" fill="url(#gold-dark)" />
        {/* Base label band */}
        <rect x="50" y="282" width="100" height="6"  rx="1" fill="#B8860B" opacity="0.6" />

        {/* ── STEM ── */}
        {/* Lower stem — wider */}
        <path
          d="M82 263 L84 230 L116 230 L118 263 Z"
          fill="url(#gold-dark)"
        />
        {/* Stem highlight */}
        <path
          d="M93 263 L94 230 L96 230 L95 263 Z"
          fill="#FFF176"
          opacity="0.4"
        />
        {/* Stem collar */}
        <rect x="78" y="226" width="44" height="8" rx="2" fill="url(#gold-main)" />
        <rect x="78" y="226" width="44" height="2" rx="1" fill="#FFF176" opacity="0.5" />

        {/* Upper stem — narrower */}
        <path
          d="M86 226 L88 195 L112 195 L114 226 Z"
          fill="url(#gold-main)"
        />
        <path
          d="M95 226 L96 195 L98 195 L97 226 Z"
          fill="#FFF176"
          opacity="0.35"
        />

        {/* ── CUP BODY ── */}
        {/* Main cup shape */}
        <path
          d="M60 195 C55 195 42 185 40 165 C38 145 45 125 55 115 C65 105 75 100 100 98 C125 100 135 105 145 115 C155 125 162 145 160 165 C158 185 145 195 140 195 Z"
          fill="url(#gold-main)"
        />
        {/* Cup highlight — left */}
        <path
          d="M68 195 C63 193 52 183 51 165 C50 148 56 130 65 120 C70 114 76 108 85 104 C80 110 74 120 72 135 C70 150 72 170 75 183 Z"
          fill="#FFF176"
          opacity="0.3"
        />
        {/* Cup shadow — right */}
        <path
          d="M132 195 C137 193 148 183 149 165 C150 148 144 130 135 120 C130 115 124 109 115 105 C120 111 126 121 128 136 C130 151 128 171 125 184 Z"
          fill="#8B6914"
          opacity="0.4"
        />

        {/* Globe detail lines on cup */}
        <ellipse cx="100" cy="147" rx="42" ry="50" fill="none" stroke="#B8860B" strokeWidth="1.5" opacity="0.5" />
        <path d="M58 147 Q75 135 100 133 Q125 135 142 147" fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.4" />
        <path d="M58 147 Q75 159 100 161 Q125 159 142 147" fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.4" />
        <path d="M100 97 Q88 120 88 147 Q88 174 100 197"  fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.35" />
        <path d="M100 97 Q112 120 112 147 Q112 174 100 197" fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.35" />

        {/* Continent patches */}
        <path d="M84 120 Q88 116 94 118 Q96 124 92 128 Q86 128 84 124 Z" fill="#B8860B" opacity="0.5" />
        <path d="M104 115 Q110 112 116 116 Q118 122 114 126 Q108 127 105 122 Z" fill="#B8860B" opacity="0.5" />
        <path d="M76 148 Q80 144 86 146 Q87 152 83 155 Q77 155 76 150 Z" fill="#B8860B" opacity="0.4" />
        <path d="M110 155 Q116 151 122 154 Q124 161 119 164 Q112 164 110 159 Z" fill="#B8860B" opacity="0.4" />
        <path d="M92 168 Q97 165 103 168 Q104 174 100 176 Q94 175 92 171 Z" fill="#B8860B" opacity="0.4" />

        {/* Cup rim top */}
        <path
          d="M60 195 Q100 202 140 195"
          fill="none" stroke="#FFF176" strokeWidth="2" opacity="0.5"
        />
        {/* Cup bottom ring */}
        <ellipse cx="100" cy="195" rx="41" ry="5" fill="#8B6914" opacity="0.6" />
        <path d="M59 195 Q100 199 141 195" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.7" />

        {/* ── HANDLES ── */}
        {/* Left handle */}
        <path
          d="M60 165 C50 165 34 155 32 140 C30 125 38 112 52 112 C56 112 59 114 60 118"
          fill="none" stroke="url(#gold-main)" strokeWidth="10" strokeLinecap="round"
        />
        <path
          d="M60 165 C50 165 34 155 32 140 C30 125 38 112 52 112 C56 112 59 114 60 118"
          fill="none" stroke="#FFF176" strokeWidth="2" strokeLinecap="round" opacity="0.35"
        />
        {/* Right handle */}
        <path
          d="M140 165 C150 165 166 155 168 140 C170 125 162 112 148 112 C144 112 141 114 140 118"
          fill="none" stroke="url(#gold-main)" strokeWidth="10" strokeLinecap="round"
        />
        <path
          d="M140 165 C150 165 166 155 168 140 C170 125 162 112 148 112 C144 112 141 114 140 118"
          fill="none" stroke="#FFF176" strokeWidth="2" strokeLinecap="round" opacity="0.35"
        />

        {/* ── TOP FIGURES (stylized human forms) ── */}
        {/* Two figures holding the world */}
        <path
          d="M86 98 C82 92 80 84 84 78 C87 73 92 72 96 75 C98 78 98 83 96 87 C94 91 90 95 86 98Z"
          fill="url(#gold-light)"
        />
        <path
          d="M114 98 C118 92 120 84 116 78 C113 73 108 72 104 75 C102 78 102 83 104 87 C106 91 110 95 114 98Z"
          fill="url(#gold-light)"
        />
        {/* Small world globe at top */}
        <circle cx="100" cy="68" r="16" fill="url(#gold-main)" />
        <circle cx="100" cy="68" r="16" fill="none" stroke="#FFF176" strokeWidth="1" opacity="0.4" />
        <ellipse cx="100" cy="68" rx="16" ry="7" fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.5" />
        <line x1="100" y1="52" x2="100" y2="84" stroke="#B8860B" strokeWidth="1" opacity="0.5" />
        {/* Globe highlight */}
        <circle cx="94" cy="62" r="5" fill="#FFF176" opacity="0.25" />
      </svg>
    </motion.div>
  );
}
