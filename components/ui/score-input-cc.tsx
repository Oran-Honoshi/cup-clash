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
  size = 46,
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
        "focus:border-[#00e5a0]",
        "focus:shadow-[0_0_0_3px_rgba(0,229,160,0.15)]",
        "disabled:opacity-35",
        "disabled:cursor-not-allowed",
        "placeholder:text-[#1c4a1c]",
      ].join(" ")}
      style={{
        width: size,
        height: size,
        fontFamily: "var(--font-barlow, 'Barlow Condensed', 'Arial Narrow', sans-serif)",
        fontSize: 26,
        fontWeight: 900,
        textAlign: "center",
        background: "#091808",
        border: "2px solid #00e5a0",
        color: "#00e5a0",
        borderRadius: 10,
      }}
    />
  );
}
