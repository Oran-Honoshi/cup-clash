"use client";

type Size = "inline" | "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { font: number; bounce: number }> = {
  inline: { font: 14, bounce: 6 },
  sm: { font: 32, bounce: 28 },
  md: { font: 48, bounce: 48 },
  lg: { font: 64, bounce: 70 },
};

interface BallLoaderProps {
  size?: Size;
  label?: string | null;
  className?: string;
}

// Reads the app-wide --accent CSS var (set by ThemeProvider from the user's
// selected country, or the CupClash green default) so the glow always
// matches the live theme without needing its own context subscription.
export function BallLoader({ size = "md", label = "Loading…", className }: BallLoaderProps) {
  const { font, bounce } = SIZE_MAP[size];

  return (
    <div
      className={`ball-loader-wrapper ${className ?? ""}`}
      style={{ "--bounce-h": `${bounce}px` } as React.CSSProperties}
    >
      <div className="glow-ring" />
      <div className="ball-shadow" />
      <div className="ball-emoji" style={{ fontSize: font }}>⚽</div>
      {label && <p className="ball-loader-label">{label}</p>}
      <style jsx>{`
        .ball-loader-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: calc(var(--bounce-h) * 1.6);
          padding-top: var(--bounce-h);
        }
        .glow-ring {
          position: absolute;
          bottom: 4px;
          width: calc(var(--bounce-h) * 1.4);
          height: calc(var(--bounce-h) * 0.5);
          border-radius: 50%;
          filter: blur(6px);
          background: radial-gradient(circle, rgb(var(--accent) / 0.35), transparent 70%);
          animation: ballLoaderRingPulse 0.9s cubic-bezier(0.5, 0, 1, 0.5) infinite;
        }
        .ball-shadow {
          position: absolute;
          bottom: 2px;
          width: calc(var(--bounce-h) * 0.7);
          height: calc(var(--bounce-h) * 0.18);
          border-radius: 50%;
          background: #000;
          animation: ballLoaderShadowSquish 0.9s cubic-bezier(0.5, 0, 1, 0.5) infinite;
        }
        .ball-emoji {
          line-height: 1;
          animation: ballLoaderBounce 0.9s cubic-bezier(0.5, 0, 1, 0.5) infinite;
        }
        .ball-loader-label {
          margin-top: 10px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
        }
        @keyframes ballLoaderBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(calc(var(--bounce-h) * -1)) rotate(180deg); }
        }
        @keyframes ballLoaderRingPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.6); }
          50%      { opacity: 0.6; transform: scale(1); }
        }
        @keyframes ballLoaderShadowSquish {
          0%, 100% { transform: scale(0.5); opacity: 0.08; }
          50%      { transform: scale(1); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
