"use client";

interface ScoreInputCCProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  size?: number;
}

export function ScoreInputCC({
  value,
  onChange,
  disabled = false,
  size = 44,
}: ScoreInputCCProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      max={20}
      value={value}
      onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="–"
      className={[
        "[appearance:textfield]",
        "[&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:appearance-none",
        "outline-none",
        "focus:border-[rgba(0,255,136,0.7)]",
        "focus:shadow-[0_0_0_3px_rgba(0,255,136,0.12)]",
        "disabled:opacity-35",
        "disabled:cursor-not-allowed",
        "placeholder:text-[rgba(255,255,255,0.3)]",
      ].join(" ")}
      style={{
        width: size,
        height: size,
        fontFamily: "var(--font-mono)",
        fontSize: 18,
        fontWeight: 900,
        textAlign: "center",
        background: "rgba(0,255,136,0.08)",
        border: "1px solid rgba(0,255,136,0.30)",
        color: "#00FF88",
        borderRadius: 8,
      }}
    />
  );
}
